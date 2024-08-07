"use client";

import type EditorJS from "@editorjs/editorjs";
import type { Node as ParserNode } from "node-html-parser";
import { parse as parseDate } from "date-format-parse";
import dom_serialize from "dom-serializer";
import { parseDocument } from "htmlparser2";
import {
  parse as html_parse,
  NodeType,
  HTMLElement as ParserHTMLElement,
} from "node-html-parser";

import type { CSVType } from "~/server/article-converter";
import {
  article_title_to_url,
  edjsParser,
  get_image_data_from_editor,
} from "../uredi/[novica_ime]/editor-utils";

let wrong_divs = 0;
let videos = 0;
export async function iterate_over_articles(
  csv_articles: CSVType[],
  editorJS: EditorJS | null,
  article_create: any,
) {
  const problematic_articles: CSVType[] = [];

  const spliced_csv_articles = csv_articles.slice(0, 10);
  for (const csv_article of spliced_csv_articles) {
    const html = csv_article.content;
    const sanitized = fixHtml(html);
    const root = html_parse(sanitized);

    /* console.log("New article:", csv_article.title, root.structure);
    if (csv_article.title == "Ponovno na Straškem hribu") {
      console.log(sanitized);
    } */
    editorJS?.clear();
    editorJS?.blocks.insert("header", { text: csv_article.title, level: 1 });

    for (const node of root.childNodes) {
      if (node.nodeType == NodeType.ELEMENT_NODE) {
        const is_problem = parse_node(node, editorJS);

        if (is_problem) {
          console.log("Problematic article:", csv_article.title);
          problematic_articles.push(csv_article);
          break;
        }
      } else if (node.nodeType == NodeType.TEXT_NODE) {
        if (node.text.trim() !== "") throw new Error("Some text: " + node.text);
      } else {
        throw new Error("Unexpected comment: " + node.text);
      }
    }

    const format = "M/D/YYYY HH:mm:ss";
    const created_at = parseDate(csv_article.created_at, format);
    const updated_at = parseDate(csv_article.updated_at, format);

    /* 
    console.log(
        "Invalid date",
        csv_article.created_at,
        csv_article.updated_at,
        created_at,
        updated_at,
      ); */

    const content = await editorJS?.save();
    if (!content) throw new Error("No content");

    const content_html = edjsParser.parse(content).join("\n");
    console.log(csv_article.title, content);

    const images = get_image_data_from_editor(content);
    if (images.length == 0) {
      throw new Error("No images in article " + csv_article.title);
    }

    article_create.mutate({
      title: csv_article.title,
      content,
      preview_image: images[0]?.url,
      content_html,
      draft_content: undefined,
      draft_content_html: undefined,
      url: article_title_to_url(csv_article.title),
      created_at,
      updated_at,
      published: true,
    });

    editorJS?.clear();
  }

  console.log("Total articles:", csv_articles.length);
  console.log({ wrong_divs, videos });
  console.log(
    "Problematic articles:",
    problematic_articles.map((a) => a.title),
  );
}

function parse_node(node: ParserNode, editorJS: EditorJS | null) {
  if (!(node instanceof ParserHTMLElement))
    throw new Error("Not an HTMLElement");

  switch (node.rawTagName) {
    case "p": {
      editorJS?.blocks.insert("paragraph", { text: node.innerHTML });
      for (const p_child of node.childNodes) {
        if (p_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(p_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          const allowed_tags = ["strong", "br", "a", "img", "em", "sub", "sup"];
          if (!allowed_tags.includes(p_child.rawTagName))
            throw new Error(
              "Unexpected tag in p element: " + p_child.rawTagName,
            );
        } else if (p_child.nodeType == NodeType.TEXT_NODE) {
          // editorJS?.blocks.insert("paragraph", { text: p_child.text });
        } else {
          throw new Error("Unexpected comment: " + node.text);
        }
      }
      break;
    }
    case "div": {
      if (node.attributes.class?.includes("video")) {
        videos++;
        console.log("video", node.rawText);
        return;
      }

      let src: string | undefined;
      let caption: string | undefined;
      for (const div_child of node.childNodes) {
        if (div_child.nodeType == NodeType.ELEMENT_NODE) {
          if (!(div_child instanceof ParserHTMLElement))
            throw new Error("Not an HTMLElement");

          if (div_child.rawTagName === "div") {
            wrong_divs++;
            // throw new Error("Unexpected div element in div element");
            return true;
          }

          const allowed_tags = ["img", "p", "strong", "a", "br"];
          if (!allowed_tags.includes(div_child.rawTagName))
            throw new Error(
              "Unexpected element in div element: " + div_child.rawTagName,
            );

          if (div_child.rawTagName === "img") {
            src = `https://www.jknm.si${div_child.attributes.src}`;
            // } else if (div_child.rawTagName === "a") {
          } else if (div_child.rawTagName === "p") {
            caption = div_child.text;
          }
        } else if (div_child.nodeType == NodeType.TEXT_NODE) {
          if (div_child.text.trim() !== "")
            throw new Error("Some text: " + div_child.text);
        } else {
          throw new Error("Unexpected comment: " + node.text);
        }
      }

      editorJS?.blocks.insert("image", {
        file: {
          url: src,
        },
        caption,
      });
      break;
    }
    case "ul":
    case "br": {
      console.log(node.tagName, node.text);
      break;
    }
    case "h2":
    case "h3":
    case "h4": {
      const level = node.rawTagName[1];
      if (!level) throw new Error("No level in header tag");

      editorJS?.blocks.insert("header", {
        text: node.text,
        level: parseInt(level),
      });
      break;
    }
    default: {
      throw new Error("Unexpected element: " + node.rawTagName);
    }
  }

  // console.log(node.rawTagName, node.childNodes.length);
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
