import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@acme/ui/breadcrumb";

import { Shell } from "~/components/shell";
import { PlateComponent } from "./editor";

interface PlatePageProps {
  novica_ime: string;
}

export default function PlatePage({ novica_ime }: PlatePageProps) {
  return (
    <Shell>
      <div className="container min-h-screen pt-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Domov</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/novica/${novica_ime}`}>
                {novica_ime}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PlateComponent />
      </div>
    </Shell>
  );
}
