"use client";

import dompurify from "dompurify";

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

// import { article_title_to_url } from "../uredi/[novica_ime]/editor-utils";

export function ArticleConverter() {
  //   const article_update = api.article.create.useMutation();
  const article_all = api.article.allProtected.useQuery();

  return (
    <div className="prose container mx-auto py-8">
      <h1>Article Converter</h1>
      <p>This is a tool to convert articles from one format to another.</p>
      <Button
        onClick={async () => {
          await read_articles();
          /* const csv_articles = await read_articles();
          for (const csv_article of csv_articles.slice(0, 5)) {
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
      <>
        {article_all.data?.map((article) => (
          <Card className="py-6" key={article.title}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
              <CardDescription>
                <p>Created at {article.created_at.toISOString()}</p>
                <p>Updated at {article.updated_at?.toISOString()}</p>
              </CardDescription>
            </CardHeader>

            <CardContent>
              {dompurify.sanitize(
                article.content_html ??
                  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
              )}
            </CardContent>
            {/* <divs
              dangerouslySetInnerHTML={{
                __html: article.content_html ?? "<h1>Ne obstaja</h1>",
              }}
            /> */}
          </Card>
        ))}
      </>
    </div>
  );
}
