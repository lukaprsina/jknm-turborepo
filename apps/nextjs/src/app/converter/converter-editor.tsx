"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import { EDITOR_JS_PLUGINS } from "../../components/plugins";
import {
  add_authors,
  delete_articles,
  get_article_count,
  read_articles,
  sync_with_algolia,
  upload_images,
} from "./converter-server";
import { iterate_over_articles } from "./converter-spaghetti";

export function ArticleConverter() {
  const editorJS = useRef<EditorJS | null>(null);
  const [article_count, setArticleCount] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    void (async () => {
      const article_count = await get_article_count();
      setArticleCount(article_count);
    })();
  }, []);

  const [firstArticle, setFirstArticle] = useState(0); // 20 - 60
  const [lastArticle, setLastArticle] = useState(30);

  return (
    <div className="prose container mx-auto py-8">
      <h1>Article Converter: {article_count} novičk</h1>
      <div className="flex w-full gap-4">
        <Button
          onClick={async () => {
            await sync_with_algolia();
          }}
        >
          Sync with Algolia
        </Button>
        <Button
          onClick={async () => {
            await delete_articles();
          }}
        >
          Delete articles
        </Button>
        <Button
          onClick={async () => {
            await add_authors();
          }}
        >
          Add authors
        </Button>
        <Button
          onClick={async () => {
            await upload_images();
          }}
        >
          Copy images to S3
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
