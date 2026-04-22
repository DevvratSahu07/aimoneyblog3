import { Router, type IRouter } from "express";
import { db, postsTable, categoriesTable } from "@workspace/db";
import { and, desc, eq, ilike, or, sql, ne } from "drizzle-orm";
import { aiEnabled, openai } from "../lib/openai";

const router: IRouter = Router();

type Row = typeof postsTable.$inferSelect & {
  catId: number;
  catSlug: string;
  catName: string;
  catDescription: string;
  catColor: string;
  catIcon: string;
  catPostCount: number;
};

function shape(row: Row, includeContent = false) {
  const base = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    category: {
      id: row.catId,
      slug: row.catSlug,
      name: row.catName,
      description: row.catDescription,
      color: row.catColor,
      icon: row.catIcon,
      postCount: row.catPostCount ?? 0,
    },
    difficulty: row.difficulty,
    incomeType: row.incomeType,
    tags: row.tags ?? [],
    premium: row.premium,
    featured: row.featured,
    published: row.published,
    readMinutes: row.readMinutes,
    views: row.views,
    likes: row.likes,
    author: {
      name: row.authorName,
      role: row.authorRole,
      avatar: row.authorAvatar,
    },
    publishedAt: row.publishedAt.toISOString(),
  };
  if (includeContent) {
    return { ...base, content: row.content };
  }
  return base;
}

const baseSelect = {
  id: postsTable.id,
  slug: postsTable.slug,
  title: postsTable.title,
  excerpt: postsTable.excerpt,
  content: postsTable.content,
  coverImage: postsTable.coverImage,
  categoryId: postsTable.categoryId,
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
  authorRole: postsTable.authorRole,
  authorAvatar: postsTable.authorAvatar,
  publishedAt: postsTable.publishedAt,
  catId: categoriesTable.id,
  catSlug: categoriesTable.slug,
  catName: categoriesTable.name,
  catDescription: categoriesTable.description,
  catColor: categoriesTable.color,
  catIcon: categoriesTable.icon,
  catPostCount: sql<number>`0`,
};

router.get("/posts", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : undefined;
  const incomeType = typeof req.query.incomeType === "string" ? req.query.incomeType : undefined;
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const premium = req.query.premium === "true" ? true : req.query.premium === "false" ? false : undefined;
  const sort = typeof req.query.sort === "string" ? req.query.sort : "recent";
  const limit = Math.min(Number(req.query.limit ?? 20) || 20, 50);
  const offset = Math.max(Number(req.query.offset ?? 0) || 0, 0);

  const conditions = [] as ReturnType<typeof eq>[];
  conditions.push(eq(postsTable.published, true));
  if (category) conditions.push(eq(categoriesTable.slug, category));
  if (difficulty) conditions.push(eq(postsTable.difficulty, difficulty));
  if (incomeType) conditions.push(eq(postsTable.incomeType, incomeType));
  if (premium !== undefined) conditions.push(eq(postsTable.premium, premium));
  if (tag) conditions.push(sql`${postsTable.tags} ? ${tag}` as never);
  if (search) {
    conditions.push(
      or(
        ilike(postsTable.title, `%${search}%`),
        ilike(postsTable.excerpt, `%${search}%`),
        ilike(postsTable.content, `%${search}%`),
      ) as never,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    sort === "popular"
      ? [desc(postsTable.views), desc(postsTable.publishedAt)]
      : sort === "trending"
        ? [desc(postsTable.likes), desc(postsTable.views)]
        : [desc(postsTable.publishedAt)];

  const rows = await db
    .select(baseSelect)
    .from(postsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, postsTable.categoryId))
    .where(where)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  const [count] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(postsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, postsTable.categoryId))
    .where(where);

  res.json({
    items: rows.map((r) => shape(r as Row)),
    total: count?.c ?? 0,
    limit,
    offset,
  });
});

router.get("/posts/trending", async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 6) || 6, 20);
  const rows = await db
    .select(baseSelect)
    .from(postsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, postsTable.categoryId))
    .where(eq(postsTable.published, true))
    .orderBy(desc(postsTable.views), desc(postsTable.likes))
    .limit(limit);
  res.json(rows.map((r) => shape(r as Row)));
});

router.get("/posts/featured", async (_req, res) => {
  const rows = await db
    .select(baseSelect)
    .from(postsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, postsTable.categoryId))
    .where(and(eq(postsTable.featured, true), eq(postsTable.published, true)))
    .orderBy(desc(postsTable.publishedAt));
  res.json(rows.map((r) => shape(r as Row)));
});

router.get("/posts/:slug", async (req, res) => {
  const [row] = await db
    .select(baseSelect)
    .from(postsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, postsTable.categoryId))
    .where(and(eq(postsTable.slug, req.params.slug), eq(postsTable.published, true)));
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(shape(row as Row, true));
});

router.post("/posts/:slug/view", async (req, res) => {
  const [row] = await db
    .update(postsTable)
    .set({ views: sql`${postsTable.views} + 1` })
    .where(eq(postsTable.slug, req.params.slug))
    .returning({ count: postsTable.views });
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({ count: row.count });
});

router.post("/posts/:slug/like", async (req, res) => {
  const [row] = await db
    .update(postsTable)
    .set({ likes: sql`${postsTable.likes} + 1` })
    .where(eq(postsTable.slug, req.params.slug))
    .returning({ count: postsTable.likes });
  if (!row) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({ count: row.count });
});

router.get("/posts/:slug/related", async (req, res) => {
  const [post] = await db
    .select({ id: postsTable.id, categoryId: postsTable.categoryId })
    .from(postsTable)
    .where(eq(postsTable.slug, req.params.slug));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  const rows = await db
    .select(baseSelect)
    .from(postsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, postsTable.categoryId))
    .where(and(eq(postsTable.categoryId, post.categoryId), ne(postsTable.id, post.id)))
    .orderBy(desc(postsTable.views))
    .limit(4);
  res.json(rows.map((r) => shape(r as Row)));
});

router.get("/posts/:slug/summary", async (req, res, next) => {
  try {
    const [row] = await db
      .select({ title: postsTable.title, excerpt: postsTable.excerpt, content: postsTable.content })
      .from(postsTable)
      .where(eq(postsTable.slug, req.params.slug));
    if (!row) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (!aiEnabled) {
      res.json({
        tldr: row.excerpt,
        keyTakeaways: row.content
          .split(/\n+/)
          .filter((l) => l.startsWith("- ") || l.startsWith("* "))
          .slice(0, 4)
          .map((l) => l.replace(/^[-*]\s*/, "")),
      });
      return;
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 600,
      messages: [
        {
          role: "system",
          content:
            "You are an editor for an AI-money blog. Read the article and produce a JSON object with: tldr (2-3 sentence plain summary) and keyTakeaways (3-5 short, action-oriented bullet points). Respond ONLY with JSON, no markdown fences.",
        },
        {
          role: "user",
          content: `Title: ${row.title}\n\nExcerpt: ${row.excerpt}\n\nArticle:\n${row.content}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const text = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    res.json({
      tldr: typeof parsed.tldr === "string" ? parsed.tldr : row.excerpt,
      keyTakeaways: Array.isArray(parsed.keyTakeaways)
        ? parsed.keyTakeaways.filter((x: unknown): x is string => typeof x === "string").slice(0, 6)
        : [],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
