import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    ALGOLIA_ADMIN_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_ALGOLIA_ID: z.string(),
    NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ALGOLIA_ID: process.env.NEXT_PUBLIC_ALGOLIA_ID,
    NEXT_PUBLIC_ALGOLIA_SEARCH_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
