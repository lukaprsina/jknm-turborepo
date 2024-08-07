"use client";

import { useCallback, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import dompurify from "dompurify";

import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { read_articles } from "~/server/article-converter";
import { api } from "~/trpc/react";
import { EDITOR_JS_PLUGINS } from "../uredi/[novica_ime]/plugins";
import { iterate_over_articles } from "./converter-spaghetti";

// import { article_title_to_url } from "../uredi/[novica_ime]/editor-utils";

export function ArticleConverter() {
  const editorJS = useRef<EditorJS | null>(null);

  const article_update = api.article.createWithDate.useMutation();
  // const article_all = api.article.allProtected.useQuery();

  return (
    <div className="prose container mx-auto py-8">
      <h1>Article Converter</h1>
      <p>This is a tool to convert articles from one format to another.</p>
      <Button
        onClick={async () => {
          await read_articles();
          console.clear();
          const csv_articles = await read_articles();
          await iterate_over_articles(
            csv_articles,
            editorJS.current,
            article_update,
          );
          /* for (const csv_article of csv_articles.slice(0, 5)) {
            article_update.mutate({
              title: csv_article.title,
              content_html: csv_article.content,
              url: article_title_to_url(csv_article.title),
            });
          } */
        }}
      >
        Convert
      </Button>
      <TempEditor editorJS={editorJS} />
      {/* <>
        {article_all.data?.map((article) => (
          <SampleArticle key={article.id} article={article} />
        ))}
      </> */}
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
      tools: EDITOR_JS_PLUGINS,
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
          <p>Updated at {article.updated_at.toISOString()}</p>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {dompurify.sanitize(
          article.content_html ??
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        )}
        {/* <divs
              dangerouslySetInnerHTML={{
                __html: article.content_html ?? "<h1>Ne obstaja</h1>",
              }}
            /> */}
      </CardContent>
    </Card>
  );
}
