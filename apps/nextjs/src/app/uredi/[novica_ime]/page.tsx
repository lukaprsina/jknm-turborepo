import { useMemo } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@acme/ui/breadcrumb";

import { Shell } from "~/components/shell";
import { api } from "~/trpc/server";
import Client from "./client";
import PlateEditor from "./editor";
import SettingsDialog from "./settings-dialog";

interface PlatePageProps {
  params: {
    novica_ime: string;
  };
}

export default async function PlatePage({
  params: { novica_ime },
}: PlatePageProps) {
  const article_by_url = await api.article.byUrl({
    url: decodeURIComponent(novica_ime),
  });

  const article = article_by_url?.published
    ? article_by_url?.content
    : article_by_url?.draftContent;

  return (
    <Shell>
      <div className="container min-h-screen pt-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Domov</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Uredi</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/novica/${novica_ime}`}>
                {novica_ime}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* <Client novica_ime={novica_ime} /> */}
        <PlateEditor article={article_by_url} />
        <SettingsDialog novica_ime={novica_ime} />
      </div>
    </Shell>
  );
}
