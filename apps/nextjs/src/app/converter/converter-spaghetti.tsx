"use client";

import type EditorJS from "@editorjs/editorjs";
import type { OutputBlockData } from "@editorjs/editorjs";
import type { Node as ParserNode } from "node-html-parser";
import { parse as parseDate } from "date-format-parse";
import dom_serialize from "dom-serializer";
import { decode } from "html-entities";
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
import {
  get_image_dimensions,
  get_problematic_html,
  upload_articles,
} from "./converter-server";
import { get_authors } from "./get-authors";

export interface ProblematicArticleType {
  csv: CSVType;
  html: string;
}

export interface ImageToSave {
  objave_id: string;
  serial_id: string;
  url: string;
  images: string[];
}

let wrong_divs = 0;
let videos = 0;
const problematic_articles: ProblematicArticleType[] = [];

const images_to_save: ImageToSave[] = [];
const articles_without_authors = new Set<number>();
const authors: { name: string; ids: string[] }[] = [];

export async function iterate_over_articles(
  csv_articles: CSVType[],
  editorJS: EditorJS | null,
  do_splice: boolean,
  first_article: number,
  last_article: number,
) {
  wrong_divs = 0;
  videos = 0;
  problematic_articles.length = 0;
  images_to_save.length = 0;
  articles_without_authors.clear();
  authors.length = 0;

  /* const spliced_csv_articles = do_splice
    ? csv_articles.slice(first_article, last_article)
    : csv_articles; */
  let first_index = csv_articles.findIndex(
    (a) => a.id === first_article.toString(),
  );
  let last_index = csv_articles.findIndex(
    (a) => a.id === last_article.toString(),
  );

  if (first_index === -1) first_index = 0;
  if (last_index === -1) last_index = csv_articles.length - 1;

  const sliced_csv_articles = do_splice
    ? csv_articles.slice(first_index, last_index)
    : csv_articles;

  console.log("spliced_csv_articles", {
    first_index,
    last_index,
    first_article,
    last_article,
    do_splice,
    csv_articles,
  });

  const articles: TempArticleType[] = [];
  let article_id = do_splice && first_index !== -1 ? first_index + 1 : 1;

  for (const csv_article of sliced_csv_articles) {
    const article = await parse_csv_article(csv_article, editorJS, article_id);
    articles.push(article);
    article_id++;
  }

  console.log("done", articles);
  await upload_articles(articles);

  // await save_images(images_to_save);
  // await write_article_html_to_file(problematic_articles);
  console.log(
    "Total articles (csv, uploaded):",
    csv_articles.length,
    articles.length,
  );
  console.log(
    "Problematic:",
    problematic_articles.map((a) => `${a.csv.id}-${a.csv.title}`),
    problematic_articles.map((a) => a.csv.id),
    { wrong_divs, videos },
  );

  console.log(
    "Authors (all, articles without authors):",
    authors.sort((a, b) => a.name.localeCompare(b.name)),
    Array.from(articles_without_authors),
  );

  console.log();
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
      // const is_problem =
      await parse_node(node, blocks, csv_article, csv_url, article_id);

      /* if (is_problem) {
        problematic_articles.push({
          html: sanitized,
          csv: csv_article,
        });
        break;
      } */
    } else if (node.nodeType == NodeType.TEXT_NODE) {
      if (node.text.trim() !== "") throw new Error("Some text: " + node.text);
    } else {
      throw new Error("Unexpected comment: " + node.text);
    }
  }

  const current_authors = get_authors(csv_article, blocks, authors);

  const new_authors = new Set<string>();
  for (const current_author of current_authors) {
    const author = AUTHORS.find((a) => a.name === current_author);
    // add authors first
    if (!author) {
      // throw new Error("No author found: " + current_author);
      // console.error("No author found: " + current_author);
      new_authors.add(current_author);
      continue;
    }

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
  const preview_image = images.length !== 0 ? images[0]?.file.url : undefined;

  if (typeof preview_image === "undefined") {
    console.error("No images in article", csv_article.id, csv_article.title);
  }

  // console.log({ blocks, content });

  return {
    serial_id: article_id,
    objave_id: csv_article.id,
    title: csv_article.title,
    preview_image,
    content,
    csv_url,
    created_at,
    updated_at,
    author_names: Array.from(new_authors),
  } satisfies TempArticleType;
}

const p_allowed_tags = ["STRONG", "BR", "A", "IMG", "EM", "SUB", "SUP"];
const caption_allowed_tags = ["STRONG", "EM", "A", "SUB", "SUP"];

