import type { Value } from "@udecode/plate-common/server";
import { useEditorRef } from "@udecode/plate-common";
import { TText } from "@udecode/plate-common/server";
import { PlateEditor } from "@udecode/plate-core";

import { api } from "~/trpc/react";
import { settings_store } from "./settings-store";

function get_title_from_editor(editor: PlateEditor<Value>) {
  const possible_h1 = editor.children[0];
  if (!possible_h1 || possible_h1.type !== "h1") return;
  if (
    possible_h1.children.length !== 1 ||
    typeof possible_h1.children[0]?.text !== "string"
  )
    return;

  return possible_h1.children[0].text;
}

function get_images_from_editor(editor: PlateEditor<Value>) {
  const image_urls = editor.children
    .filter((child) => child.type === "img")
    .map((child) => {
      return child.url as string;
    });

  return image_urls;
}

export const useSettingsButton = () => {
  const editor = useEditorRef();
  const update_article = api.article.update.useMutation({
    onSuccess: (_, variables) => {
      settings_store.set.settings_open(false);
      console.log("Article updated", variables);
    },
  });

  return {
    props: {
      onClick: () => {
        // settings_store.set.settings_open(!settings_store.get.settings_open());
        const title = get_title_from_editor(editor);

        if (!title) {
          alert(
            "Naslov ni pravilno nastavljen. Naslov mora biti v prvem odstavku in mora biti označen z H1 oznako.",
          );
          return;
        }
        // settings_store.set.title(title);

        const new_url = encodeURIComponent(
          title.toLowerCase().replace(/\s/g, "-"),
        );
        // settings_store.set.url(new_url);

        const image_urls = get_images_from_editor(editor);
        // settings_store.set.image_urls(image_urls);

        console.log("Updating", title, editor.children, new_url);
        // TODO: first get the id of the current article by url
        // then mutate with id
        update_article.mutate({
          title,
          content: editor.children,
          url: new_url,
        });
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
