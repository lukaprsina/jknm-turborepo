import dynamic from "next/dynamic";

import { auth } from "@acme/auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@acme/ui/breadcrumb";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import NewArticleLoader from "~/components/new-article-loader";
import { Shell } from "~/components/shell";
import { api } from "~/trpc/server";
import { article_title_to_url } from "./editor-utils";

const Editor = dynamic(() => import("./editor"), {
  ssr: false,
});

interface EditorPageProps {
  params: {
    novica_ime: string;
  };
}

export default async function EditorPage({
  params: { novica_ime: novica_ime_raw },
}: EditorPageProps) {
  const session = await auth();

  const novica_parts = decodeURIComponent(novica_ime_raw).split("-");
  const novica_id_string = novica_parts[novica_parts.length - 1];
  const novica_ime = novica_parts.slice(0, -1).join("-");

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
    <Shell>
      <div className="container mb-4 mt-8 h-full min-h-screen gap-72">
        <ArticleBreadcrumb novica_ime={novica_ime} />
        {article_by_url ? (
          <Editor article={article_by_url} />
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
              url={article_title_to_url(novica_ime)}
              children="Ustvari novico"
            />
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

function ArticleBreadcrumb({ novica_ime }: { novica_ime: string }) {
  return (
    <Breadcrumb className="pb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Domov</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>Uredi</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/novica/${novica_ime}`}>
            {novica_ime}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
