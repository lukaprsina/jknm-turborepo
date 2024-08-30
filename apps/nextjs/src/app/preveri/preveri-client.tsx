"use client";

import { useMemo, useState } from "react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { useToast } from "@acme/ui/use-toast";

export function PreveriClient({
  articles,
}: {
  articles: {
    id: number;
    old_id: number | null;
  }[];
}) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState(1);

  const page_info = useMemo(() => {
    const article_index = articles.findIndex(
      (article) => article.old_id === page,
    );

    if (article_index === -1) {
      return {
        next: NaN,
        previous: NaN,
      };
    }

    return {
      next: articles[article_index + 1]?.old_id ?? NaN,
      previous: articles[article_index - 1]?.old_id ?? NaN,
    };
  }, [articles, page]);

  return (
    <div className="prose dark:prose-invert container w-full pb-6 pt-8">
      <h1>Preveri</h1>
      <h2>Stran {page}</h2>
      <div className="my-8 flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            disabled={isNaN(page_info.previous)}
            onClick={() => setPage(page_info.previous)}
          >
            Prejšnja: {page_info.previous}
          </Button>
          <Button
            disabled={isNaN(page_info.next)}
            onClick={() => setPage(page_info.next)}
          >
            Naslednja: {page_info.next}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            id="stran"
            value={inputPage}
            onChange={(event) => {
              const number = parseInt(event.target.value);
              if (isNaN(number)) {
                toast.toast({
                  title: `ne obstaja`,
                  // type: "",
                });

                return;
              }
              setInputPage(number);
            }}
          />
          <Button onClick={() => setPage(inputPage)}>Pojdi</Button>
        </div>
      </div>
      <iframe
        src={`https://www.jknm.si/si/?id=${page}`}
        className="h-screen w-full"
      />
    </div>
  );
}
