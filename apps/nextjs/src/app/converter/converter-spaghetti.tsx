/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type EditorJS from "@editorjs/editorjs";
import type { OutputBlockData } from "@editorjs/editorjs";
import type { Node as ParserNode } from "node-html-parser";
// import { parse as parseDate } from "date-format-parse";
import dom_serialize from "dom-serializer";
import { parseDocument } from "htmlparser2";
import {
  parse as html_parse,
  NodeType,
  HTMLElement as ParserHTMLElement,
} from "node-html-parser";

import type { CSVType } from "./converter-server";
import {
  get_problematic_html,
  write_article_html_to_file,
} from "./converter-server";

// import { get_image_data_from_editor } from "../uredi/[novica_ime]/editor-utils";

export interface ProblematicArticleType {
  csv: CSVType;
  html: string;
}

let wrong_divs = 0;
let videos = 0;
const problematic_articles: ProblematicArticleType[] = [];

export async function iterate_over_articles(
  csv_articles: CSVType[],
  editorJS: EditorJS | null,
  first_article: number,
  last_article: number,
) {
  wrong_divs = 0;
  videos = 0;
  problematic_articles.length = 0;

  const do_splice = false as boolean;

  const spliced_csv_articles = do_splice
    ? csv_articles.slice(first_article, last_article)
    : csv_articles;
  for (const csv_article of spliced_csv_articles) {
    await parse_csv_article(csv_article, editorJS);
  }

  console.log("Total articles:", csv_articles.length);
  console.log({ wrong_divs, videos });
  console.log(
    "Problematic articles:",
    problematic_articles.map((a) => `${a.csv.id}-${a.csv.title}`),
    problematic_articles.map((a) => a.csv.id),
  );

  await write_article_html_to_file(problematic_articles);
}

async function parse_csv_article(
  csv_article: CSVType,
  editorJS: EditorJS | null,
) {
  // const article_update = api.article.create_article_with_date.useMutation();
  const problematic_dir = "1723901265154";

  let html = csv_article.content;
  if (PROBLEMATIC_CONSTANTS.includes(parseInt(csv_article.id))) {
    html = await get_problematic_html(csv_article.id, problematic_dir);
  }
  const sanitized = fixHtml(html);
  const root = html_parse(sanitized);

  /* console.log("New article:", csv_article.title, root.structure);
    if (csv_article.title == "Ponovno na Straškem hribu") {
      console.log(sanitized);
    } */

  const blocks: OutputBlockData[] = [
    {
      type: "header",
      data: { text: csv_article.title, level: 1 },
    },
  ];

  for (const node of root.childNodes) {
    if (node.nodeType == NodeType.ELEMENT_NODE) {
      const is_problem = parse_node(node, blocks, csv_article);

      if (is_problem) {
        problematic_articles.push({
          html: sanitized,
          csv: csv_article,
        });
        break;
      }
    } else if (node.nodeType == NodeType.TEXT_NODE) {
      if (node.text.trim() !== "") throw new Error("Some text: " + node.text);
    } else {
      throw new Error("Unexpected comment: " + node.text);
    }
  }

  /* await editorJS?.render({
    blocks,
  });

  const format = "D/M/YYYY HH:mm:ss";
    const created_at = parseDate(csv_article.created_at, format);
    const updated_at = parseDate(csv_article.updated_at, format);

  const content = await editorJS?.save();
  if (!content) throw new Error("No content");

  const images = get_image_data_from_editor(content);
  const preview_image = images[0] ? images[0]?.file.url : undefined;

  if (typeof preview_image === "undefined") {
    console.error("No images in article", csv_article.title);
  }

  console.log(
      csv_article.title,
      content,
      csv_article.created_at,
      csv_article.updated_at,
      created_at,
      updated_at,
    );

    article_create.mutate({
      title: csv_article.title,
      preview_image,
      content,
      draft_content: null,
      url: get_clean_url(csv_article.title),
      created_at,
      updated_at,
      published: true,
    }); */
}

