"use client";

import React, { useRef } from "react";
import { withRef } from "@udecode/cn";
import { useEditorRef } from "@udecode/plate-common";
import { FileDownIcon, FileUpIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@acme/ui/alert-dialog";

import { ToolbarButton } from "~/components/plate-ui/toolbar";
import { settings_store } from "../settings-plugins/settings-store";

export const ImportToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const editor = useEditorRef();
    const form_ref = useRef<HTMLFormElement>(null);

    return (
      <form ref={form_ref}>
        <input
          hidden
          type="file"
          /* onChange={async (event) => {
            const files = event.target.files;
            if (!files || !files[0]) return;
            const text_value = await files[0].text();
            const json_value = JSON.parse(text_value);
            console.log(json_value);
            editor.children = json_value;
          }} */
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <ToolbarButton ref={ref} tooltip="Import" {...rest}>
              <FileDownIcon />
            </ToolbarButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ste prepričani?</AlertDialogTitle>
              <AlertDialogDescription>
                Uvoz bo prepisal trenutno vsebino.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Prekliči</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  form_ref.current?.querySelector("input")?.click();
                }}
              >
                Nadaljuj
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    );
  },
);

export const ExportToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const editor = useEditorRef();

    return (
      <ToolbarButton
        ref={ref}
        tooltip="Export"
        onClick={() => {
          console.log(settings_store.get.title());
          const value_text = JSON.stringify(editor.children);
          const blob = new Blob([value_text], { type: "application/json" });

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${settings_store.get.title()}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
        {...rest}
      >
        <FileUpIcon />
      </ToolbarButton>
    );
  },
);
