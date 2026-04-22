import { Router, type IRouter } from "express";
import { db, postsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/tags/popular", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 12) || 12, 50);
  const rows = await db.execute(sql`
    SELECT tag, count(*)::int as count
    FROM ${postsTable}, jsonb_array_elements_text(${postsTable.tags}) as tag
    GROUP BY tag
    ORDER BY count DESC
    LIMIT ${limit}
  `);
  res.json((rows.rows as { tag: string; count: number }[]).map((r) => ({ tag: r.tag, count: r.count })));
});

export default router;
