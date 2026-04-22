import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { categoriesTable } from "./categories";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  difficulty: text("difficulty").notNull(),
  incomeType: text("income_type").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  premium: boolean("premium").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  readMinutes: integer("read_minutes").notNull().default(5),
  views: integer("views").notNull().default(0),
  likes: integer("likes").notNull().default(0),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(),
  authorAvatar: text("author_avatar").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Post = typeof postsTable.$inferSelect;
export type InsertPost = typeof postsTable.$inferInsert;
