import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Shell } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { api } from "~/trpc/server";

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

async function LoadingCard() {
  const article_url = `nova-novica-${Date.now()}`;
  /* const article =  */ await Promise.all([
    api.article.create({
      title: "Nova novica",
      url: article_url,
    }),
    new Promise((resolve) => setTimeout(resolve, 100000)),
  ]);

  redirect(`/uredi/${encodeURIComponent(article_url)}`);
}

export default async function NovaNovica() {
  await LoadingCard();

  return (
    <Shell>
      <div className="container h-full min-h-screen pt-8">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>Ustvarjamo novo novico.</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between gap-4">
                  <LoadingSpinner /> Prosimo, da malo počakate.
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="secondary">Prekliči</Button>
                </CardFooter>
              </Card>
            </div>
          }
        ></Suspense>
      </div>
    </Shell>
  );
}
