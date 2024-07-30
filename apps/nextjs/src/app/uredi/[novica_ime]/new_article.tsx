"use client";

import { redirect, useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import { api } from "~/trpc/react";

export default function NewArticleLoader() {
  const router = useRouter();
  const create_article = api.article.create.useMutation({
    onSuccess: (_, variables) => {
      router.push(`/uredi/${variables.url}`);
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          onClick={() => {
            const article_url = `nova-novica-${Date.now()}`;

            create_article.mutate({
              title: "Nova novica",
              url: article_url,
            });
          }}
        >
          Ustvari novico
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background">
        <Card>
          <CardHeader>
            <CardTitle>Ustvarjamo novo novico.</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between gap-4">
            <LoadingSpinner /> Prosimo, da malo počakate.
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
