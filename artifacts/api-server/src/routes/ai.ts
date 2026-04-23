import { Router, type IRouter } from "express";
import { AiChatBody } from "@workspace/api-zod";
import { aiEnabled, openai } from "../lib/openai";

const router: IRouter = Router();

const fallbackSuggestions = [
  "Best AI tools for beginners",
  "How to start an AI side hustle",
  "Passive income with AI in 2026",
  "Freelance with AI: where to start",
];

router.post("/ai/chat", async (req, res, next) => {
  try {
    const parsed = AiChatBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ reply: "Please send a valid message.", suggestions: fallbackSuggestions });
      return;
    }
    const { message, history } = parsed.data;

    if (!aiEnabled) {
      res.json({
        reply:
          "AI is offline right now, but here are some directions worth exploring: pick one tool, learn it deeply, and build a small repeatable service around it.",
        suggestions: fallbackSuggestions,
      });
      return;
    }

    const messages = [
      {
        role: "system" as const,
        content:
          "You are the AI Money Info assistant. You help readers turn AI into income — side hustles, freelancing, content, automation, and SaaS. Be concrete, specific, and friendly. Avoid hype. Keep answers under 200 words. After your reply, internally consider 3 short follow-up questions a curious reader would ask next. Respond ONLY as JSON with shape: {\"reply\": string, \"suggestions\": string[3]}. No markdown fences.",
      },
      ...((history ?? []).map((t) => ({ role: t.role, content: t.content })) as Array<{ role: "user" | "assistant"; content: string }>),
      { role: "user" as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 800,
      messages,
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    const parsedJson = JSON.parse(text);
    res.json({
      reply: typeof parsedJson.reply === "string" ? parsedJson.reply : "I'm not sure yet — try rephrasing?",
      suggestions: Array.isArray(parsedJson.suggestions)
        ? parsedJson.suggestions.filter((s: unknown): s is string => typeof s === "string").slice(0, 4)
        : fallbackSuggestions,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
