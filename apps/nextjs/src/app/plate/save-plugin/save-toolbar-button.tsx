import React from "react";
import { withRef } from "@udecode/cn";
import { SaveIcon } from "lucide-react";

import { ToolbarButton } from "../../../components/plate-ui/toolbar";
import { useSaveButton } from "./useSaveButton";

export const SaveToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const { props } = useSaveButton();

  return (
    <ToolbarButton ref={ref} tooltip="Save" {...props} {...rest}>
      <SaveIcon />
    </ToolbarButton>
  );
});
