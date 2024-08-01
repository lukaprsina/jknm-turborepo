import React from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { withRef } from "@udecode/cn";

import { ToolbarButton } from "~/components/plate-ui/toolbar";
import { clean_directory } from "~/server/image-s3";
import { settings_store } from "./settings-store";
import { useSettingsButton } from "./useSettingsButton";

export const SettingsToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    // const { props } = useSettingsButton();
    return (
      <ToolbarButton
        ref={ref}
        tooltip="Settings"
        onClick={() => {
          const spliced_urls = settings_store.get
            .image_urls()
            .map((image_url) => {
              // get the last part of the url
              const parts = image_url.split("/");
              const filename = parts.slice(-1).join("/");
              return filename;
            });
          clean_directory(settings_store.get.url(), spliced_urls);
        }}
        {...rest}
      >
        <GearIcon />
      </ToolbarButton>
    );
  },
);
