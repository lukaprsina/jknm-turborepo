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
import {
  ItalicInlineTool,
  StrongInlineTool,
  UnderlineInlineTool,
} from "editorjs-inline-tool";

// import type { useToast } from "@acme/ui/use-toast";

import {
  upload_file,
  upload_image_by_file,
  upload_image_by_url,
} from "../app/uredi/[novica_ime]/upload-file";

export interface EditorJSImageData {
  caption: string;
  file: {
    url: string;
    width?: number;
    height?: number;
  };
  stretched?: boolean;
  withBackground?: boolean;
  withBorder?: boolean;
}

export function EDITOR_JS_PLUGINS(): Record<
  // toast: ReturnType<typeof useToast>,
  string,
  ToolConstructable | ToolSettings
> {
  return {
    image: {
      // @ts-expect-error no types
      class: Image,
      // inlineToolbar: ["link"],
      inlineToolbar: true,
      config: {
        /* endpoints: {
          byFile: "/api/upload_image_by_file",
          byUrl: "/api/upload_image_by_url",
        }, */
        uploader: {
          uploadByFile: (file: File) => upload_image_by_file(file),
          uploadByUrl: (url: string) => upload_image_by_url(url),
        },
      },
    },
    attaches: {
      class: AttachesTool,
      config: {
        uploader: {
          uploadByFile: (file: File) => upload_file(file),
        },
        // endpoint: "/api/upload_file",
      },
    },
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
    },
    embed: Embed,
    italic: ItalicInlineTool,
    strong: StrongInlineTool,
    underline: UnderlineInlineTool,
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
      inlineToolbar: true,
      config: {
        defaultStyle: "unordered",
      },
    },
    warning: Warning,
    code: Code,
    // linkTool: LinkTool,
    header: {
      // @ts-expect-error no types
      class: Header,
      inlineToolbar: true,
      config: {
        defaultLevel: 2,
      },
    },
    quote: Quote,
    checklist: CheckList,
    delimiter: Delimiter,
    inlineCode: InlineCode,
  };
}
