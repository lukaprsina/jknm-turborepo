import { articleRouter } from "./router/article";
import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  article: articleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
