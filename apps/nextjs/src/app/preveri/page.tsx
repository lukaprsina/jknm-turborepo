import { asc } from "@acme/db";
import { db } from "@acme/db/client";
import { Article } from "@acme/db/schema";

import { Shell } from "~/components/shell";
// import { read_articles } from "../converter/converter-server";
import { PreveriClient } from "./preveri-client";

export default async function PreveriPage() {
  const articles = await db.query.Article.findMany({
    columns: {
      id: true,
      old_id: true,
    },
    orderBy: asc(Article.old_id),
  });

  // const csv_articles = await read_articles();

  return (
    <Shell without_footer>
      <PreveriClient articles={articles} /* csv_articles={csv_articles} */ />
    </Shell>
  );
}
