"use server";

import fs from "node:fs";
import fs_promises from "node:fs/promises";
import { finished } from "node:stream/promises";
import { parse as csv_parse } from "csv-parse";

import type { ArticleHit } from "@acme/validators";
import { db } from "@acme/db/client";
import { Article } from "@acme/db/schema";

import type { ProblematicArticleType } from "./converter-spaghetti";
import { algolia_protected } from "~/lib/algolia-protected";

export interface CSVType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export async function read_articles() {
  await db.delete(Article);

  const csv_articles: CSVType[] = [];

  await finished(
    fs
      .createReadStream(`./assets/Objave.txt`)
      .pipe(csv_parse({ delimiter: "," }))
      .on("data", function (csvrow: string[]) {
        if (typeof csvrow[2] == "undefined" || parseInt(csvrow[2]) !== 1)
          return;
        if (!csvrow[0] || !csvrow[4] || !csvrow[6] || !csvrow[8] || !csvrow[15])
          throw new Error("Missing data: " + JSON.stringify(csvrow, null, 2));

        csv_articles.push({
          id: csvrow[0],
          title: csvrow[4],
          content: csvrow[6],
          created_at: csvrow[8],
          updated_at: csvrow[15],
        });
      }),
  );

  return csv_articles;
}

// sync just the published articles
export async function sync_with_algolia() {
  const articles = await db.query.Article.findMany({});
  const algolia = algolia_protected.getClient();
  const index = algolia.initIndex("novice");

  const empty_query_results = await index.search("", {
    attributesToRetrieve: ["objectID"],
    hitsPerPage: 1000,
  });

  index.deleteObjects(empty_query_results.hits.map((hit) => hit.objectID));

  const objects: ArticleHit[] = articles.map((article) => ({
    objectID: article.id.toString(),
    title: article.title,
    url: article.url,
    created_at: article.created_at,
    image: article.preview_image ?? undefined,
    content: article.content ?? undefined,
    published: true,
    has_draft: false,
    year: article.created_at.getFullYear().toString(),
  }));

  console.log("Syncing articles:", objects.length);

  await index.saveObjects(objects);
}

export async function write_article_html_to_file(
  problematic_articles: ProblematicArticleType[],
) {
  const some_time = Date.now();
  const dir = `./pt-novicke/${some_time}`;
  await fs_promises.mkdir(dir, { recursive: true });

  const promises = problematic_articles.map(async ({ html, csv }) => {
    return fs_promises.writeFile(`${dir}/${csv.id}.html`, html);
  });

  await Promise.all(promises);
}

export async function get_problematic_html(
  id: string,
  problematic_dir: string,
) {
  const dir = `./pt-novicke/${problematic_dir}`;
  return fs_promises.readFile(`${dir}/${id}.html`, "utf-8");
}
