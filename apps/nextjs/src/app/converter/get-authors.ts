import type { OutputBlockData } from "@editorjs/editorjs";
import { decode } from "html-entities";
import { parse as html_parse } from "node-html-parser";

import type { CSVType } from "./converter-server";

export interface AuthorType {
  name: string;
  ids: string[];
  change?: false | string;
}

export function get_authors(
  csv_article: CSVType,
  all_blocks: OutputBlockData[],
  authors: { name: string; ids: string[] }[],
) {
  let number_of_paragraphs = 3;

  const last_paragraphs: string[] = [];
  // console.log("get_authors", all_blocks);

  for (let i = all_blocks.length - 1; i >= 0; i--) {
    const block = all_blocks.at(i);
    if (!block) throw new Error("No block at index " + i);

    if (block.type !== "paragraph") continue;

    const paragraph_data = block.data as { text: string };
    // console.log(paragraph_data.text);
    const trimmed = decode(paragraph_data.text).trim();
    if (trimmed === "") continue;

    last_paragraphs.push(trimmed);
    number_of_paragraphs--;
    if (number_of_paragraphs === 0) {
      break;
    }
  }

  last_paragraphs.reverse();

  if (last_paragraphs.length === 0) {
    console.error("get authors -> no paragraphs: " + csv_article.id);
  }

  const current_authors: string[] = [];

  for (const paragraph of last_paragraphs) {
    const root = html_parse(paragraph);
    const strongs = root.querySelectorAll("strong");

    for (const strong of strongs) {
      const trimmed = strong.text
        .trim()
        .replace(/\s+/g, " ")
        .replace(":", "")
        .replace(".", "");

      if (trimmed === "") continue;

      const author = authors.find((a) => a.name === trimmed);
      current_authors.push(trimmed);

      if (author) {
        author.ids.push(csv_article.id);
      } else {
        authors.push({ name: trimmed, ids: [csv_article.id] });
      }
    }
  }
  /* console.log("get_authors done", {
    all_blocks,
    last_paragraphs,
    number_of_paragraphs,
    authors,
  }); */

  return current_authors;
}
