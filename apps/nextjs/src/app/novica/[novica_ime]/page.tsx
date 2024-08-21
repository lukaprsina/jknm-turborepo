import type { Article } from "@acme/db/schema";
import { auth } from "@acme/auth";
import { Card, CardHeader, CardTitle } from "@acme/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { EditableProvider } from "~/components/editable-context";
import { EditorToReact } from "~/components/editor-to-react";
import { Shell } from "~/components/shell";
import { api } from "~/trpc/server";
import { ImageGallery } from "./image-gallery";

interface NovicaProps {
  params: {
    novica_ime: string;
  };
}

export default async function NovicaPage({
  params: { novica_ime: novica_ime_raw },
}: NovicaProps) {
  const session = await auth();

  const novica_parts = decodeURIComponent(novica_ime_raw).split("-");
  const novica_id_string = novica_parts[novica_parts.length - 1];

  if (!novica_id_string) {
    console.error("No article ID found in URL", novica_ime_raw);
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle>Novica ne obstaja</CardTitle>
          </CardHeader>
        </Card>
      </Shell>
    );
  }

  const novica_id = parseInt(novica_id_string);

  if (isNaN(novica_id)) {
    console.error("Invalid article ID", {
      novica_ime_raw,
      novica_parts,
      novica_id_string,
      novica_id,
    });
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle>Novica ID je NAN</CardTitle>
          </CardHeader>
        </Card>
      </Shell>
    );
  }

  const article_by_url = await api.article.by_id({
    id: novica_id,
  });

  return (
    <EditableProvider editable="readonly">
      <Shell article={article_by_url}>
        {session ? (
          <TabbedContent article={article_by_url} />
        ) : (
          <PublishedContent article={article_by_url} />
        )}
      </Shell>
    </EditableProvider>
  );
}

function PublishedContent({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  console.log("published", article);

  if (!article?.content) {
    return <ArticleNotFound />;
  }

  return (
    // <div className="container h-full min-h-screen pt-8">
    // {/* lg:prose-xl  */}
    <div className="prose dark:prose-invert container w-full pb-6 pt-8">
      <EditorToReact article={article} />
      <ImageGallery />
    </div>
    // </div>
  );
}

async function TabbedContent({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  const session = await auth();

  console.log("tabbed", article);

  if (!article || (session && !article.content && !article.draft_content)) {
    return <ArticleNotFound />;
  }

  return (
    <>
      {/* <SwiperGallery /> */}

      <Tabs
        defaultValue={article.draft_content ? "draft" : "published"}
        /* lg:prose-xl prose-p:text-lg prose-h1:font-normal prose-h1:text-blue-800 prose-h1:text-[40px]  */
        className="prose dark:prose-invert container w-full pt-8"
      >
        <TabsList>
          <TabsTrigger disabled={!article.draft_content} value="draft">
            Osnutek
          </TabsTrigger>
          <TabsTrigger disabled={!article.content} value="published">
            Objavljeno
          </TabsTrigger>
        </TabsList>
        <TabsContent value="draft" className="py-6">
          <EditorToReact draft article={article} />
        </TabsContent>
        <TabsContent value="published" className="py-6">
          <EditorToReact article={article} />
        </TabsContent>
      </Tabs>
      <ImageGallery />
    </>
  );
}

function ArticleNotFound() {
  return (
    <div className="container h-full min-h-screen pt-8">
      <Card>
        <CardHeader>Novica ne obstaja</CardHeader>
      </Card>
    </div>
  );
}
