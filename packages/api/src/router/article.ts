import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@acme/db";
import {
  Article,
  CreateArticleSchema,
  UpdateArticleSchema,
} from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const articleRouter = {
  all: publicProcedure.query(({ ctx }) => {
    // return ctx.db.select().from(schema.post).orderBy(desc(schema.post.id));
    return ctx.db.query.Article.findMany({
      where: eq(Article.published, true),
      orderBy: desc(Article.createdAt),
      limit: 10,
    });
  }),

  allProtected: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.Article.findMany({
      orderBy: desc(Article.createdAt),
      limit: 10,
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      // return ctx.db
      //   .select()
      //   .from(schema.post)
      //   .where(eq(schema.post.id, input.id));

      return ctx.db.query.Article.findFirst({
        where: and(eq(Article.id, input.id), eq(Article.published, true)),
      });
    }),

  byUrl: publicProcedure
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
    }),

  create: protectedProcedure
    .input(CreateArticleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Article).values(input);
    }),

  save: protectedProcedure
    .input(UpdateArticleSchema)
    .mutation(({ ctx, input }) => {
      if (!input.id) return;
      return ctx.db.update(Article).set(input).where(eq(Article.id, input.id));
    }),

  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.delete(Article).where(eq(Article.id, input));
  }),
} satisfies TRPCRouterRecord;
