"use server";

import fs from "node:fs";
import { finished } from "node:stream/promises";
import { parse } from "csv-parse";

interface CSVType {
  title: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
}

export async function read_articles() {
  const csvData: CSVType[] = [];

  await finished(
    fs
      .createReadStream(`./assets/Objave.txt`)
      .pipe(parse({ delimiter: "," }))
      .on("data", function (csvrow: string[]) {
        if (typeof csvrow[2] == "undefined" || parseInt(csvrow[2]) !== 1)
          return;
        if (!csvrow[4] || !csvrow[6] || !csvrow[8] || !csvrow[15])
          throw new Error("Missing data: " + JSON.stringify(csvrow, null, 2));

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
