import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, postsTable, categoriesTable, resourcesTable, subscribersTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-admin-token");
  if (!ADMIN_PASSWORD || token !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.post("/admin/login", (req, res) => {
  const { password } = req.body ?? {};
  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: "Admin password is not configured on the server." });
    return;
  }
  if (typeof password !== "string" || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  res.json({ token: ADMIN_PASSWORD });
});

router.get("/admin/check", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function estimateReadMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

type CreateBody = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  categoryId?: number;
  difficulty?: string;
  incomeType?: string;
  tags?: string[];
  premium?: boolean;
  featured?: boolean;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
};

router.post("/admin/posts", requireAdmin, async (req, res, next) => {
  try {
    const b = req.body as CreateBody;
    const required: Array<[keyof CreateBody, string]> = [
      ["title", "title"],
      ["excerpt", "excerpt"],
      ["content", "content"],
      ["coverImage", "coverImage"],
      ["categoryId", "categoryId"],
      ["difficulty", "difficulty"],
      ["incomeType", "incomeType"],
      ["authorName", "authorName"],
    ];
    for (const [key, name] of required) {
      if (b[key] === undefined || b[key] === null || b[key] === "") {
        res.status(400).json({ error: `Missing field: ${name}` });
        return;
      }
    }

    const [cat] = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, Number(b.categoryId)));
    if (!cat) {
      res.status(400).json({ error: "Invalid categoryId" });
      return;
    }

    const slug = b.slug ? slugify(b.slug) : slugify(b.title!);
    if (!slug) {
      res.status(400).json({ error: "Could not derive slug" });
      return;
    }

    const [existing] = await db
      .select({ id: postsTable.id })
      .from(postsTable)
      .where(eq(postsTable.slug, slug));
    if (existing) {
      res.status(409).json({ error: "A post with this slug already exists" });
      return;
    }

    const [created] = await db
      .insert(postsTable)
      .values({
        slug,
        title: b.title!,
        excerpt: b.excerpt!,
        content: b.content!,
        coverImage: b.coverImage!,
        categoryId: Number(b.categoryId),
        difficulty: b.difficulty!,
        incomeType: b.incomeType!,
        tags: Array.isArray(b.tags) ? b.tags : [],
        premium: Boolean(b.premium),
        featured: Boolean(b.featured),
        readMinutes: estimateReadMinutes(b.content!),
        authorName: b.authorName!,
        authorRole: b.authorRole ?? "Contributor",
        authorAvatar:
          b.authorAvatar ??
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(b.authorName!)}`,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put("/admin/posts/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const b = req.body as CreateBody;
    const updates: Record<string, unknown> = {};
    if (b.title !== undefined) updates["title"] = b.title;
    if (b.excerpt !== undefined) updates["excerpt"] = b.excerpt;
    if (b.content !== undefined) {
      updates["content"] = b.content;
      updates["readMinutes"] = estimateReadMinutes(b.content);
    }
    if (b.coverImage !== undefined) updates["coverImage"] = b.coverImage;
    if (b.categoryId !== undefined) updates["categoryId"] = Number(b.categoryId);
    if (b.difficulty !== undefined) updates["difficulty"] = b.difficulty;
    if (b.incomeType !== undefined) updates["incomeType"] = b.incomeType;
    if (b.tags !== undefined) updates["tags"] = Array.isArray(b.tags) ? b.tags : [];
    if (b.premium !== undefined) updates["premium"] = Boolean(b.premium);
    if (b.featured !== undefined) updates["featured"] = Boolean(b.featured);
    if (b.authorName !== undefined) updates["authorName"] = b.authorName;
    if (b.authorRole !== undefined) updates["authorRole"] = b.authorRole;
    if (b.authorAvatar !== undefined) updates["authorAvatar"] = b.authorAvatar;
    if (b.slug !== undefined) updates["slug"] = slugify(b.slug);

    const [updated] = await db
      .update(postsTable)
      .set(updates)
      .where(eq(postsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Admin: list ALL posts including drafts
router.get("/admin/posts", requireAdmin, async (_req, res) => {
  const rows = await db
    .select({
      id: postsTable.id,
      slug: postsTable.slug,
      title: postsTable.title,
      excerpt: postsTable.excerpt,
      coverImage: postsTable.coverImage,
      categoryId: postsTable.categoryId,
      categoryName: categoriesTable.name,
      categorySlug: categoriesTable.slug,
      difficulty: postsTable.difficulty,
      incomeType: postsTable.incomeType,
      tags: postsTable.tags,
      premium: postsTable.premium,
      featured: postsTable.featured,
      published: postsTable.published,
      readMinutes: postsTable.readMinutes,
      views: postsTable.views,
      likes: postsTable.likes,
      authorName: postsTable.authorName,
      publishedAt: postsTable.publishedAt,
    })
    .from(postsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, postsTable.categoryId))
    .orderBy(desc(postsTable.publishedAt));
  res.json({ items: rows });
});

router.get("/admin/posts/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(postsTable).where(eq(postsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(row);
});

// Admin: stats summary
router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [posts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${postsTable.published})::int`,
      drafts: sql<number>`count(*) filter (where not ${postsTable.published})::int`,
      views: sql<number>`coalesce(sum(${postsTable.views}),0)::int`,
      likes: sql<number>`coalesce(sum(${postsTable.likes}),0)::int`,
    })
    .from(postsTable);
  const [cats] = await db.select({ c: sql<number>`count(*)::int` }).from(categoriesTable);
  const [resCount] = await db.select({ c: sql<number>`count(*)::int` }).from(resourcesTable);
  const [subs] = await db.select({ c: sql<number>`count(*)::int` }).from(subscribersTable);
  res.json({
    posts: posts ?? { total: 0, published: 0, drafts: 0, views: 0, likes: 0 },
    categories: cats?.c ?? 0,
    resources: resCount?.c ?? 0,
    subscribers: subs?.c ?? 0,
  });
});

