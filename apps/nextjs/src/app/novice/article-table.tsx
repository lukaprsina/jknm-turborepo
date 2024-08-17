"use client";

import type { Hit as SearchHit } from "instantsearch.js";
import type { UseHitsProps } from "react-instantsearch";
import Link from "next/link";
import { TrashIcon } from "lucide-react";
import { useHits } from "react-instantsearch";

import type { Session } from "@acme/auth";
import type { ArticleHit } from "@acme/validators";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@acme/ui/alert-dialog";
import { Button } from "@acme/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@acme/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { EditButton } from "~/components/editing-buttons";
import { delete_algolia_article } from "~/server/algolia";
import { api } from "~/trpc/react";
import { MyStats } from "./search-components";

export function ArticleTable({
  session,
  ...props
}: { session?: Session } & UseHitsProps<ArticleHit>) {
  const { items } = useHits(props);

  return (
    <Table>
      {/* <TableCaption>Novice.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Naslov</TableHead>
          <TableHead>URL</TableHead>
          {session && <TableHead className="text-right"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <ArticleTableRow hit={item} session={session} key={item.objectID} />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}></TableCell>
          <TableCell className="text-right">
            <MyStats />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

function ArticleTableRow({
  hit,
  session,
}: {
  hit: SearchHit<ArticleHit>;
  session?: Session;
}) {
  return (
    <TableRow key={hit.objectID}>
      <TableCell>{hit.objectID}</TableCell>
      <TableCell className="font-medium">
        <Button variant="link" asChild>
          <Link href={`/novica/${hit.url}`}>{hit.title}</Link>
        </Button>
      </TableCell>
      <TableCell>{hit.url}</TableCell>
      {session && (
        <TableCell className="flex justify-end gap-2">
          <EditButton
            id={parseInt(hit.objectID)}
            url={hit.url}
            preview_image={hit.image}
            content={hit.content}
            has_draft={hit.has_draft}
            variant="outline"
          />
          <DeleteDialog article_id={parseInt(hit.objectID)} />
        </TableCell>
      )}
    </TableRow>
  );
}

function DeleteDialog({ article_id }: { article_id: number }) {
  const trpc_utils = api.useUtils();

  const article_delete = api.article.delete.useMutation({
    onSuccess: async (data) => {
      const returned_data = data.at(0);
      if (!returned_data) return;

      console.log("delete article", returned_data);
      await delete_algolia_article(returned_data.id.toString());

      await trpc_utils.article.invalidate();
    },
  });

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon">
              <TrashIcon size={20} />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Zbriši novico</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zbriši novico</AlertDialogTitle>
          <AlertDialogDescription>
            Ste prepričani, da želite zbrisati novico?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Ne zbriši</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              article_delete.mutate(article_id);
            }}
          >
            Zbriši
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
