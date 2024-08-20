import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { asc, eq, gt, lt } from "@acme/db";
import {
  Article,
  CreateArticleSchema,
  CreateArticleWithDateSchema,
} from "@acme/db/schema";
import { content_validator } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const articleRouter = {
  infinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(50),
        cursor: z.date().optional(), // <-- "cursor" needs to exist, but can be any type
        direction: z
          .enum(["forward", "backward"])
          .optional()
          .default("forward"), // optional, useful for bi-directional query
        show_drafts: z.boolean().optional().default(false),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db
        .select()
        .from(Article)
        .where(
          input.cursor
            ? input.direction == "forward"
              ? gt(Article.created_at, input.cursor)
              : lt(Article.created_at, input.cursor)
            : undefined,
        ) // if cursor is provided, get rows after it
        .limit(input.limit) // the number of rows to return
        .orderBy(asc(Article.id));
    }),
  /* all: publicProcedure.query(({ ctx }) => {
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
    }), */

  create_article: protectedProcedure
    .input(CreateArticleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(Article)
        .values({ updated_at: new Date(), created_at: new Date(), ...input })
        .returning();
    }),

  create_article_with_date: protectedProcedure
    .input(CreateArticleWithDateSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .insert(Article)
        .values({ updated_at: new Date(), created_at: new Date(), ...input })
        .returning();
    }),

  create_draft: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: content_validator,
        preview_image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.id) return;

      return ctx.db
        .update(Article)
        .set({
          draft_content: input.content,
          draft_preview_image: input.preview_image,
        })
        .where(eq(Article.id, input.id))
        .returning();
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
      return ctx.db
        .update(Article)
        .set(input)
        .where(eq(Article.id, input.id))
        .returning({ id: Article.id });
    }),

  publish: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        created_at: z.date(),
        content: content_validator,
        preview_image: z.string(),
        title: z.string(),
        url: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(Article)
        .set({
          ...input,
          published: true,
          draft_content: null,
          draft_preview_image: null,
          updated_at: new Date(),
        })
        .where(eq(Article.id, input.id))
        .returning();
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

  delete_draft: protectedProcedure
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
          draft_content: null,
          draft_preview_image: null,
        })
        .where(eq(Article.id, input.id))
        .returning({ id: Article.id, url: Article.url });
    }),

  delete: protectedProcedure.input(z.number()).mutation(({ ctx, input }) => {
    return ctx.db
      .delete(Article)
      .where(eq(Article.id, input))
      .returning({ id: Article.id, url: Article.url });
  }),
} satisfies TRPCRouterRecord;
