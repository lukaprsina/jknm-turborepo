"use client";

import { useMemo } from "react";
import Blocks from "editorjs-blocks-react-renderer";
import DOMPurify from "isomorphic-dompurify";

import type { ArticleContentType } from "@acme/db/schema";

const allowed_blocks = ["paragraph", "list", "quote"];

/* const JustTextLink: RenderFn<{
  items: string[];
}> = ({ data, className = "" }) => {
  return (
    <>
      {data.items.map((item, i) => (
        <a key={i} className={className} {HTMLReactParser(item)}>
        </a>
      ))}
    </>
  );
}; */

export function EditorToReact({ content }: { content?: ArticleContentType }) {
  const editor_data = useMemo(() => {
    if (!content) return undefined;

    return {
      version: content.version ?? "unknown version",
      blocks: content.blocks,
      time: content.time ?? Date.now(),
    };
  }, [content]);

  if (!editor_data) return null;

  return (
    <Blocks
      data={editor_data}
      renderers={
        {
          // link: JustTextLink,
        }
      }
    />
  );
}

export function EditorToText({ content }: { content?: ArticleContentType }) {
  const filtered_text = useMemo(() => {
    if (!content) return undefined;

    const blocks = content.blocks.filter((block) =>
      allowed_blocks.includes(block.type),
    );

    const sanitized_text = blocks
      .map((block) => {
        if (block.type !== "paragraph") return undefined;
        const paragraph_data = block.data as { text: string };

        const clean = DOMPurify.sanitize(paragraph_data.text, {
          ALLOWED_TAGS: [],
        });

        return clean;
      })
      .filter((text) => typeof text !== "undefined")
      .join("\n");

    return sanitized_text;
  }, [content]);

  return <>{filtered_text}</>;
}
