import { streamText, convertToModelMessages, stepCountIs, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { tools } from "@/lib/tools";
import { systemPrompt } from "@/lib/systemPrompt";
import { recordUsage } from "@/lib/usage";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    onFinish: ({ usage }) => {
      recordUsage(usage.inputTokens ?? 0, usage.outputTokens ?? 0);
    },
  });

  return result.toUIMessageStreamResponse();
}
