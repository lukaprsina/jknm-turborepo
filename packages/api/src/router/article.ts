import type { TRPCRouterRecord } from "@trpc/server";
import type { JWTInput } from "google-auth-library";
import { withCursorPagination } from "drizzle-pagination";
import { google } from "googleapis";
import { z } from "zod";

import { and, eq } from "@acme/db";
import {
  Article,
  CreateArticleSchema,
  CreateArticleWithDateSchema,
} from "@acme/db/schema";
import { content_validator } from "@acme/validators";

import type { GoogleAdminUser } from "..";
import { protectedProcedure, publicProcedure } from "../trpc";

export const articleRouter = {
  infinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(50),
        cursor: z.date().optional(),
        direction: z.enum(["forward", "backward"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const direction = input.direction === "backward" ? "asc" : "desc";

      const data = await ctx.db.query.Article.findMany({
        ...withCursorPagination({
          limit: input.limit,
          cursors: [[Article.created_at, direction, input.cursor]],
          where: ctx.session ? undefined : eq(Article.published, true),
        }),
      });

      console.log(
        "data",
        data.length,
        data.at(0)?.title,
        data.at(data.length - 1)?.title,
        input,
      );

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
        author_ids: z.array(z.string()),
        custom_author_names: z.array(z.string()),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(Article)
        .set({
          id: input.id,
          created_at: input.created_at,
          content: input.content,
          preview_image: input.preview_image,
          title: input.title,
          url: input.url,
          author_ids: input.author_ids,
          custom_author_names: input.custom_author_names,

          // lol
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

  google_users: protectedProcedure.query(async () => {
    console.log("GETTING GOOGLE USERS");
    const credentials = process.env.JKNM_SERVICE_ACCOUNT_CREDENTIALS;
    if (!credentials) {
      console.error("No credentials found");
      return;
    }

    const credentials_text = atob(credentials);
    const credentials_json = JSON.parse(credentials_text) as Partial<JWTInput>;
    const google_client = await google.auth.getClient({
      credentials: credentials_json,
      scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
    });

    const service = google.admin({
      version: "directory_v1",
      auth: google_client,
    });

    const result = await service.users.list({
      customer: "C049fks0l",
    });

    if (!result.data.users) {
      console.error("No users found", result);
      // revalidateTag("get_users");
      return;
    }

    const mapped_users = result.data.users.map(
      (user) =>
        ({
          id: user.id ?? undefined,
          email: user.primaryEmail ?? undefined,
          name: user.name?.fullName ?? undefined,
          suspended: user.suspended ?? undefined,
          thumbnail: user.thumbnailPhotoUrl ?? undefined,
        }) satisfies GoogleAdminUser,
    );

    console.log("GOT GOOGLE USERS", mapped_users.length);
    return mapped_users;
  }),
} satisfies TRPCRouterRecord;