async function parse_node(
  node: ParserNode,
  blocks: OutputBlockData[],
  csv_article: CSVType,
  csv_url: string,
  article_id: number,
): Promise<boolean> {
  if (!(node instanceof ParserHTMLElement))
    throw new Error("Not an HTMLElement");

  switch (node.tagName) {
    case "P": {
      for (const p_child of node.childNodes) {
        if (p_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(p_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          if (!p_allowed_tags.includes(p_child.tagName))
            throw new Error("Unexpected tag in p element: " + p_child.tagName);
        } else if (p_child.nodeType === NodeType.COMMENT_NODE) {
          throw new Error("Unexpected comment: " + node.text);
        }
      }

      const text = decode(node.innerHTML).trim();
      blocks.push({ type: "paragraph", data: { text } });
      break;
    }
    case "DIV": {
      if (node.attributes.class?.includes("video")) {
        let param = node.querySelector('param[name="movie"]');
        let src = param?.attributes.value;

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

      for (const img_tag of node.querySelectorAll("img")) {
        if (img_tag.nodeType == NodeType.ELEMENT_NODE) {
          if (!(img_tag instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          if (already_set_src)
            throw new Error("Already set source once " + csv_article.id);

          const src_attr = img_tag.attributes.src;
          const trimmed = decode(src_attr).trim();
          if (!trimmed) throw new Error("No src attribute " + csv_article.id);

          const src_parts = trimmed.trim().split("/");
          const image_name = src_parts[src_parts.length - 1];
          src = `${AWS_PREFIX}/${csv_url}-${article_id}/${image_name}`;
          /* console.log("Image", csv_article.id, {
            src,
            src_parts,
            src_attr,
            already_set_src,
          }); */
          already_set_src = true;
        } else if (img_tag.nodeType == NodeType.TEXT_NODE) {
          // console.error("Image is just text: " + csv_article.id);
          throw new Error("Image is just text: " + csv_article.id);
          // if (img_tag.text.trim() !== "")
        } else {
          throw new Error("Unexpected comment: " + node.text);
        }
      }

      // console.log("p children");
      let caption: string | undefined;
      let already_set_caption = false;
      for (const p_child of node.querySelectorAll("p")) {
        if (p_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(p_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          /* console.log(
            "p_child",
            p_child.tagName,
            p_child.innerHTML,
            p_child.childNodes,
          ); */

          let is_wrong = false;
          for (const p_child_child of p_child.childNodes) {
            if (p_child_child.nodeType == NodeType.ELEMENT_NODE) {
              if (!(p_child_child instanceof ParserHTMLElement))
                throw new Error("Not an HTMLElement");

              if (p_child_child.tagName === "IMG") {
                is_wrong = true;
                console.error("Image in caption", csv_article.id);
                break;
              }

              if (!caption_allowed_tags.includes(p_child_child.tagName)) {
                /* throw new Error(
                  "Unexpected tag in caption element: " + p_child_child.tagName,
                ); */
                console.error(
                  "Unexpected tag in caption element",
                  csv_article.id,
                  p_child_child.tagName,
                );
                is_wrong = true;
              }
            } else if (p_child_child.nodeType === NodeType.COMMENT_NODE) {
              throw new Error("Unexpected comment: " + node.text);
            }
          }
          if (is_wrong) continue;

          const trimmed = decode(p_child.innerHTML).trim();
          if (trimmed !== "") {
            if (already_set_caption) {
              console.log({ previous: caption, current: trimmed });
              throw new Error("Already set caption once " + csv_article.id);
            }

            caption = trimmed;
            already_set_caption = true;
          } else {
            /* console.error(
              "Empty caption: ",
              csv_article.id,
              div_child.outerHTML,
            ); */
            continue;
          }
        } else if (p_child.nodeType == NodeType.TEXT_NODE) {
          throw new Error(
            "Caption is just text" + csv_article.id + ", " + p_child.outerHTML,
          );
        } else {
          throw new Error("Unexpected comment: " + node.text);
        }
      }
      // console.log("p children done");

      if (!src) {
        throw new Error("No image src " + csv_article.id);
        /* console.error("No image src", csv_article.id);
        return false; */
      }

      if (!caption) {
        // throw new Error("No caption " + csv_article.id);
        console.error("No image caption", csv_article.id);
        return false;
      }

      // console.log({ src, caption });
      const dimensions = await get_image_dimensions(src);
      if (!dimensions) {
        console.error("No dimensions for image", csv_article.id, src);
        break;
      }

      blocks.push({
        type: "image",
        data: {
          file: {
            url: src,
            width: dimensions.width,
            height: dimensions.height,
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

          const trimmed = decode(ul_child.innerHTML).trim();
          items.push(trimmed);
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

      const trimmed = decode(node.innerHTML).trim();
      blocks.push({
        type: "header",
        data: {
          text: trimmed,
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

// TODO: 33 isn't the only one. search for img in p.
const PROBLEMATIC_CONSTANTS = [
  33, 40, 43, 46, 47, 48, 49, 50, 51, 53, 54, 57, 59, 64, 66, 67, 68, 80, 90,
  92, 114, 164, 219, 225, 232, 235, 243, 280, 284, 333, 350, 355, 476, 492, 493,
  538, 566, 571, 615,
];
