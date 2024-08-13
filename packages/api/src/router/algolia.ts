import type { TRPCRouterRecord } from "@trpc/server";

import { article_hit_validator } from "@acme/validators";

// import { algolia_protected } from "../algolia_elevated";
import { protectedProcedure } from "../trpc";

export const algoliaRouter = {
  create_object: protectedProcedure
    .input(article_hit_validator)
    .mutation(({ input }) => {
      /* const algolia = algolia_protected.getClient();
      const index = algolia.initIndex("novice");

      index.saveObject(input); */
    }),
} satisfies TRPCRouterRecord;
