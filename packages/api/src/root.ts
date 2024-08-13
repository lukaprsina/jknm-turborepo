import { algoliaRouter } from "./router/algolia";
import { articleRouter } from "./router/article";
import { authRouter } from "./router/auth";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  article: articleRouter,
  algolia: algoliaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
