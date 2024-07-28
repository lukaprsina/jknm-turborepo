import { Breadcrumb } from "@acme/ui/breadcrumb";

import { Shell } from "~/components/shell";
import { PlateComponent } from "./editor";

type PlatePageProps = { novica_ime: string };

export default function PlatePage({ novica_ime }: PlatePageProps) {
  return (
    <Shell>
      <div className="container min-h-screen pt-8">
        <Breadcrumb></Breadcrumb>
        <PlateComponent />
      </div>
    </Shell>
  );
}
