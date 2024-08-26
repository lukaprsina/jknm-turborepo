import type { TRPCRouterRecord } from "@trpc/server";
import { withCursorPagination } from "drizzle-pagination";
import { z } from "zod";

import { and, desc, eq } from "@acme/db";
import {
  Article,
  CreateArticleSchema,
  CreateArticleWithDateSchema,
} from "@acme/db/schema";
import { content_validator } from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const articleRouter = {
  last_n: publicProcedure.input(z.number()).query(({ ctx, input }) => {
    return ctx.db.query.Article.findMany({
      limit: input,
      orderBy: desc(Article.created_at),
      where: !ctx.session ? eq(Article.published, true) : undefined,
      with: {
        credited_people: {
          with: {
            credited_people: true,
          },
        },
      },
    });
  }),

  infinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(50),
        cursor: z.date().optional(),
        direction: z.enum(["forward", "backward"]).optional(),
        show_drafts: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.warn("input", input);
      const direction = input.direction == "forward" ? "desc" : "asc";

      const data = await ctx.db.query.Article.findMany({
        ...withCursorPagination({
          limit: input.limit,
          cursors: [[Article.created_at, direction, input.cursor]],
          where:
            ctx.session && input.show_drafts
              ? undefined
              : eq(Article.published, true),
        }),
        with: {
          credited_people: {
            with: {
              credited_people: true,
            },
          },
        },
      });

      console.log("data", data.length);

      const last = data[data.length - 1];

      return {
        data,
        nextCursor: last?.created_at,
      };
    }),

  by_id: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      // TODO: when url doesn't match, send me an email
      return ctx.db.query.Article.findFirst({
        where: ctx.session
          ? eq(Article.id, input.id)
          : and(eq(Article.id, input.id), eq(Article.published, true)),
        with: {
          credited_people: {
            with: {
              credited_people: true,
            },
          },
        },
      });
    }),

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
        // content: content_validator,
        // preview_image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.id) return;

      const article = await ctx.db.query.Article.findFirst({
        where: eq(Article.id, input.id),
      });

      if (!article) return;

      return ctx.db
        .update(Article)
        .set({
          draft_content: article.content,
          draft_preview_image: article.preview_image,
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
