"use client";

import type { RenderFn } from "editorjs-blocks-react-renderer";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Blocks from "editorjs-blocks-react-renderer";
import HTMLReactParser from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

import type { Article, ArticleContentType } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Card, CardContent, CardDescription, CardHeader } from "@acme/ui/card";

import type { EditorJSImageData } from "./plugins";
import {
  get_heading_from_editor,
  get_image_data_from_editor,
} from "~/app/uredi/[novica_ime]/editor-utils";
import { gallery_store } from "./gallery-store";

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

    const image_data = get_image_data_from_editor(content);
    gallery_store.set.images(image_data);

    return {
      version: content.version ?? "unknown version",
      blocks: content.blocks.slice(1), // remove first heading
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
  // const image_data = gallery_store.use.images();
  // const router = useRouter();

  /* const priority = useMemo(
    () => image_data.at(0)?.file.url == data.file.url,
    [data.file.url, image_data],
  ); */

  const dimensions = useMemo(
    () => data.file.width && data.file.height,
    [data.file.height, data.file.width],
  );

  return (
    <figure>
      <Image
        onClick={() => {
          // router.push(`?image=${data.file.url}`);
          gallery_store.set.default_image(data);
        }}
        className={cn(
          "cursor-pointer",
          className,
          !dimensions && "object-contain",
        )}
        src={data.file.url}
        alt={data.caption}
        width={dimensions ? data.file.width : 1500}
        height={dimensions ? data.file.height : 1000}
        priority={true}
        // fill={!dimensions}
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
