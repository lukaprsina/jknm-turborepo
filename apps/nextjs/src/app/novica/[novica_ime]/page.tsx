import { Card, CardHeader } from "@acme/ui/card";

import { EditableProvider } from "~/components/editable-context";
import { Shell } from "~/components/shell";
import { api } from "~/trpc/server";

interface NovicaProps {
  params: {
    novica_ime: string;
  };
}

export default async function NovicaPage({
  params: { novica_ime },
}: NovicaProps) {
  const article_by_url = await api.article.byUrl({
    url: decodeURIComponent(novica_ime),
  });

  return (
    <EditableProvider editable="readonly">
      <Shell article_url={decodeURIComponent(novica_ime)}>
        <div className="container h-full min-h-screen pt-8">
          <div className="prose lg:prose-xl dark:prose-invert mx-auto w-full">
            {article_by_url?.contentHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: article_by_url.contentHtml }}
              />
            ) : (
              <Card>
                <CardHeader>Novica ne obstaja</CardHeader>
              </Card>
            )}
          </div>
        </div>
      </Shell>
    </EditableProvider>
  );
}
