import React from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { withRef } from "@udecode/cn";

import { ToolbarButton } from "~/components/plate-ui/toolbar";
import { useSettingsButton } from "./useSettingsButton";

export const SettingsToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const { props } = useSettingsButton();

    return (
      <ToolbarButton ref={ref} tooltip="Settings" {...props} {...rest}>
        <GearIcon />
      </ToolbarButton>
    );
  },
);
