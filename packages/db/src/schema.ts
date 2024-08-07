import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export interface ArticleBlockType {
  id?: string;
  type: string;
  data: object;
}
export interface ArticleContentType {
  time?: number;
  blocks: ArticleBlockType[];
  version?: string;
}

// My schema below
export const Article = pgTable("article", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  published: boolean("published").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull() /* .$onUpdateFn(() => sql`now()`) */,
  content: json("content").$type<ArticleContentType>(),
  content_html: text("content_html").default(""),
  draft_content: json("draft_content").$type<ArticleContentType>(),
  draft_content_html: text("draft_content_html").default(""),
  preview_image: varchar("preview_image", { length: 255 }),
});

const content_zod = z
  .object({
    time: z.number().optional(),
    blocks: z.array(
      z.object({
        id: z.string().optional(),
        type: z.string(),
        data: z.record(z.any()),
      }),
    ),
    version: z.string().optional(),
  })
  .optional();

export const CreateArticleWithDateSchema = createInsertSchema(Article, {
  content: content_zod,
  draft_content: content_zod,
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateArticleSchema = createInsertSchema(Article, {
  content: content_zod,
  draft_content: content_zod,
  updated_at: z.date(),
}).omit({
  created_at: true,
});

export const UpdateArticleSchema = createInsertSchema(Article, {
  content: content_zod,
  draft_content: content_zod,
}).omit({
  created_at: true,
});

export const CreditedPeople = pgTable("credited_people", {
  id: uuid("id").notNull().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
});
