import { articleRouter } from "./router/article";
import { authRouter } from "./router/auth";
// import { awsRouter } from "./router/aws";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  article: articleRouter,
  // aws: awsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
