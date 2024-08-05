/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ToolConstructable, ToolSettings } from "@editorjs/editorjs";
// @ts-expect-error no types
import AttachesTool from "@editorjs/attaches";
// @ts-expect-error no types
import CheckList from "@editorjs/checklist";
// @ts-expect-error no types
import Code from "@editorjs/code";
// @ts-expect-error no types
import Delimiter from "@editorjs/delimiter";
// @ts-expect-error no types
import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import List from "@editorjs/list";
// @ts-expect-error no types
import Marker from "@editorjs/marker";
// @ts-expect-error no types
import Paragraph from "@editorjs/paragraph";
// @ts-expect-error no types
import Quote from "@editorjs/quote";
// @ts-expect-error no types
import Table from "@editorjs/table";
// @ts-expect-error no types
import Warning from "@editorjs/warning";

export const EDITOR_JS_PLUGINS: Record<
  string,
  ToolConstructable | ToolSettings
> = {
  paragraph: Paragraph,
  embed: Embed,
  table: {
    class: Table,
    // inlineToolbar: true,
    config: {
      withHeadings: true,
    },
  },
  marker: Marker,
  list: {
    // @ts-expect-error no types
    class: List,
    // inlineToolbar: true,
    config: {
      defaultStyle: "unordered",
    },
  },
  warning: Warning,
  code: Code,
  // linkTool: LinkTool,
  attaches: {
    class: AttachesTool,
    config: {
      endpoint: "/api/upload_file",
    },
  },
  image: {
    // @ts-expect-error no types
    class: Image,
    config: {
      endpoints: {
        byFile: "/api/upload_image_by_file",
        byUrl: "/api/upload_image_by_url",
      },
    },
  },
  header: {
    // @ts-expect-error no types
    class: Header,
    config: {
      defaultLevel: 2,
    },
  },
  quote: Quote,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
};
