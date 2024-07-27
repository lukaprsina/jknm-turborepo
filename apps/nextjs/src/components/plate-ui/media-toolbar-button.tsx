import type { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from "@udecode/plate-media";
import React from "react";
import { withRef } from "@udecode/cn";
import { useEditorRef } from "@udecode/plate-common";
import { insertMedia, useMediaToolbarButton } from "@udecode/plate-media";

import { Icons } from "~/components/icons";
import { ToolbarButton } from "./toolbar";

export const MediaToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType?: typeof ELEMENT_IMAGE | typeof ELEMENT_MEDIA_EMBED;
  }
>(({ nodeType, ...rest }, ref) => {
  const { props } = useMediaToolbarButton({ nodeType });
  const editor = useEditorRef();

  return (
    <ToolbarButton
      ref={ref}
      {...props}
      {...rest}
      /* onClick={async () =>
        await insertMedia(editor, {
          type: nodeType,
          getUrl: async () => "https://picsum.photos/200/300",
        })
      } */
    >
      <Icons.image />
    </ToolbarButton>
  );
});
