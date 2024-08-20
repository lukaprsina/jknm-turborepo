"use client";

import type EditorJS from "@editorjs/editorjs";
import type { OutputBlockData } from "@editorjs/editorjs";
import type { Node as ParserNode } from "node-html-parser";
import { parse as parseDate } from "date-format-parse";
import dom_serialize from "dom-serializer";
import { parseDocument } from "htmlparser2";
import {
  parse as html_parse,
  NodeType,
  HTMLElement as ParserHTMLElement,
} from "node-html-parser";

import type { CSVType, TempArticleType } from "./converter-server";
import {
  get_clean_url,
  get_image_data_from_editor,
} from "../uredi/[novica_ime]/editor-utils";
import { AUTHORS } from "./authors";
import { get_problematic_html, upload_articles } from "./converter-server";

export interface ProblematicArticleType {
  csv: CSVType;
  html: string;
}

let wrong_divs = 0;
let videos = 0;
const problematic_articles: ProblematicArticleType[] = [];

export interface ImageToSave {
  objave_id: string;
  serial_id: string;
  url: string;
  images: string[];
}

const images_to_save: ImageToSave[] = [];
const articles_without_authors = new Set<number>();

export async function iterate_over_articles(
  csv_articles: CSVType[],
  editorJS: EditorJS | null,
  first_article: number,
  last_article: number,
) {
  wrong_divs = 0;
  videos = 0;
  problematic_articles.length = 0;
  images_to_save.length = 0;

  const do_splice = true as boolean;

  const spliced_csv_articles = do_splice
    ? csv_articles.slice(first_article, last_article)
    : csv_articles;

  console.log("spliced_csv_articles", spliced_csv_articles);

  const articles: TempArticleType[] = [];
  let article_id = 1;
  for (const csv_article of spliced_csv_articles) {
    const article = await parse_csv_article(csv_article, editorJS, article_id);
    articles.push(article);
    article_id++;
  }

  console.log("done", articles);
  await upload_articles(articles);

  /* if (true as boolean) {
    article_create.mutate({
      id: article_id,
      title: csv_article.title,
      preview_image,
      content,
      draft_content: null,
      url: csv_url,
      created_at,
      updated_at,
      published: true,
    });

    article_id++;
  } */

  // await save_images(images_to_save);
  // await write_article_html_to_file(problematic_articles);
  console.log("Total articles:", csv_articles.length);
  console.log({ wrong_divs, videos });
  console.log(
    "Problematic articles:",
    problematic_articles.map((a) => `${a.csv.id}-${a.csv.title}`),
    problematic_articles.map((a) => a.csv.id),
  );

  console.log(authors.sort((a, b) => a.name.localeCompare(b.name)));

  console.log(Array.from(articles_without_authors));
}

const AWS_PREFIX =
  "https://jamarski-klub-novo-mesto.s3.eu-central-1.amazonaws.com";
/* const AWS_PREFIX =
  "https://jknm.s3.eu-central-1.amazonaws.com"; */

async function parse_csv_article(
  csv_article: CSVType,
  editorJS: EditorJS | null,
  article_id: number,
) {
  const problematic_dir = "1723901265154";

  let html = csv_article.content;
  if (PROBLEMATIC_CONSTANTS.includes(parseInt(csv_article.id))) {
    html = await get_problematic_html(csv_article.id, problematic_dir);
  }
  const sanitized = fixHtml(html);
  const root = html_parse(sanitized);

  const csv_url = get_clean_url(csv_article.title);

  const blocks: OutputBlockData[] = [
    {
      type: "header",
      data: { text: csv_article.title, level: 1 },
    },
  ];

  const image_urls: string[] = [];

  for (const image of root.querySelectorAll("img")) {
    const src = image.getAttribute("src");
    if (!src) throw new Error("No src attribute in image");

    image_urls.push(src);
  }

  images_to_save.push({
    objave_id: csv_article.id,
    serial_id: article_id.toString(),
    url: csv_url,
    images: image_urls,
  });

  for (const node of root.childNodes) {
    if (node.nodeType == NodeType.ELEMENT_NODE) {
      const is_problem = parse_node(
        node,
        blocks,
        csv_article,
        csv_url,
        article_id,
      );

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

  const current_authors = get_authors(csv_article, blocks);
  const new_authors = new Set<string>();
  for (const current_author of current_authors) {
    const author = AUTHORS.find((a) => a.name === current_author);
    if (!author) throw new Error("No author found: " + current_author);

    if (author.change_to) {
      console.log("Change author", current_author, author.change_to);
      new_authors.add(author.change_to);
    } else {
      new_authors.add(author.name);
    }
  }

  await editorJS?.render({
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

  return {
    serial_id: article_id,
    objave_id: csv_article.id,
    title: csv_article.title,
    preview_image,
    content,
    csv_url,
    created_at,
    updated_at,
  };
}

function parse_node(
  node: ParserNode,
  blocks: OutputBlockData[],
  csv_article: CSVType,
  csv_url: string,
  article_id: number,
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
      let already_set_src = false;

      for (const div_child of node.querySelectorAll("img")) {
        if (div_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(div_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          if (already_set_src)
            throw new Error("Already set source once " + csv_article.id);

          already_set_src = true;
          const src_attr = div_child.attributes.src;
          if (!src_attr) throw new Error("No src attribute " + csv_article.id);

          const src_parts = src_attr.split("/");
          const image_name = src_parts[src_parts.length - 1];
          src = `${AWS_PREFIX}/${csv_url}-${article_id}/${image_name}`;
        } else if (div_child.nodeType == NodeType.TEXT_NODE) {
          if (div_child.text.trim() !== "")
            console.error("Some text in div: " + csv_article.id);
        } else {
          throw new Error("Unexpected comment: " + node.text);
        }
      }

      let caption: string | undefined;
      let already_set_caption = false;
      for (const div_child of node.querySelectorAll("p")) {
        if (div_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(div_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");
        } else if (div_child.nodeType == NodeType.TEXT_NODE) {
          if (div_child.text.trim() !== "") {
            if (already_set_caption)
              throw new Error("Already set caption once " + csv_article.id);
            already_set_caption = true;

            caption = div_child.text;
          } else {
            throw new Error("Empty caption: " + csv_article.id);
          }
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

const authors: { name: string; ids: string[] }[] = [];

function get_authors(csv_article: CSVType, blocks: OutputBlockData[]) {
  const last_block = blocks[blocks.length - 1];
  if (!last_block) {
    throw new Error("No blocks in article: " + csv_article.id);
  }

  console.log(last_block.type);
  const current_authors: string[] = [];

  if (last_block.type == "paragraph") {
    const paragraph_block = last_block.data as { text: string };
    const root = html_parse(paragraph_block.text);
    const strongs = root.querySelectorAll("strong");

    for (const strong of strongs) {
      const trimmed = strong.text.trim().replace(/\s+/g, " ");

      if (trimmed === "") continue;

      const author = authors.find((a) => a.name === trimmed);
      current_authors.push(trimmed);

      if (author) {
        author.ids.push(csv_article.id);
      } else {
        authors.push({ name: trimmed, ids: [csv_article.id] });
      }
    }
  } else {
    articles_without_authors.add(parseInt(csv_article.id));
  }

  return current_authors;
}
