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

export function EditorToReact({
  content,
  just_text,
}: {
  content?: ArticleContentType;
  just_text?: boolean;
}) {
  const filtered_content = useMemo(() => {
    if (!content) return undefined;

    if (!just_text) {
      return {
        version: content.version ?? "2.19.0",
        blocks: content.blocks,
        time: content.time ?? Date.now(),
      };
    }

    const blocks = content.blocks.filter((block) =>
      allowed_blocks.includes(block.type),
    );

    const without_links = blocks.map((block) => {
      if (block.type !== "paragraph") return block;
      const paragraph_data = block.data as { text: string };

      const clean = DOMPurify.sanitize(paragraph_data.text, {
        ALLOWED_TAGS: [],
      });

      return {
        ...block,
        data: {
          ...block.data,
          text: clean,
        },
      };
    });

    return {
      version: content.version ?? "2.19.0",
      blocks: without_links,
      time: content.time ?? Date.now(),
    };
  }, [content, just_text]);

  if (!filtered_content) return null;

  return (
    <Blocks
      data={filtered_content}
      renderers={
        {
          // link: JustTextLink,
        }
      }
    />
  );
}
