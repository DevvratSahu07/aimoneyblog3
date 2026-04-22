import { Router, type IRouter } from "express";
import { db, resourcesTable } from "@workspace/db";
import { and, eq, ilike, or, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/resources", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const pricing = typeof req.query.pricing === "string" ? req.query.pricing : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const limit = Math.min(Number(req.query.limit ?? 30) || 30, 60);

  const conditions = [] as ReturnType<typeof eq>[];
  if (category) conditions.push(eq(resourcesTable.category, category));
  if (pricing) conditions.push(eq(resourcesTable.pricing, pricing));
  if (search) {
    conditions.push(
      or(
        ilike(resourcesTable.title, `%${search}%`),
        ilike(resourcesTable.description, `%${search}%`),
      ) as never,
    );
  }

  const rows = await db
    .select()
    .from(resourcesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${resourcesTable.title} asc`)
    .limit(limit);

  res.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.url,
      category: r.category,
      pricing: r.pricing,
      tags: r.tags ?? [],
      logo: r.logo,
    })),
  );
});

export default router;
