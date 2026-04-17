import { streamText, convertToModelMessages, stepCountIs, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { tools } from "@/lib/tools";
import { systemPrompt } from "@/lib/systemPrompt";
import { recordUsage } from "@/lib/usage";
import { saveDigest } from "@/lib/digest";
import { setCached } from "@/lib/cache";
import { parseMood, parseComponents, parseProse } from "@/lib/parseResponse";

const INPUT_COST_PER_TOKEN = 0.80 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 5.00 / 1_000_000;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    onFinish: ({ text, usage }) => {
      const inputTokens = usage.inputTokens ?? 0;
      const outputTokens = usage.outputTokens ?? 0;
      recordUsage(inputTokens, outputTokens);
      const record = saveDigest({
        mood: parseMood(text),
        prose: parseProse(text),
        components: parseComponents(text),
        rawText: text,
        usage: {
          inputTokens,
          outputTokens,
          costUsd: inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN,
        },
      });
      setCached(record.date, record);
    },
  });

  return result.toUIMessageStreamResponse();
}
