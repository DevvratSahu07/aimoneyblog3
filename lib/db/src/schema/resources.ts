import { pgTable, serial, text, jsonb } from "drizzle-orm/pg-core";

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  pricing: text("pricing").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  logo: text("logo").notNull(),
});

export type Resource = typeof resourcesTable.$inferSelect;
export type InsertResource = typeof resourcesTable.$inferInsert;
