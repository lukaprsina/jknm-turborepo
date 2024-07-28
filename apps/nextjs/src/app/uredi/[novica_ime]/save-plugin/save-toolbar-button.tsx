"use client";

import React from "react";
import { withRef } from "@udecode/cn";
import { SaveIcon } from "lucide-react";

import { ToolbarButton } from "~/components/plate-ui/toolbar";
import { save_store } from "./save-store";
import { useSaveButton } from "./useSaveButton";

export const SaveToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const {
    props: { onClick, ...props },
  } = useSaveButton();
  const saving = save_store.use.saving;

  return (
    <ToolbarButton
      ref={ref}
      tooltip="Save"
      {...props}
      onClick={() => {
        save_store.set.saving(true);
        onClick();
        setTimeout(() => {
          save_store.set.saving(false);
        }, 1500);
      }}
      {...rest}
    >
      <div className="flex gap-2">
        <p hidden={!saving()}>Saving...</p>
        <SaveIcon />
      </div>
    </ToolbarButton>
  );
});
