import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, count, desc, eq } from "@acme/db";
import {
  Article,
  CreateArticleSchema,
  CreateArticleWithDateSchema,
} from "@acme/db/schema";
import { content_validator } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const articleRouter = {
  count: publicProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        count: count(Article.id),
      })
      .from(Article)
      .where(eq(Article.published, true));
  }),

  count_protected: protectedProcedure.query(({ ctx }) => {
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

  all_with_offset: publicProcedure
    .input(z.object({ offset: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Article.findMany({
        where: eq(Article.published, true),
        orderBy: desc(Article.created_at),
        offset: input.offset,
        limit: 10,
      });
    }),

  all_protected: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Article.findMany({
      orderBy: desc(Article.created_at),
      limit: 10,
    });
  }),

  all_protected_with_offset: protectedProcedure
    .input(z.object({ offset: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Article.findMany({
        where: eq(Article.published, true),
        orderBy: desc(Article.created_at),
        offset: input.offset,
        limit: 10,
      });
    }),

  by_id: publicProcedure
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

  by_id_protected: protectedProcedure
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

  create_article: protectedProcedure
    .input(CreateArticleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Article).values(input).returning({ id: Article.id });
    }),

  create_article_with_date: protectedProcedure
    .input(CreateArticleWithDateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Article).values(input).returning({ id: Article.id });
    }),

  create_draft: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.id) return;

      const article = await ctx.db.query.Article.findFirst({
        where: eq(Article.id, input.id),
      });

      if (!article?.id) return;

      return ctx.db
        .update(Article)
        .set({
          draft_content: article.content,
          draft_preview_image: article.preview_image,
        })
        .where(eq(Article.id, input.id))
        .returning({ id: Article.id, url: Article.url });
    }),

  save_draft: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        draft_content: content_validator,
        draft_preview_image: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      if (!input.id) return;
      return ctx.db
        .update(Article)
        .set({
          draft_content: input.draft_content,
          draft_preview_image: input.draft_preview_image,
        })
        .where(eq(Article.id, input.id))
        .returning({ id: Article.id });
    }),

  publish_draft: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: content_validator,
        preview_image: z.string(),
        title: z.string(),
        url: z.string(),
        published: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      if (!input.id) return;
      return ctx.db
        .update(Article)
        .set({
          content: input.content,
          preview_image: input.preview_image,
          title: input.title,
          url: input.url,
          published: input.published,
          draft_content: null,
          draft_preview_image: null,
        })
        .where(eq(Article.id, input.id))
        .returning({ id: Article.id, url: Article.url });
    }),

  unpublish: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.id) return;

      return ctx.db
        .update(Article)
        .set({
          content: null,
          preview_image: null,
          published: false,
        })
        .where(eq(Article.id, input.id))
        .returning({ id: Article.id, url: Article.url });
    }),

  delete: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Article).where(eq(Article.id, input));
  }),
} satisfies TRPCRouterRecord;
