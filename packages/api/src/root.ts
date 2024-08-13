import { articleRouter } from "./router/article";
import { authRouter } from "./router/auth";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  article: articleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
