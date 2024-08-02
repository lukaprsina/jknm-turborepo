"use client";

import { useMemo } from "react";
import Checklist from "@editorjs/checklist";
import EditorJS from "@editorjs/editorjs";
import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import Link from "@editorjs/link";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";

import { uploadFile } from "../uredi/[novica_ime]/cloud/uploadFiles";
import { settings_store } from "../uredi/[novica_ime]/settings-plugins/settings-store";

export default function Page() {
  useMemo(() => {
    new EditorJS({
      holder: "editorjs",
      tools: {
        header: Header,
        checklist: Checklist,
        embed: Embed,
        image: {
          class: Image,
          config: {
            /* endpoints: {
              byFile: "http://localhost:3000/api/upload",
              byUrl: "http://localhost:3000/api/fetchUrl",
            }, */
            uploader: {
              uploadByFile: async (file: File) => {
                return await uploadFile(null, file, settings_store.get.url());
              },
            },
          },
        },
        link: Link,
        list: List,
        quote: Quote,
      },
      onReady: () => {
        console.log("Editor.js is ready to work!");
      },
    });
  }, []);

  return (
    <div className="container h-full min-h-screen pt-8 outline outline-1">
      <div id="editorjs"></div>
    </div>
  );
}
