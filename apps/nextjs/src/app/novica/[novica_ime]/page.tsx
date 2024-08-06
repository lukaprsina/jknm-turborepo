import { auth } from "@acme/auth";
import { Badge } from "@acme/ui/badge";
import { Card, CardHeader, CardTitle } from "@acme/ui/card";

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

  let article_element = (
    <Card>
      <CardHeader>Novica ne obstaja</CardHeader>
    </Card>
  );

  if (article_by_url?.content_html) {
    article_element = (
      <div
        dangerouslySetInnerHTML={{
          __html: article_by_url.content_html,
        }}
      />
    );
  } else if (article_by_url?.draft_content_html) {
    article_element = (
      <>
        <Badge className="mb-4">Osnutek</Badge>
        <div
          dangerouslySetInnerHTML={{
            __html: article_by_url.draft_content_html,
          }}
        />
      </>
    );
  }

  return (
    <EditableProvider editable="readonly">
      <Shell article_url={novica_ime}>
        <div className="container h-full min-h-screen pt-16">
          <div className="prose lg:prose-xl dark:prose-invert mx-auto w-full">
            {article_element}
          </div>
        </div>
      </Shell>
    </EditableProvider>
  );
}
