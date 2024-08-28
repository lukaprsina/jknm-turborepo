import dynamic from "next/dynamic";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { get_google_admin_users } from "~/app/converter/google-admin";
import NewArticleLoader from "~/components/new-article-loader";
import { Shell } from "~/components/shell";
import { api } from "~/trpc/server";
import { get_clean_url } from "./editor-utils";

const Editor = dynamic(() => import("./editor"), {
  ssr: false,
});

interface EditorPageProps {
  params: {
    novica_ime: string;
  };
}

export function ErrorCard({ title }: { title: string }) {
  return (
    <Shell>
      <div className="prose dark:prose-invert container w-full pb-6 pt-8">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </Shell>
  );
}

export default async function EditorPage({
  params: { novica_ime: novica_ime_raw },
}: EditorPageProps) {
  const users = await get_google_admin_users();
  const novica_parts = decodeURIComponent(novica_ime_raw).split("-");
  const novica_id_string = novica_parts[novica_parts.length - 1];
  const novica_ime = novica_parts.slice(0, -1).join("-");

  if (!users) {
    return <ErrorCard title="Napaka pri pridobivanju uporabnikov" />;
  }

  if (!novica_id_string) {
    return <ErrorCard title="Napaka pri pridobivanju ID-ja novičke" />;
  }

  const novica_id = parseInt(novica_id_string);

  const article_by_url = await api.article.by_id({
    id: novica_id,
  });

  return (
    <Shell>
      <div className="container mb-4 mt-8 h-full min-h-screen">
        {article_by_url ? (
          <Editor users={users} article={article_by_url} />
        ) : (
          <CreateNewArticle novica_ime={novica_ime} />
        )}
      </div>
    </Shell>
  );
}

function CreateNewArticle({ novica_ime }: { novica_ime: string }) {
  return (
    <>
      <div className="flex h-full w-full items-center justify-center">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              Novička <strong>{novica_ime}</strong> ne obstaja.
            </CardTitle>
            <CardDescription>
              Preverite, če ste vnesli pravilno ime novičke.
            </CardDescription>
          </CardHeader>
          <CardContent>
            Lahko pa ustvarite novo novičko z imenom{" "}
            <strong>{novica_ime}</strong>.
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="secondary">
              <a href="/">Domov</a>
            </Button>
            <NewArticleLoader
              title={novica_ime}
              url={get_clean_url(novica_ime)}
              children="Ustvari novico"
            />
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
