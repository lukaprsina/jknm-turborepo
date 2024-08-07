"use server";

import fs from "node:fs";
import { finished } from "node:stream/promises";
import { parse as csv_parse } from "csv-parse";
import {
  parse as html_parse,
  NodeType,
  HTMLElement as ParserHTMLElement,
} from "node-html-parser";
import sanitizeHtml from "sanitize-html";

/* import { db } from "@acme/db/client";
import { Article } from "@acme/db/schema"; */

export interface CSVType {
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export async function read_articles() {
  // await db.delete(Article);

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

  let wrong_divs = 0;
  let i = 0;
  const spliced_csv_articles = csv_articles.slice(0, undefined);
  for (const csv_article of spliced_csv_articles) {
    const html = csv_article.content;
    const sanitized = sanitizeHtml(html, {
      selfClosing: [],
    });
    const root = html_parse(sanitized);

    let j = 0;
    console.log("New article:", csv_article.title, root.structure);
    for (const node of root.childNodes) {
      if (node.nodeType == NodeType.ELEMENT_NODE) {
        if (!(node instanceof ParserHTMLElement))
          throw new Error("Not an HTMLElement");

        switch (node.rawTagName) {
          case "p": {
            for (const p_child of node.childNodes) {
              if (p_child.nodeType == NodeType.ELEMENT_NODE) {
                if (!(p_child instanceof ParserHTMLElement))
                  throw new Error("Not an HTMLElement");

                // TODO: img
                const allowed_tags = [
                  "strong",
                  "br",
                  "a",
                  "img",
                  "em",
                  "sub",
                  "sup",
                ];
                if (!allowed_tags.includes(p_child.rawTagName))
                  throw new Error(
                    "Unexpected tag in p element: " + p_child.rawTagName,
                  );
              } else if (p_child.nodeType == NodeType.TEXT_NODE) {
                /*  */
              } else {
                throw new Error("Unexpected comment: " + node.text);
              }
            }
            break;
          }
          case "div": {
            if (node.attributes.class?.includes("video")) {
              console.log("video", node.rawText);
              continue;
            }

            for (const div_child of node.childNodes) {
              if (div_child.nodeType == NodeType.ELEMENT_NODE) {
                if (!(div_child instanceof ParserHTMLElement))
                  throw new Error("Not an HTMLElement");

                // console.log(div_child.tagName, div_child.attributes);
                if (div_child.rawTagName === "div") {
                  wrong_divs++;
                  continue;
                }

                const allowed_tags = ["img", "p", "strong", "a", "br"];
                if (!allowed_tags.includes(div_child.rawTagName))
                  throw new Error(
                    "Unexpected element in div element: " +
                      div_child.rawTagName,
                  );
              } else if (div_child.nodeType == NodeType.TEXT_NODE) {
                /*  */
              } else {
                throw new Error("Unexpected comment: " + node.text);
              }
            }
            break;
          }
          case "ul":
          case "br":
          case "h2":
          case "h3":
          case "h4": {
            console.log("h2", node.rawText);
            break;
          }
          default: {
            throw new Error("Unexpected element: " + node.rawTagName);
          }
        }

        console.log(i, j, node.rawTagName, node.childNodes.length);
      } else if (node.nodeType == NodeType.TEXT_NODE) {
        if (node.text.trim() !== "") throw new Error("Some text: " + node.text);
      } else {
        throw new Error("Unexpected comment: " + node.text);
      }

      j++;
    }

    i++;
  }

  console.log({ wrong_divs });
}

await read_articles();
