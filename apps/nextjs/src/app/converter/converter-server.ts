"use server";

import fs from "node:fs";
import fs_promises from "node:fs/promises";
import { finished } from "node:stream/promises";
import type { OutputData } from "@editorjs/editorjs";
import { parse as csv_parse } from "csv-parse";
import { count, sql } from "drizzle-orm";

import type { ArticleHit } from "@acme/validators";
import { db } from "@acme/db/client";
import {
  Article,
  ArticlesToCreditedPeople,
  CreditedPeople,
} from "@acme/db/schema";

import type { AuthorType } from "./authors";
import type {
  ImageToSave,
  ProblematicArticleType,
} from "./converter-spaghetti";
import { algolia_protected } from "~/lib/algolia-protected";
import { content_to_text } from "~/lib/content-to-text";
import { AUTHORS } from "./authors";

export interface CSVType {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export async function delete_articles() {
  await db.execute(sql`TRUNCATE TABLE ${CreditedPeople} CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE ${ArticlesToCreditedPeople} CASCADE;`);
  await db.execute(sql`TRUNCATE TABLE ${Article} CASCADE;`);
}

export interface TempArticleType {
  serial_id: number;
  objave_id: string;
  title: string;
  preview_image: string | undefined;
  content: OutputData;
  csv_url: string;
  created_at: Date;
  updated_at: Date;
}

export async function upload_articles(articles: TempArticleType[]) {
  await db.insert(Article).values(
    articles.map((article) => ({
      id: article.serial_id,
      old_id: parseInt(article.objave_id),
      title: article.title,
      content: article.content,
      created_at: article.created_at,
      updated_at: article.updated_at,
      preview_image: article.preview_image,
      url: article.csv_url,
    })),
  );
}

export async function read_articles() {
  /* await db.delete(Article);
  db.insert(Article).values({}); */
  // await db.execute(sql`TRUNCATE TABLE ${Article} CASCADE;`);

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
  const articles = await db.query.Article.findMany({
    // limit: 10,
  });
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
        created_at: article.created_at.getTime(),
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

export async function save_images(images: ImageToSave[]) {
  const dir = `./pt-images`;
  await fs_promises.mkdir(dir, { recursive: true });

  const promises = images.map(async (image) => {
    return fs_promises.writeFile(
      `${dir}/${image.objave_id}.json`,
      JSON.stringify(image),
    );
  });
  // fs_promises.writeFile(`${dir}/${id}.json`, JSON.stringify(images));
  await Promise.all(promises);
}

export async function upload_images() {
  const images_dir = `./pt-images`;
  const all_dir = `./pt-all`;
  /* {
    serial_id: number;
    objave_id: number;
    json: ImageToSave;
  } */
  const promises: Promise<void>[] = [];
  await fs_promises.mkdir(images_dir, { recursive: true });
  await fs_promises.mkdir(all_dir, { recursive: true });

  // 625
  for (let objave_id = 1; objave_id <= 630; objave_id++) {
    const filePath = `${images_dir}/${objave_id}.json`;
    if (!fs.existsSync(filePath)) {
      console.error("Folder with id doesn't exist", filePath);
      continue;
    }

    const callback = async () => {
      const file = await fs_promises.readFile(filePath, "utf-8");
      const json = JSON.parse(file) as ImageToSave;

      const s3_dir = `${json.url}-${json.serial_id}`;
      const nested_promises = json.images.map(async (image) => {
        const old_path = `${JKNM_SERVED_DIR}/${decodeURIComponent(image)}`;
        const old_path_parts = old_path.split("/");
        const old_file_name = old_path_parts.pop();
        if (!old_file_name) {
          throw new Error("Old file name doesn't exist: " + old_path);
        }

        // TODO: server to server fetch
        // return upload_from_path(old_path, s3_dir);
        try {
          await fs_promises.stat(old_path);
        } catch (error) {
          console.error("DANGER: MISSING FILE", old_path, error);
          return;
        }

        const new_dir = `${all_dir}/${s3_dir}`;
        await fs_promises.mkdir(new_dir, { recursive: true });

        const new_path = `${new_dir}/${old_file_name}`;
        // console.log("Copying file", old_path, new_path);
        // console.log("Copying file", old_path, new_path);
        return fs_promises.copyFile(old_path, new_path);

        /* return {
          old_path,
          new_path: `${s3_dir}/${old_file_name}`,
        }; */
      });

      await Promise.all(nested_promises);
      /* const file_info =  */
      // console.log(file_info);
    };

    promises.push(callback());
  }

  await Promise.all(promises);
  console.log("Done");
}
export async function add_authors() {
  const all_authors = AUTHORS.reduce((acc: Set<string>, author: AuthorType) => {
    if (typeof author.change_to === "undefined") {
      acc.add(author.name);
    } else if (typeof author.change_to === "string") {
      acc.add(author.change_to);
    }

    return acc;
  }, new Set<string>());

  await db
    .insert(CreditedPeople)
    .values(Array.from(all_authors).map((name) => ({ name, email: "" })));
}

/* for (const image of json.images) {
        const old_path = `${JKNM_SERVED_DIR}/${decodeURIComponent(image)}`
        upload_from_path(old_path, s3_dir);

        const old_path_parts = old_path.split("/");
        const old_file_name = old_path_parts.pop();
        if (!old_file_name) {
          throw new Error("Old file name doesn't exist: " + old_path);
        }


        const file = new File([old_file_name], image.name, {
          type: image.mime,
        });

        await upload_image_by_file(file, s3_dir);
      } */

const JKNM_SERVED_DIR = "D:/JKNM/served";
/* export async function upload_images_to_s3() {
  const articles = await db.query.Article.findMany({
    limit: 10,
    orderBy: (a, { asc }) => [asc(a.id)],
  });

  const promises = articles.map(async (article) => {
    if (!article.preview_image) {
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
} */

/* async function upload_from_path(path: string, article_url: string) {
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
  console.log("Uploading image", {
    article_url,
    file_name,
    file_mime,
  });

  await upload_image_by_file(file, article_url);
} */
