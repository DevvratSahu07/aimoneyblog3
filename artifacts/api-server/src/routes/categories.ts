import { Router, type IRouter } from "express";
import { db, categoriesTable, postsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      name: categoriesTable.name,
      description: categoriesTable.description,
      color: categoriesTable.color,
      icon: categoriesTable.icon,
      postCount: sql<number>`count(${postsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(postsTable, eq(postsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.name);
  res.json(rows);
});

router.get("/categories/:slug", async (req, res) => {
  const slug = req.params.slug;
  const [row] = await db
    .select({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      name: categoriesTable.name,
      description: categoriesTable.description,
      color: categoriesTable.color,
      icon: categoriesTable.icon,
      postCount: sql<number>`count(${postsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(postsTable, eq(postsTable.categoryId, categoriesTable.id))
    .where(eq(categoriesTable.slug, slug))
    .groupBy(categoriesTable.id);
  if (!row) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(row);
});

export default router;
