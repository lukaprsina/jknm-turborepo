"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@acme/ui/button";

export const FakePaste = () => {
  const [editor, setEditor] = useState<Element | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      console.log("Paste event", event);
    };
    editor?.addEventListener("paste", handler);
    return () => {
      editor?.removeEventListener("paste", handler);
    };
  }, [editor]);

  const triggerPaste = (htmlContent: string) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/html", htmlContent);

    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true,
    });

    const temp_editor = document.querySelector("#editorjs");
    const target = temp_editor?.querySelector("div.ce-paragraph.cdx-block");

    if (!target) {
      console.error("Target not found");
      return;
    }

    setEditor(temp_editor);
    if (!temp_editor) {
      console.error("Editor not found");
      return;
    }

    console.log(pasteEvent);
    target.dispatchEvent(pasteEvent);
  };

  return (
    <Button
      onClick={() => {
        const htmlContent =
          "<p>This is <b>bold</b> text</p><ul><li>Item 1</li><li>Item 2</li></ul>";
        triggerPaste(htmlContent);
      }}
    >
      Fake Paste
    </Button>
  );
};

export default FakePaste;
