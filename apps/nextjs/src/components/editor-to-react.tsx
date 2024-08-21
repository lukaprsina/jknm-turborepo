"use client";

import type { RenderFn } from "editorjs-blocks-react-renderer";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Blocks from "editorjs-blocks-react-renderer";
import HTMLReactParser from "html-react-parser";

import type { Article } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Card, CardContent, CardDescription, CardHeader } from "@acme/ui/card";

import type { EditorJSImageData } from "./plugins";
import {
  get_heading_from_editor,
  get_image_data_from_editor,
} from "~/app/uredi/[novica_ime]/editor-utils";
import { format_date } from "~/lib/format-date";
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

  if (!editor_data || !article) return;

  return (
    <Card className="pt-8">
      <CardHeader>
        <h1>{heading}</h1>
        <CardDescription>{format_date(article.created_at)}</CardDescription>
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

  useEffect(() => {
    console.log("Image data", data.file);
  }, [data.file]);

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
