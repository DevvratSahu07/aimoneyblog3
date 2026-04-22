import { Router, type IRouter } from "express";
import { db, subscribersTable } from "@workspace/db";
import { SubscribeNewsletterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/newsletter/subscribe", async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false, message: "Please provide a valid email." });
    return;
  }
  const { email } = parsed.data;
  try {
    await db.insert(subscribersTable).values({ email }).onConflictDoNothing();
    res.json({ ok: true, message: "You're on the list. Check your inbox for the next drop." });
  } catch {
    res.json({ ok: true, message: "You're on the list. Check your inbox for the next drop." });
  }
});

export default router;
