import Blocks from "editorjs-blocks-react-renderer";

import type { Article } from "@acme/db/schema";
import { auth } from "@acme/auth";
import { Card, CardHeader, CardTitle } from "@acme/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { EditableProvider } from "~/components/editable-context";
import { Shell } from "~/components/shell";
import { api } from "~/trpc/server";

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

  const article_by_url = session
    ? await api.article.byIdProtected({
        id: novica_id,
      })
    : await api.article.byId({
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
  if (!article?.content) {
    return (
      <Card>
        <CardHeader>Novica ne obstaja</CardHeader>
      </Card>
    );
  }

  return (
    <div className="container h-full min-h-screen pt-16">
      <div className="prose lg:prose-xl dark:prose-invert mx-auto w-full">
        <Blocks data={article.content} />
      </div>
    </div>
  );
}

async function TabbedContent({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  const session = await auth();

  if (!article || (session && !article.content && !article.draft_content)) {
    return (
      <Card>
        <CardHeader>Novica ne obstaja</CardHeader>
      </Card>
    );
  }

  return (
    <Tabs
      defaultValue={article.draft_content ? "draft" : "published"}
      className="prose lg:prose-xl dark:prose-invert container mx-auto w-full py-4"
    >
      <TabsList>
        <TabsTrigger disabled={!article.draft_content} value="draft">
          Osnutek
        </TabsTrigger>
        <TabsTrigger disabled={!article.content} value="published">
          Objavljeno
        </TabsTrigger>
      </TabsList>
      <TabsContent value="draft">
        {article.draft_content && <Blocks data={article.draft_content} />}
      </TabsContent>
      <TabsContent value="published">
        {article.content && <Blocks data={article.content} />}
      </TabsContent>
    </Tabs>
  );
}
