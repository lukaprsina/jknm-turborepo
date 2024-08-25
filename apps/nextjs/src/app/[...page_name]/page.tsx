import type { OutputBlockData } from "@editorjs/editorjs";
import { redirect } from "next/navigation";

import { EditorToReact } from "~/components/editor-to-react";
import { Shell } from "~/components/shell";
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
      <div className="prose dark:prose-invert container w-full pb-6 pt-8">
        <EditorToReact
          article={{
            content: { blocks: page },
          }}
        />
      </div>
    </Shell>
  );
}
