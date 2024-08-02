"use client";

import { Button } from "@acme/ui/button";

import { read_articles } from "~/server/article-converter";

export default function Page() {
  return (
    <div>
      <h1>Article Converter</h1>
      <p>This is a tool to convert articles from one format to another.</p>
      <Button
        onClick={async () => {
          await read_articles();
        }}
      >
        Convert
      </Button>
    </div>
  );
}
