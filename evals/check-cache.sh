#!/bin/bash

ENV_FILE="$(dirname "$0")/../.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env.local not found at $ENV_FILE"
  exit 1
fi

REDIS_URL=$(grep -E "^REDIS_URL=" "$ENV_FILE" | cut -d'"' -f2)
if [ -z "$REDIS_URL" ]; then
  echo "Error: REDIS_URL not found in .env.local"
  exit 1
fi

HOST=$(echo "$REDIS_URL" | sed -E 's|redis://[^@]+@([^:]+):.*|\1|')
PORT=$(echo "$REDIS_URL" | sed -E 's|.*:([0-9]+)$|\1|')
PASS=$(echo "$REDIS_URL" | sed -E 's|redis://[^:]+:([^@]+)@.*|\1|')

cli() {
  redis-cli -h "$HOST" -p "$PORT" -a "$PASS" --no-auth-warning "$@"
}

echo "=== Keys ==="
cli keys "*"

echo ""
echo "=== Digests ==="
for key in $(cli keys "digest:*"); do
  echo ""
  echo "--- $key ---"
  cli get "$key" | python3 -m json.tool 2>/dev/null || cli get "$key"
done

echo ""
echo "=== Usage ==="
input=$(cli get usage:inputTokens)
output=$(cli get usage:outputTokens)
cost=$(cli get usage:costUsd)
sessions=$(cli get usage:sessionCount)
echo "  Input tokens:  ${input:-0}"
echo "  Output tokens: ${output:-0}"
echo "  Cost (USD):    $(python3 -c "print(f'\${int('${cost:-0}') / 1_000_000_000:.6f}')" 2>/dev/null || echo "${cost:-0}")"
echo "  Sessions:      ${sessions:-0}"
