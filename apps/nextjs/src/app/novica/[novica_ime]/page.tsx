import { auth } from "@acme/auth";
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
  params: { novica_ime: novica_ime_raw },
}: NovicaProps) {
  const novica_ime = decodeURIComponent(novica_ime_raw);
  const session = await auth();

  const article_by_url = session
    ? await api.article.byUrlProtected({
        url: novica_ime,
      })
    : await api.article.byUrl({
        url: novica_ime,
      });

  return (
    <EditableProvider editable="readonly">
      <Shell article_url={novica_ime}>
        <div className="container h-full min-h-screen pt-16">
          <div className="prose lg:prose-xl dark:prose-invert mx-auto w-full">
            {article_by_url?.content_html ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: article_by_url.content_html,
                }}
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
