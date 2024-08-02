"use client";

import React from "react";
import { withRef } from "@udecode/cn";
import { SaveIcon } from "lucide-react";

import { ToolbarButton } from "~/components/plate-ui/toolbar";
import { save_store } from "./save-store";
import { useSaveButton } from "./useSaveButton";

export const SaveToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const { props } = useSaveButton();
  const saving_text = save_store.use.saving_text;

  return (
    <ToolbarButton ref={ref} tooltip="Save" {...props} {...rest}>
      <div className="flex gap-2">
        <p hidden={!saving_text()}>Saving...</p>
        <SaveIcon />
      </div>
    </ToolbarButton>
  );
});
