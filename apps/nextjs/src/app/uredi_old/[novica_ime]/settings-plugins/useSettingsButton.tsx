"use client";

import { useEditorRef } from "@udecode/plate-common";

import { clean_directory } from "~/server/image-s3";
import { settings_store } from "./settings-store";

export const useSettingsButton = () => {
  const editor = useEditorRef();

  return {
    props: {},
  };
};
