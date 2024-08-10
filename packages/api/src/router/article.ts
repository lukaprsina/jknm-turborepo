import type { TRPCRouterRecord } from "@trpc/server";
import { getTableColumns } from "drizzle-orm";
import { z } from "zod";

import { and, count, desc, eq, sql } from "@acme/db";
import {
  Article,
  CreateArticleSchema,
  CreateArticleWithDateSchema,
  UpdateArticleSchema,
} from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

/* rank: sql`ts_rank(${matchQuery(input)})`,
        rankCd: sql`ts_rank_cd(${matchQuery(input)})`, */

const matchQuery = (search: string) => sql`(
  setweight(to_tsvector('serbian', ${Article.title}), 'A')
), plainto_tsquery('serbian', ${search})`;

export const articleRouter = {
  fullTextSearch: publicProcedure
    .input(
      z.object({
        search: z.string(),
        rank_weight: z.number().default(0.4),
        rank_cd_weight: z.number().default(0.6),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db
        .select({
          ...getTableColumns(Article),
          combined_rank: sql`${input.rank_weight} * ts_rank(${matchQuery(input.search)}) + ${input.rank_cd_weight} * ts_rank_cd(${matchQuery(input.search)})`,
        })
        .from(Article)
        .where(
          and(
            eq(Article.published, true),
            sql`(
      setweight(to_tsvector('serbian', ${Article.title}), 'A')
      ) @@ to_tsquery('serbian', ${input.search})`,
          ),
        )
        .orderBy((table) => desc(table.combined_rank));
    }),

  count: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        count: count(Article.id),
      })
      .from(Article)
      .where(eq(Article.published, true));
  }),

  countProtected: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        count: count(Article.id),
      })
      .from(Article);
  }),

  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    return ctx.db.query.Article.findMany({
      where: eq(Article.published, true),
      orderBy: desc(Article.created_at),
      limit: 10,
    });
  }),

  allWithOffset: publicProcedure
    .input(z.object({ offset: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Article.findMany({
        where: eq(Article.published, true),
        orderBy: desc(Article.created_at),
        offset: input.offset,
        limit: 10,
      });
    }),

  allProtected: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Article.findMany({
      orderBy: desc(Article.created_at),
      limit: 10,
    });
  }),

  allProtectedWithOffset: protectedProcedure
    .input(z.object({ offset: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Article.findMany({
        where: eq(Article.published, true),
        orderBy: desc(Article.created_at),
        offset: input.offset,
        limit: 10,
      });
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      return ctx.db.query.Article.findFirst({
        where: and(eq(Article.id, input.id), eq(Article.published, true)),
      });
    }),

  byIdProtected: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      return ctx.db.query.Article.findFirst({
        where: eq(Article.id, input.id),
      });
    }),

  /* byUrl: publicProcedure
    .input(z.object({ url: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      return ctx.db.query.Article.findFirst({
        where: and(eq(Article.url, input.url), eq(Article.published, true)),
      });
    }),

  byUrlProtected: protectedProcedure
    .input(z.object({ url: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Article.findFirst({
        where: eq(Article.url, input.url),
      });
    }), */

  create: protectedProcedure
    .input(CreateArticleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Article).values(input).returning({ id: Article.id });
    }),

  createWithDate: protectedProcedure
    .input(CreateArticleWithDateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Article).values(input).returning({ id: Article.id });
    }),

  save: protectedProcedure
    .input(UpdateArticleSchema)
    .mutation(({ ctx, input }) => {
      if (!input.id) return;
      return ctx.db
        .update(Article)
        .set(input)
        .where(eq(Article.id, input.id))
        .returning({ id: Article.id });
    }),

  delete: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Article).where(eq(Article.id, input));
  }),
} satisfies TRPCRouterRecord;
