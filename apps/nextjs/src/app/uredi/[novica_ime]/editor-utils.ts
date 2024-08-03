import type { OutputData } from "@editorjs/editorjs";

export function article_title_to_url(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

interface HeadingReturnType {
  title?: string;
  error?: "NO_HEADING" | "WRONG_HEADING_LEVEL";
}

export function get_heading_from_editor(
  editor_content: OutputData /* , toast: ToastType */,
): HeadingReturnType {
  const first_block = editor_content.blocks[0];

  if (first_block?.type === "header") {
    const first_header = first_block.data as {
      text: string;
      level: number;
    };

    const title = first_header.text.trim();
    if (first_header.level === 1) {
      return { title };
    } else {
      return { title, error: "WRONG_HEADING_LEVEL" };
    }
  } else {
    return { error: "NO_HEADING" };
  }
}
