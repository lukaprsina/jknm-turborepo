import MyEditor from "~/app/uredi/[novica_ime]/editor";
import { settings_store } from "~/app/uredi/[novica_ime]/settings-plugins/settings-store";
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

  console.warn({ novica_ime: decodeURIComponent(novica_ime) });

  return (
    <EditableProvider editable={false}>
      <Shell article_url={decodeURIComponent(novica_ime)}>
        <div className="container h-full min-h-screen pt-8">
          <p>Readonly: {decodeURIComponent(novica_ime)}</p>
          <MyEditor viewer article={article_by_url} />
        </div>
      </Shell>
    </EditableProvider>
  );
}
