import { auth } from "@acme/auth";

import { Shell } from "~/components/shell";
import { Search } from "./search";

export const dynamic = "force-dynamic";

export default async function Novice() {
  const session = await auth();

  return (
    <Shell>
      <div className="container mx-auto w-full pb-6 pt-8">
        <Search session={session ?? undefined} />
      </div>
    </Shell>
  );
}
