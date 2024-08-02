import dynamic from "next/dynamic";

import { Shell } from "~/components/shell";

const Editor = dynamic(() => import("./editor"), {
  ssr: false,
});

export default function Page() {
  return (
    <Shell>
      <Editor />
    </Shell>
  );
}
