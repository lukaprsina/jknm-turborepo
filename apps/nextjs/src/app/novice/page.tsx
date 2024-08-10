import { Shell } from "~/components/shell";
import { Search } from "./search";

export const dynamic = 'force-dynamic';

export default function Novice() {
  return (
    <Shell>
      <div className="container mx-auto w-full px-0">
        {/* <ArticleTable /> */}
        {/* <DataTableDemo /> */}
        <Search />
      </div>
    </Shell>
  );
}
