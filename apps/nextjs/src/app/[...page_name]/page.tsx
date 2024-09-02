import type { OutputBlockData } from "@editorjs/editorjs";
import { redirect } from "next/navigation";
import Blocks from "editorjs-blocks-react-renderer";

import { cn } from "@acme/ui";

import {
  AttachesRenderer,
  NextImageRenderer,
} from "~/components/editor-to-react";
import { Shell } from "~/components/shell";
import { article_variants, page_variants } from "~/lib/page-variants";
import { zgodovina } from "./zgodovina";

interface PageProps {
  params: {
    page_name: string;
  };
}

const page_map: Record<string, OutputBlockData[]> = {
  zgodovina,
};

export default function Page({ params: { page_name } }: PageProps) {
  const page = page_map[page_name];
  if (!page) redirect("/404");

  return (
    <Shell>
      <div className={cn(article_variants(), page_variants())}>
        <Blocks
          data={{ time: Date.now(), version: "UNKNOWN", blocks: page }}
          renderers={{
            image: NextImageRenderer,
            attaches: AttachesRenderer,
          }}
        />
      </div>
    </Shell>
  );
}
