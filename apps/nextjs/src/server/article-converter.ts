"use server";

import fs from "node:fs";
import { finished } from "node:stream/promises";
import { parse as csv_parse } from "csv-parse";
import { parse as html_parse, NodeType } from "node-html-parser";

import { db } from "@acme/db/client";
import { Article } from "@acme/db/schema";

export interface CSVType {
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
        if (!csvrow[4] || !csvrow[6] || !csvrow[8] || !csvrow[15])
          throw new Error("Missing data: " + JSON.stringify(csvrow, null, 2));

        csv_articles.push({
          title: csvrow[4],
          content: csvrow[6],
          created_at: csvrow[8],
          updated_at: csvrow[15],
        });
      }),
  );

  const spliced_csv_articles = csv_articles.slice(0, undefined);
  for (const csv_article of spliced_csv_articles) {
    console.log(csv_article.title);
    const html = csv_article.content;
    const root = html_parse(html);

    console.log(root.structure);
    for (const node of root.childNodes) {
      console.log(node.nodeType.toString(), `"${node.text}"`);
      if (node.nodeType == NodeType.ELEMENT_NODE) {
        /*  */
      } else {
        throw new Error("Unexpected node type: " + node.text);
      }
    }
    console.log(root.structure);
  }
}
