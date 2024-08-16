"use client";

import type { RenderFn } from "editorjs-blocks-react-renderer";
import { useMemo, useState } from "react";
import Image from "next/image";
import Blocks from "editorjs-blocks-react-renderer";
import HTMLReactParser from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

import type { Article, ArticleContentType } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Card, CardContent, CardDescription, CardHeader } from "@acme/ui/card";

import type { EditorJSImageData } from "./plugins";
import { get_heading_from_editor } from "~/app/uredi/[novica_ime]/editor-utils";
import { image_store } from "./image-store";

export function EditorToReact({
  article,
  draft,
}: {
  article?: typeof Article.$inferSelect;
  draft?: boolean;
}) {
  const [heading, setHeading] = useState<string | undefined>();
  const editor_data = useMemo(() => {
    const content = draft ? article?.draft_content : article?.content;
    if (!content) return undefined;

    const heading_info = get_heading_from_editor(content);

    if (heading_info.error || !heading_info.title) {
      console.error("Invalid heading", heading_info);
      return;
    }

    setHeading(heading_info.title);

    return {
      version: content.version ?? "unknown version",
      blocks: content.blocks.splice(1), // remove heading
      time: content.time ?? Date.now(),
    };
  }, [article?.content, article?.draft_content, draft]);

  if (!editor_data) return;

  return (
    <Card className="pt-8">
      <CardHeader>
        <h1>{heading}</h1>
        <CardDescription>{article?.created_at.toDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Blocks
          data={editor_data}
          renderers={{
            image: NextImageRenderer,
          }}
        />
      </CardContent>
    </Card>
  );
}

const allowed_blocks = ["paragraph", "list", "quote"];

const NextImageRenderer: RenderFn<EditorJSImageData> = ({
  data,
  className,
}) => {
  // console.log(data);
  return (
    <figure>
      <Image
        onClick={() => {
          console.log("setting gallery image", data);
          image_store.set.gallery_image(data);
        }}
        className={cn("cursor-pointer", className)}
        src={data.file.url}
        alt={data.caption}
        width={data.file.width ?? 100}
        height={data.file.height ?? 100}
      />
      <figcaption>{HTMLReactParser(data.caption)}</figcaption>
    </figure>
  );
};

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
