"use client";

import type { RenderFn } from "editorjs-blocks-react-renderer";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Blocks from "editorjs-blocks-react-renderer";
import HTMLReactParser from "html-react-parser";
import _ from "lodash";
import { ChevronDownIcon } from "lucide-react";

import type { Article } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { buttonVariants } from "@acme/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@acme/ui/card";

import type { EditorJSImageData } from "./plugins";
import { useGalleryStore } from "~/app/novica/[novica_ime]/gallery-zustand";
import {
  get_heading_from_editor,
  get_image_data_from_editor,
} from "~/app/uredi/[novica_ime]/editor-utils";
import { format_date } from "~/lib/format-date";

export function EditorToReact({
  article,
  draft,
}: {
  article?: typeof Article.$inferSelect;
  draft?: boolean;
}) {
  const [heading, setHeading] = useState<string | undefined>();
  const gallery = useGalleryStore();

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
    if (!_.isEqual(gallery.images, image_data)) {
      gallery.set_images(image_data);
    }
    // gallery_store.set.images(image_data);

    return {
      version: content.version ?? "unknown version",
      blocks: content.blocks.slice(1), // remove first heading
      time: content.time ?? Date.now(),
    };
  }, [article?.content, article?.draft_content, draft, gallery]);

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
            attaches: AttachesRenderer,
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
  const gallery = useGalleryStore();
  const dimensions = useMemo(
    () => data.file.width && data.file.height,
    [data.file.height, data.file.width],
  );

  return (
    <figure>
      <Image
        onClick={() => {
          // router.push(`?image=${data.file.url}`);
          // gallery_store.set.default_image(data);
          gallery.set_default_image(data);
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

interface EditorJSAttachesData {
  file: {
    url: string;
    size: number;
    name: string;
    extension?: string;
  };
  title: string;
}

const AttachesRenderer: RenderFn<EditorJSAttachesData> = ({
  data,
  className,
}) => {
  console.log(data);
  // "flex w-full gap-2",
  return (
    <Card className={cn("flex items-center justify-between", className)}>
      <CardHeader>
        <h3>{data.title}</h3>
        <CardDescription>{data.file.size} bajtov</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full items-center justify-between py-0">
        <Link
          target="_blank"
          className={buttonVariants({ variant: "ghost" })}
          href={data.file.url}
        >
          <ChevronDownIcon />
        </Link>
      </CardContent>
    </Card>
  );
};

// https://github.com/editor-js/attaches
const _EXTENSIONS = {
  doc: "#1483E9",
  docx: "#1483E9",
  odt: "#1483E9",
  pdf: "#DB2F2F",
  rtf: "#744FDC",
  tex: "#5a5a5b",
  txt: "#5a5a5b",
  pptx: "#E35200",
  ppt: "#E35200",
  mp3: "#eab456",
  mp4: "#f676a6",
  xls: "#11AE3D",
  html: "#2988f0",
  htm: "#2988f0",
  png: "#AA2284",
  jpg: "#D13359",
  jpeg: "#D13359",
  gif: "#f6af76",
  zip: "#4f566f",
  rar: "#4f566f",
  exe: "#e26f6f",
  svg: "#bf5252",
  key: "#00B2FF",
  sketch: "#FFC700",
  ai: "#FB601D",
  psd: "#388ae5",
  dmg: "#e26f6f",
  json: "#2988f0",
  csv: "#11AE3D",
};
