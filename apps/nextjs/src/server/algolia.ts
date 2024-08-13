"use server";

import type { ArticleHit } from "@acme/validators";
import { article_hit_validator } from "@acme/validators";

import { algolia_protected } from "~/lib/algolia-protected";

export async function create_algolia_article(input: ArticleHit) {
  const validated = article_hit_validator.parse(input);
  const algolia = algolia_protected.getClient();
  const index = algolia.initIndex("novice");

  await index.saveObject(validated);
}

export async function update_algolia_article(input: Partial<ArticleHit>) {
  const validated = article_hit_validator.partial().parse(input);
  const algolia = algolia_protected.getClient();
  const index = algolia.initIndex("novice");

  await index.partialUpdateObject(validated);
}

export async function delete_algolia_article(objectID: string) {
  const algolia = algolia_protected.getClient();
  const index = algolia.initIndex("novice");

  await index.deleteObject(objectID);
}
