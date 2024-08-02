import type { ToolConstructable, ToolSettings } from "@editorjs/editorjs";
import CheckList from "@editorjs/checklist";
import Code from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import Warning from "@editorjs/warning";

export const EDITOR_JS_PLUGINS: Record<
  string,
  ToolConstructable | ToolSettings
> = {
  embed: Embed,
  table: Table,
  marker: Marker,
  list: {
    class: List,
    inlineToolbar: true,
    config: {
      defaultStyle: "unordered",
    },
  },
  warning: Warning,
  code: Code,
  // linkTool: LinkTool,
  image: {
    class: Image,
    config: {
      endpoints: {
        byFile: "/api/upload_image_by_file",
        byUrl: "/api/upload_image_by_url",
      },
    },
  },
  header: Header,
  quote: Quote,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
};
