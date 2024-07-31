import { cn } from "@acme/ui";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@acme/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import NewArticleLoader from "~/components/new-article-loader";
import { Button } from "~/components/plate-ui/button";
import { Shell } from "~/components/shell";
import { api } from "~/trpc/server";
import PlateEditor from "./editor";
import SettingsDialog from "./settings-dialog";

interface PlatePageProps {
  params: {
    novica_ime: string;
  };
}

export default async function PlatePage({
  params: { novica_ime },
}: PlatePageProps) {
  const article_by_url = await api.article.byUrl({
    url: decodeURIComponent(novica_ime),
  });

  if (!article_by_url) {
    return (
      <Shell>
        <div className="container h-full min-h-screen pt-8">
          <ArticleBreadcrumb novica_ime={novica_ime} />
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
                <NewArticleLoader children="Ustvari novico" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container min-h-screen pt-8">
        <ArticleBreadcrumb novica_ime={novica_ime} />
        <PlateEditor article={article_by_url} />
        <SettingsDialog novica_ime={novica_ime} />
      </div>
    </Shell>
  );
}

function ArticleBreadcrumb({ novica_ime }: { novica_ime: string }) {
  return (
    <Breadcrumb>
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