// Admin: subscribers list
router.get("/admin/subscribers", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(subscribersTable).orderBy(desc(subscribersTable.createdAt));
  res.json({ items: rows });
});

// Admin: categories CRUD
router.post("/admin/categories", requireAdmin, async (req, res, next) => {
  try {
    const { slug, name, description, color, icon } = req.body ?? {};
    if (!slug || !name || !description || !color || !icon) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const slugified = slugify(slug);
    const [existing] = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slugified));
    if (existing) {
      res.status(409).json({ error: "Slug already exists" });
      return;
    }
    const [created] = await db
      .insert(categoriesTable)
      .values({ slug: slugified, name, description, color, icon })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put("/admin/categories/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const { slug, name, description, color, icon } = req.body ?? {};
    const updates: Record<string, unknown> = {};
    if (slug !== undefined) updates["slug"] = slugify(slug);
    if (name !== undefined) updates["name"] = name;
    if (description !== undefined) updates["description"] = description;
    if (color !== undefined) updates["color"] = color;
    if (icon !== undefined) updates["icon"] = icon;
    const [updated] = await db
      .update(categoriesTable)
      .set(updates)
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [hasPost] = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.categoryId, id))
    .limit(1);
  if (hasPost) {
    res.status(409).json({ error: "Cannot delete a category that contains posts" });
    return;
  }
  const [deleted] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .returning({ id: categoriesTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json({ ok: true });
});

// Admin: resources CRUD
router.post("/admin/resources", requireAdmin, async (req, res, next) => {
  try {
    const { title, description, url, category, pricing, tags, logo } = req.body ?? {};
    if (!title || !description || !url || !category || !pricing || !logo) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [created] = await db
      .insert(resourcesTable)
      .values({
        title,
        description,
        url,
        category,
        pricing,
        tags: Array.isArray(tags) ? tags : [],
        logo,
      })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put("/admin/resources/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const { title, description, url, category, pricing, tags, logo } = req.body ?? {};
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates["title"] = title;
    if (description !== undefined) updates["description"] = description;
    if (url !== undefined) updates["url"] = url;
    if (category !== undefined) updates["category"] = category;
    if (pricing !== undefined) updates["pricing"] = pricing;
    if (logo !== undefined) updates["logo"] = logo;
    if (tags !== undefined) updates["tags"] = Array.isArray(tags) ? tags : [];
    const [updated] = await db
      .update(resourcesTable)
      .set(updates)
      .where(eq(resourcesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/resources/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db
    .delete(resourcesTable)
    .where(eq(resourcesTable.id, id))
    .returning({ id: resourcesTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  res.json({ ok: true });
});

router.delete("/admin/posts/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [deleted] = await db.delete(postsTable).where(eq(postsTable.id, id)).returning({ id: postsTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({ ok: true });
});

export default router;
