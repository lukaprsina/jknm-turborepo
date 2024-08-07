"use client";

export const trigger_fake_paste = (htmlContent: string) => {
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

  if (!temp_editor) {
    console.error("Editor not found");
    return;
  }

  console.log(pasteEvent);
  target.dispatchEvent(pasteEvent);
};
