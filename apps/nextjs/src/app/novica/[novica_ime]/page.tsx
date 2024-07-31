import PlateEditor from "~/app/uredi/[novica_ime]/editor";
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

  console.warn({ article_by_url });

  return (
    <EditableProvider editable={true}>
      <Shell>
        <div className="container h-full min-h-screen pt-8">
          <p>Readonly: {decodeURIComponent(novica_ime)}</p>
          <PlateEditor article={article_by_url} />
        </div>
      </Shell>
    </EditableProvider>
  );
}
