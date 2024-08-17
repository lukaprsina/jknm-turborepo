"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";

import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Input } from "@acme/ui/input";

import { EDITOR_JS_PLUGINS } from "../../components/plugins";
import { read_articles, sync_with_algolia } from "./converter-server";
import { iterate_over_articles } from "./converter-spaghetti";

export function ArticleConverter() {
  const editorJS = useRef<EditorJS | null>(null);

  const [firstArticle, setFirstArticle] = useState(20); // 20 - 60
  const [lastArticle, setLastArticle] = useState(60);

  return (
    <div className="prose container mx-auto py-8">
      <h1>Article Converter</h1>
      <div className="flex w-full gap-4">
        <Button
          onClick={async () => {
            await sync_with_algolia();
          }}
        >
          Sync with Algolia
        </Button>
        <div className="flex flex-shrink gap-2">
          <Input
            type="number"
            value={firstArticle}
            onChange={(event) => setFirstArticle(parseInt(event.target.value))}
          />
          <Input
            type="number"
            value={lastArticle}
            onChange={(event) => setLastArticle(parseInt(event.target.value))}
          />
        </div>
        <Button
          onClick={async () => {
            await read_articles();
            console.clear();
            const csv_articles = await read_articles();

            await iterate_over_articles(
              csv_articles,
              editorJS.current,
              firstArticle,
              lastArticle,
            );
          }}
        >
          Convert
        </Button>
      </div>
      <TempEditor editorJS={editorJS} />
    </div>
  );
}

export function TempEditor({
  editorJS,
}: {
  editorJS: React.MutableRefObject<EditorJS | null>;
}) {
  const editor_factory = useCallback(() => {
    const temp_editor = new EditorJS({
      holder: "editorjs",
      tools: EDITOR_JS_PLUGINS(),
      // data: content,
      autofocus: true,
    });

    return temp_editor;
  }, []);

  useEffect(() => {
    if (editorJS.current != null) return;

    const temp_editor = editor_factory();
    editorJS.current = temp_editor;
  }, [editor_factory, editorJS]);

  return <div id="editorjs" />;
}

export function SampleArticle({
  article,
}: {
  article: typeof Article.$inferSelect;
}) {
  return (
    <Card className="py-6" key={article.title}>
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
        <CardDescription>
          <p>Created at {article.created_at.toISOString()}</p>
          <p>Updated at {article.updated_at?.toISOString()}</p>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* {dompurify.sanitize(
          article.content_html ??
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        )}
        <divs
              dangerouslySetInnerHTML={{
                __html: article.content_html ?? "<h1>Ne obstaja</h1>",
              }}
            /> */}
      </CardContent>
    </Card>
  );
}
