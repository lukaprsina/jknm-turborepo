import MyEditor from "~/app/uredi_old/[novica_ime]/editor";
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
          <MyEditor article={article_by_url} />
        </div>
      </Shell>
    </EditableProvider>
  );
}
