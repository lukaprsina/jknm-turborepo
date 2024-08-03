import type { OutputData } from "@editorjs/editorjs";

/* import type { Toast, ToasterToast } from "@acme/ui/use-toast";
import { ToastAction } from "@acme/ui/toast"; */

export function article_title_to_url(title: string) {
  return title.toLowerCase().replace(/\s+/g, "-");
}

/* type ToastType = ({ ...props }: Toast) => {
  id: string;
  dismiss: () => void;
  update: (props: ToasterToast) => void;
}; */

interface HeadingReturnType {
  title?: string;
  error?: "NO_HEADING" | "WRONG_HEADING_LEVEL";
}

export function get_heading_from_editor(
  editor_content: OutputData /* , toast: ToastType */,
): HeadingReturnType {
  const first_block = editor_content.blocks[0];
  let title: string | undefined = undefined;

  if (first_block?.type === "header") {
    const first_header = first_block.data as {
      text: string;
      level: number;
    };
    if (first_header.level === 1) {
      title = first_header.text.trim();
      return { title };
    } else {
      return { error: "WRONG_HEADING_LEVEL" };
    }
  } else {
    return { error: "NO_HEADING" };
  }
}
