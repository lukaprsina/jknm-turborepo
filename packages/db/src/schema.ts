import { TDescendant, TElement, Value } from "@udecode/plate-common/server";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const Post = pgTable("post", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("name", { length: 256 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
});

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const User = pgTable("user", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
});

export const UserRelations = relations(User, ({ many }) => ({
  accounts: many(Account),
}));

export const Account = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<"email" | "oauth" | "oidc" | "webauthn">()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const AccountRelations = relations(Account, ({ one }) => ({
  user: one(User, { fields: [Account.userId], references: [User.id] }),
}));

export const Session = pgTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  expires: timestamp("expires", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));

// My schema below
export const Article = pgTable("article", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  url: varchar("url", { length: 255 }).notNull().unique(),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).$onUpdateFn(() => sql`now()`),
  contentHtml: text("content_html").default(""),
  content: json("content").$type<Value>().default([]),
  draftContent: json("draft_content").$type<Value>().default([]),
  previewImage: varchar("preview_image", { length: 255 }),
  imageSizes: json("image_sizes"),
});

export const CreateArticleSchema = createInsertSchema(Article, {
  title: z.string().max(255),
  url: z.string().max(255),
  published: z.boolean().optional(),
  publishedAt: z.date().optional(),
  contentHtml: z.string(),
  previewImage: z.string().max(255),
  imageSizes: z
    .record(
      z.string(),
      z.object({
        width: z.number(),
        height: z.number(),
      }),
    )
    .optional(),
}).omit({
  id: true,
  updatedAt: true,
  content: true,
  draftContent: true,
});

export const UpdateArticleSchema = createInsertSchema(Article, {
  title: z.string().max(255),
  url: z.string().max(255),
  published: z.boolean().optional(),
  publishedAt: z.date().optional(),
  contentHtml: z.string(),
  content: z
    .array(
      z.object({
        children: z.array(z.any()),
        type: z.string(),
      }),
    )
    .optional(),
  previewImage: z.string().max(255),
  imageSizes: z
    .record(
      z.string(),
      z.object({
        width: z.number(),
        height: z.number(),
      }),
    )
    .optional(),
}).omit({
  id: true,
  updatedAt: true,
  draftContent: true,
});

export const CreditedPeople = pgTable("credited_people", {
  id: uuid("id").notNull().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
});
