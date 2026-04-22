import { Router, type IRouter } from "express";
import { db, postsTable, categoriesTable, resourcesTable, subscribersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  const [posts] = await db.select({ c: sql<number>`count(*)::int`, reads: sql<number>`coalesce(sum(${postsTable.views}), 0)::int` }).from(postsTable);
  const [cats] = await db.select({ c: sql<number>`count(*)::int` }).from(categoriesTable);
  const [resources] = await db.select({ c: sql<number>`count(*)::int` }).from(resourcesTable);
  const [subs] = await db.select({ c: sql<number>`count(*)::int` }).from(subscribersTable);
  res.json({
    totalPosts: posts?.c ?? 0,
    totalCategories: cats?.c ?? 0,
    totalResources: resources?.c ?? 0,
    totalReads: posts?.reads ?? 0,
    totalSubscribers: subs?.c ?? 0,
  });
});

export default router;
