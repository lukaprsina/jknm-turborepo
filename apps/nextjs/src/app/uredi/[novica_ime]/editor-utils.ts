import EditorJS from "@editorjs/editorjs";

import type { Toast, ToasterToast } from "@acme/ui/use-toast";
import { ToastAction } from "@acme/ui/toast";

export function article_title_to_url(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

type ToastType = ({ ...props }: Toast) => {
  id: string;
  dismiss: () => void;
  update: (props: ToasterToast) => void;
};

export async function testing(editor: EditorJS, toast: ToastType) {
  const editor_content = await editor.save();
  const first_block = editor_content.blocks[0];
  let title: string | undefined = undefined;

  if (first_block?.type === "header") {
    const first_header = first_block.data as {
      text: string;
      level: number;
    };
    if (first_header.level === 1) {
      title = first_header.text.trim();
    } else {
      /* toast({
                title: "Naslov ni nivo H1",
                description: "Prva vrstica mora biti H1 naslov.",
                action: (
                  <ToastAction altText="Spremeni naslov v H1">
                    Spremeni naslov v H1
                  </ToastAction>
                ),
              }); */

      return;
    }
  } else {
    /* toast({
              title: "Naslov ni nastavljen",
              description: "Prva vrstica mora biti H1 naslov.",
              action: (
                <ToastAction altText="Dodaj naslov">Dodaj naslov</ToastAction>
              ),
            }); */

    return;
  }
}
