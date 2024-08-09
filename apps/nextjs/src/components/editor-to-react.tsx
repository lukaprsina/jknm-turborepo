"use client";

import { useMemo } from "react";
import Blocks from "editorjs-blocks-react-renderer";

import type { ArticleContentType } from "@acme/db/schema";

const allowed_blocks = ["paragraph", "list", "quote"];

export function EditorToReact({
  content,
  just_text,
}: {
  content?: ArticleContentType;
  just_text?: boolean;
}) {
  const filtered_content = useMemo(() => {
    if (!content) return undefined;

    const blocks = just_text
      ? content.blocks.filter((block) => allowed_blocks.includes(block.type))
      : content.blocks;

    return {
      version: content.version ?? "2.19.0",
      blocks,
      time: content.time ?? Date.now(),
    };
  }, [content, just_text]);

  if (!filtered_content) return null;

  return <Blocks data={filtered_content} />;
}
