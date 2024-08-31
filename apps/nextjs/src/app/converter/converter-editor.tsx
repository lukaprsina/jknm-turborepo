"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";

import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import { Input } from "@acme/ui/input";
import { ScrollArea } from "@acme/ui/scroll-area";

import { useAllAuthors, useAuthors } from "~/components/authors";
import { EDITOR_JS_PLUGINS } from "../../components/plugins";
import {
  delete_articles,
  get_article_count,
  get_authors_by_name,
  make_every_article_public,
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

  const [doSplice, setDoSplice] = useState(true);
  const [firstArticle, setFirstArticle] = useState(0); // 32
  const [lastArticle, setLastArticle] = useState(33);
  const authors = useAllAuthors();

  return (
    <div className="prose container mx-auto py-8">
      <h1>Article Converter: {article_count} novičk</h1>
      <div className="flex w-full flex-wrap gap-4">
        <Button
          onClick={async () => {
            await sync_with_algolia();
          }}
        >
          Sync with Algolia
        </Button>
        {/* <Button
          onClick={async () => {
            const result = await get_google_admin_users();
            console.log(result);
          }}
        >
          Test Google admin
        </Button> */}
        <Button
          onClick={async () => {
            await make_every_article_public();
          }}
        >
          Make every article public
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
            if (!authors) {
              throw new Error("Authors not loaded");
            }

            const not_found_authors = new Set<string>();
            const authors_by_name = await get_authors_by_name();

            for (const author_by_name of authors_by_name) {
              let author = author_by_name.name;

              if (typeof author_by_name.change === "boolean") {
                continue;
              } else if (typeof author_by_name.change === "string") {
                author = author_by_name.change;
              }

              author = author.trim();
              author.split(", ").forEach((split_author) => {
                const author_obj = authors.find((a) => a.name === split_author);

                if (!author_obj) {
                  console.log(split_author);
                  not_found_authors.add(split_author);
                }
              });
            }

            const all_authors = authors.map((a) => a.name);
            console.log(
              "not_found_authors",
              all_authors,
              Array.from(not_found_authors),
            );
          }}
        >
          Check authors
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
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={doSplice}
              onCheckedChange={(checked) => setDoSplice(checked === true)}
              id="do_splice"
            />
            <label
              htmlFor="do_splice"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Splice?
            </label>
          </div>
          <Button
            onClick={async () => {
              console.clear();
              const csv_articles = await read_articles();

              await iterate_over_articles(
                csv_articles,
                editorJS.current,
                doSplice,
                firstArticle,
                lastArticle,
              );
            }}
          >
            Convert
          </Button>
        </div>
      </div>
      <ScrollArea className="my-4 h-72 rounded-md">
        <pre>{JSON.stringify(authors, null, 2)}</pre>
      </ScrollArea>
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
