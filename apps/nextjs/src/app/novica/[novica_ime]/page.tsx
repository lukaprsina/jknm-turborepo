import Link from "next/link";

import type { Article } from "@acme/db/schema";
import { auth } from "@acme/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
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
        <ArticleNotFound />
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
        <ArticleNotFound />
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
        <ImageGallery />
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
    return <ArticleNotFound />;
  }

  return (
    // <div className="container h-full min-h-screen pt-8">
    // {/* lg:prose-xl  */}
    <div className="prose dark:prose-invert container w-full pb-6 pt-8">
      <EditorToReact article={article} />
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
    <Tabs
      defaultValue={article.draft_content ? "draft" : "published"}
      /* lg:prose-xl prose-p:text-lg prose-h1:font-normal prose-h1:text-blue-800 prose-h1:text-[40px]  */
      // prose-figcaption:text-foreground
      className="prose dark:prose-invert prose-figcaption:text-base prose-figcaption:text-blue-800 container w-full pt-8"
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
        <EditorToReact draft article={article} session={session ?? undefined} />
      </TabsContent>
      <TabsContent value="published" className="py-6">
        <EditorToReact article={article} session={session ?? undefined} />
      </TabsContent>
    </Tabs>
  );
}

function ArticleNotFound() {
  return (
    <div className="prose dark:prose-invert container min-h-screen w-full pb-6 pt-8">
      <Card>
        <CardHeader>
          <CardTitle>Novica ne obstaja</CardTitle>
          <CardDescription>
            Prosim, preverite URL naslov in poskusite znova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Če menite, da je prišlo do napake, nas kontaktirajte.</p>
          <p>Naša e-pošta: </p>
          <Link href="mailto:info@jknm.si">info@jknm.si</Link>
        </CardContent>
      </Card>
    </div>
  );
}
