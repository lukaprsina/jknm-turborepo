import type EditorJS from "@editorjs/editorjs";
import { Settings2Icon } from "lucide-react";

import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";

import {
  article_title_to_url,
  get_heading_from_editor,
  get_image_urls_from_editor as get_image_data_from_editor,
} from "./editor-utils";
import { SettingsForm } from "./settings-form";
import { settings_store } from "./settings-store";

export function SettingsDialog({
  editor,
  article,
}: {
  editor: EditorJS;
  article: typeof Article.$inferInsert;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          onClick={async () => {
            const editor_content = await editor.save();

            const image_data = get_image_data_from_editor(editor_content);
            settings_store.set.image_data(image_data);

            const { title, error } = get_heading_from_editor(editor_content);
            if (!title || error) {
              console.error("Title not found.");
              return;
            }

            settings_store.set.title(title);
            settings_store.set.url(article_title_to_url(title));
          }}
          variant="ghost"
          size="icon"
        >
          <Settings2Icon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Uredi novičko</DialogTitle>
          <DialogDescription>
            Spremeni naslov, določi naslovno slike, objavi ali shrani kot
            osnutek.
          </DialogDescription>
        </DialogHeader>
        <SettingsForm article={article} editor={editor} />
      </DialogContent>
    </Dialog>
  );
}
