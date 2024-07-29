"use client";

import { api } from "~/trpc/react";
import PlateEditor from "./editor";
import SettingsDialog from "./settings-dialog";

export default function Client({ novica_ime }: { novica_ime: string }) {
  // api.article.byUrl.useSuspenseQuery({ url: decodeURIComponent(novica_ime) });
  return (
    <>
      <PlateEditor />
      <SettingsDialog novica_ime={novica_ime} />
    </>
  );
}
