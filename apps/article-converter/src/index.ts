import fs from "node:fs";
import { finished } from "node:stream/promises";
import { parse } from "csv-parse";

export const name = "article-converter";

interface CSVType {
  title: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
}

async function main() {
  const cwd = new URL(".", import.meta.url).pathname.slice(1);
  console.log({ cwd });

  const csvData: CSVType[] = [];

  await finished(
    fs
      .createReadStream(`${cwd}../assets/Objave.txt`)
      .pipe(parse({ delimiter: "," }))
      .on("data", function (csvrow: string[]) {
        if (
          typeof csvrow[2] == "undefined" ||
          !csvrow[4] ||
          !csvrow[6] ||
          !csvrow[8] ||
          !csvrow[15]
        )
          throw new Error("Missing data");

        if (parseInt(csvrow[2]) !== 1) return;

        csvData.push({
          title: csvrow[4],
          content: csvrow[6],
          publishedAt: csvrow[8],
          updatedAt: csvrow[15],
        });
      }),
  );

  console.log(csvData.slice(0, 3));
}

await main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
