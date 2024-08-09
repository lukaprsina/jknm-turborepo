import { Shell } from "~/components/shell";
import { ArticleTable } from "./article-table";
import { DataTableDemo } from "./demo";

export default function Novice() {
  return (
    <Shell>
      <div className="container mx-auto w-full">
        <ArticleTable />
        <DataTableDemo />
      </div>
    </Shell>
  );
}