function parse_node(
  node: ParserNode,
  blocks: OutputBlockData[],
  csv_article: CSVType,
): boolean {
  if (!(node instanceof ParserHTMLElement))
    throw new Error("Not an HTMLElement");

  switch (node.tagName) {
    case "P": {
      blocks.push({ type: "paragraph", data: { text: node.innerHTML } });
      for (const p_child of node.childNodes) {
        if (p_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(p_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          const allowed_tags = ["STRONG", "BR", "A", "IMG", "EM", "SUB", "SUP"];
          if (!allowed_tags.includes(p_child.tagName))
            throw new Error("Unexpected tag in p element: " + p_child.tagName);
        } else if (p_child.nodeType == NodeType.TEXT_NODE) {
          // editorJS?.blocks.insert("paragraph", { text: p_child.text });
        } else {
          throw new Error("Unexpected comment: " + node.text);
        }
      }
      break;
    }
    case "DIV": {
      if (node.attributes.class?.includes("video")) {
        let param = node.querySelector('param[name="movie"]');
        let src = param?.attributes.value;
        // if (!src) throw new Error("No video src, " + csv_article.id);
        /* if (!src) {
          console.error("No video src, " + csv_article.id);
          return false;
        } */

        // TODO: video caption
        let id = youtube_url_to_id(src);

        if (!id) {
          param = node.querySelector("embed");
          src = decodeURI(param?.attributes.src?.slice(2) ?? "");
          id = youtube_url_to_id(src);
        }

        if (!id) {
          param = node.querySelector("iframe");
          src = param?.attributes.src;
          id = youtube_url_to_id(src);
        }

        if (!id) {
          console.error("No video id", csv_article.id, src);
          return false;
        }

        blocks.push({
          type: "embed",
          data: {
            service: "youtube",
            embed: `https://www.youtube.com/embed/${id}`,
            source: `https://www.youtube.com/watch?v=${id}`,
            width: 580,
            height: 320,
          },
        });

        videos++;
        console.log("Video", csv_article.id);

        return false;
      }

      let src: string | undefined;
      let caption: string | undefined;
      for (const div_child of node.childNodes) {
        if (div_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(div_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          if (div_child.tagName === "DIV") {
            wrong_divs++;
            // throw new Error("Unexpected div element in div element");
            return true;
          }

          const allowed_tags = ["IMG", "P", "STRONG", "A", "BR"];
          if (!allowed_tags.includes(div_child.tagName))
            throw new Error(
              "Unexpected element in div element: " +
                div_child.tagName +
                " " +
                csv_article.id,
            );

          if (div_child.tagName === "IMG") {
            src = `https://www.jknm.si${div_child.attributes.src}`;
            // } else if (div_child.tagName === "a") {
          } else if (div_child.tagName === "P") {
            caption = div_child.text;
          }
        } else if (div_child.nodeType == NodeType.TEXT_NODE) {
          if (div_child.text.trim() !== "")
            console.error("Some text in div: " + csv_article.id);
        } else {
          throw new Error("Unexpected comment: " + node.text);
        }
      }

      blocks.push({
        type: "image",
        data: {
          file: {
            url: src,
          },
          caption,
        },
      });
      break;
    }
    case "UL": {
      const items: string[] = [];

      for (const ul_child of node.childNodes) {
        if (ul_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(ul_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          if (ul_child.tagName !== "LI")
            throw new Error(
              "Unexpected element in ul element: " + ul_child.tagName,
            );

          items.push(ul_child.innerHTML);
        } else if (ul_child.nodeType == NodeType.TEXT_NODE) {
          if (ul_child.text.trim() !== "")
            throw new Error("Some text: " + ul_child.text);
        } else {
          throw new Error("Unexpected comment: " + node.text);
        }
      }

      blocks.push({ type: "list", data: { style: "unordered", items } });

      break;
    }
    case "BR": {
      blocks.push({ type: "delimiter", data: {} });
      // console.log(node.tagName, node.text);
      break;
    }
    case "H2":
    case "H3":
    case "H4": {
      const level = node.tagName.trim()[1];
      if (!level) throw new Error("No level in header tag");

      blocks.push({
        type: "header",
        data: {
          text: node.text,
          level: parseInt(level),
        },
      });
      break;
    }
    default: {
      throw new Error("Unexpected element: " + node.tagName);
    }
  }

  // console.log(node.tagName, node.childNodes.length);
  return false;
}

function fixHtml(htmlString: string) {
  const document = parseDocument(htmlString, {
    decodeEntities: true,
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    recognizeSelfClosing: true,
  });

  const fixedHtml = dom_serialize(document);

  return fixedHtml;
}

function youtube_url_to_id(url?: string) {
  if (!url) return false;
  const youtube_regex =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = youtube_regex.exec(url);

  return match && match[7]?.length == 11 ? match[7] : false;
}

const PROBLEMATIC_CONSTANTS = [
  40, 43, 46, 47, 48, 49, 50, 51, 53, 54, 57, 59, 64, 66, 67, 68, 80, 90, 92,
  114, 164, 219, 225, 232, 235, 243, 280, 284, 333, 350, 355, 476, 492, 493,
  538, 566, 571, 615,
];
