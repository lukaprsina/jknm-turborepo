import { db } from "@acme/db/client";

export const name = "article-converter";

async function main() {
  const posts = await db.query.Post.findMany({
    limit: 10,
  });

  console.log(posts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
