"use client";

import React, { useContext, useState } from "react";
import { withRef } from "@udecode/cn";
import { SaveIcon } from "lucide-react";

import { ToolbarButton } from "../../../components/plate-ui/toolbar";
import { useSaving } from "./save-context";
import { useSaveButton } from "./useSaveButton";

export const SaveToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const {
    props: { onClick, ...props },
  } = useSaveButton();
  const saving = useSaving();

  return (
    <ToolbarButton
      ref={ref}
      tooltip="Save"
      {...props}
      onClick={() => {
        saving?.setSaving(true);
        setTimeout(() => {
          saving?.setSaving(false);
        }, 1500);
        onClick();
      }}
      {...rest}
    >
      <div className="flex gap-2">
        <p hidden={!saving?.saving}>Saving...</p>
        <SaveIcon />
      </div>
    </ToolbarButton>
  );
});
