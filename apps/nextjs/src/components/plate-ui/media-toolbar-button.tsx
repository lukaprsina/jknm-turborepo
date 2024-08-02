"use client";

import React, { useState } from "react";
import { withRef } from "@udecode/cn";
import { useEditorRef } from "@udecode/plate-common";
import {
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  insertMedia,
} from "@udecode/plate-media";

import { uploadFile } from "~/app/uredi_old/[novica_ime]/cloud/uploadFiles";
import { settings_store } from "~/app/uredi_old/[novica_ime]/settings-plugins/settings-store";
import { Icons } from "~/components/icons";
import { ToolbarButton } from "./toolbar";

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const editor = useEditorRef();
  const [uploading, setUploading] = useState(false);
  const file_input_ref = React.useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    await uploadFile(editor, file, settings_store.get.url());
    setUploading(false);
  };

  return (
    <form>
      <input
        id="file"
        hidden
        type="file"
        onChange={handleChange}
        ref={file_input_ref}
        accept="image/png, image/jpeg"
      />
      <ToolbarButton
        ref={ref}
        disabled={uploading}
        tooltip="Image"
        onClick={async () => {
          if (nodeType === ELEMENT_MEDIA_EMBED) {
            await insertMedia(editor, { type: nodeType });
          } else {
            file_input_ref.current?.click();
          }
        }}
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
        }}
        {...rest}
      >
        <Icons.image />
      </ToolbarButton>
    </form>
  );
});
