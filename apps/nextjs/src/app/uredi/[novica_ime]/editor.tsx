"use client";

import { useCallback, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { SaveIcon, XIcon } from "lucide-react";

import { Button } from "@acme/ui/button";

import { EDITOR_JS_PLUGINS } from "./plugins";

export default function MyEditor() {
  const editorJS = useRef<EditorJS | null>(null);

  const editor_factory = useCallback(async () => {
    const temp_editor = new EditorJS({
      holder: "editorjs",
      tools: EDITOR_JS_PLUGINS,
      data: default_value,
      autofocus: true,
    });
    await temp_editor.isReady;
    return temp_editor;
  }, []);

  // ...

  useEffect(() => {
    if (editorJS.current != null) return;
    const initializeEditor = async () => {
      const editor = await editor_factory();
      editorJS.current = editor;
    };

    void initializeEditor();
  }, [editor_factory]);

  return (
    <div className="prose lg:prose-xl dark:prose-invert mx-auto w-full outline outline-1">
      <MyToolbar editor={editorJS.current ?? undefined} />
      <div id="editorjs" />
    </div>
  );
}

function MyToolbar({ editor }: { editor?: EditorJS }) {
  if (!editor) return null;

  return (
    <div className="flex w-full justify-end space-x-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.save().then(console.log)}
      >
        <SaveIcon />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.clear()}>
        <XIcon />
      </Button>
    </div>
  );
}

const default_value = {
  time: 1635603431943,
  blocks: [
    {
      id: "sheNwCUP5A",
      type: "header",
      data: {
        text: "Editor.js",
        level: 1,
      },
    },
  ],
};
