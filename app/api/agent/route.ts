import { streamText, convertToModelMessages, stepCountIs, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { tools } from "@/lib/tools";
import { systemPrompt } from "@/lib/systemPrompt";
import { recordUsage } from "@/lib/usage";
import { saveDigest } from "@/lib/digest";
import { setCached } from "@/lib/cache";
import { parseMood, parseComponents, parseProse } from "@/lib/parseResponse";
import { MODEL_ID, INPUT_COST_PER_TOKEN, OUTPUT_COST_PER_TOKEN } from "@/lib/config";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(10),
    onFinish: async ({ text, usage }) => {
      const inputTokens = usage.inputTokens ?? 0;
      const outputTokens = usage.outputTokens ?? 0;
      recordUsage(inputTokens, outputTokens);
      const record = await saveDigest({
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
