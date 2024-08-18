"use server";

import fs from "node:fs";
import fs_promises from "node:fs/promises";
import { finished } from "node:stream/promises";
import { parse as csv_parse } from "csv-parse";
import { count } from "drizzle-orm";
import mime from "mime/lite";

import type { ArticleHit } from "@acme/validators";
import { db } from "@acme/db/client";
import { Article } from "@acme/db/schema";

import type { ProblematicArticleType } from "./converter-spaghetti";
import { algolia_protected } from "~/lib/algolia-protected";
import { content_to_text } from "~/lib/content-to-text";
import { upload_image_by_file } from "../uredi/[novica_ime]/upload-file";

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

  const objects: ArticleHit[] = articles
    .map((article) => {
      const content_preview = content_to_text(article.content ?? undefined);
      if (!content_preview) return;

      return {
        objectID: article.id.toString(),
        title: article.title,
        url: article.url,
        created_at: article.created_at,
        image: article.preview_image ?? undefined,
        content_preview,
        published: true,
        has_draft: false,
        year: article.created_at.getFullYear().toString(),
      };
    })
    .filter((article) => typeof article !== "undefined");

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

export async function get_article_count() {
  const article_count = await db.select({ count: count() }).from(Article);
  return article_count.at(0)?.count;
}

const JKNM_SERVED_DIR = "D:/JKNM/served/media/img/novice";

export async function upload_images_to_s3() {
  const articles = await db.query.Article.findMany({
    limit: 10,
    orderBy: (a, { asc }) => [asc(a.id)],
  });

  const promises = articles.map(async (article) => {
    if (!article.preview_image) {
      console.log(article);
      console.error("No preview image for article", article.id);
      return;
    }

    const decoded_image = decodeURIComponent(article.preview_image);
    const preview_image_parts = decoded_image.split("/");
    const preview_image_name = preview_image_parts.pop();

    const file_path = `${JKNM_SERVED_DIR}/${article.created_at.getFullYear()}/${preview_image_name}`;
    if (!fs.existsSync(file_path)) {
      throw new Error("File doesn't exist: " + file_path);
    }

    await upload_from_path(file_path, article.url);
  });

  await Promise.all(promises);
}

async function upload_from_path(path: string, article_url: string) {
  const buffer = await fs_promises.readFile(path);
  const file_mime = mime.getType(path);
  if (!file_mime?.includes("image")) {
    throw new Error("Wrong MIME type: " + file_mime + " for file " + path);
  }
  const file_name = path.split("/").pop();
  if (!file_name) {
    throw new Error("Image doesn't have a title: " + path);
  }

  const file = new File([buffer], file_name, { type: file_mime });
  await upload_image_by_file(file, article_url);
}
