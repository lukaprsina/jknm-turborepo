"use client";

import type { Hit as SearchHit } from "instantsearch.js";
import type { UseHitsProps } from "react-instantsearch";
import { useEffect } from "react";
import Link from "next/link";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "lucide-react";
import { useHits, useSortBy } from "react-instantsearch";

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
import { format_date } from "~/lib/format-date";
import { generate_encoded_url } from "~/lib/generate-encoded-url";
import { delete_algolia_article } from "~/server/algolia";
import { delete_s3_directory } from "~/server/image-s3";
import { api } from "~/trpc/react";
import { MyStats, SORT_BY_ITEMS } from "./search-components";

export function ArticleTable({
  session,
  ...props
}: { session?: Session } & UseHitsProps<ArticleHit>) {
  const { items } = useHits(props);
  const sort_api = useSortBy({
    items: SORT_BY_ITEMS,
  });

  useEffect(() => {
    console.log("sort_api", sort_api, !!session);
  }, [sort_api, session]);

  return (
    <Table>
      {/* <TableCaption>Novice.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => {
                sort_api.refine(
                  sort_api.currentRefinement === "novice_name_asc"
                    ? "novice_name_desc"
                    : "novice_name_asc",
                );
              }}
            >
              Naslov
              {sort_api.currentRefinement === "novice_name_asc" && (
                <ChevronDownIcon />
              )}
              {sort_api.currentRefinement === "novice_name_desc" && (
                <ChevronUpIcon />
              )}
            </Button>
          </TableHead>
          <TableHead>Avtorji</TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => {
                sort_api.refine(
                  sort_api.currentRefinement === "novice_date_asc"
                    ? "novice"
                    : "novice_date_asc",
                );
              }}
            >
              Datum nastanka
              {sort_api.currentRefinement === "novice_date_asc" && (
                <ChevronDownIcon />
              )}
              {sort_api.currentRefinement === "novice" && <ChevronUpIcon />}
            </Button>
          </TableHead>
          {session && <TableHead className="text-right">Admin</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <ArticleTableRow hit={item} session={session} key={item.objectID} />
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}></TableCell>
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
          <Link
            href={`/novica/${generate_encoded_url({
              id: parseInt(hit.objectID),
              url: hit.url,
            })}`}
          >
            {hit.title}
          </Link>
        </Button>
      </TableCell>
      <TableCell>
        {hit.authors.map((author, index) => (
          <span key={index}>
            {author}
            {index !== hit.authors.length - 1 && ",\u00A0"}
          </span>
        ))}
      </TableCell>
      <TableCell>{format_date(new Date(hit.created_at))}</TableCell>
      {session && (
        <TableCell className="flex flex-grow justify-end gap-2">
          <EditButton
            id={parseInt(hit.objectID)}
            url={hit.url}
            content_preview={hit.content_preview}
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

      await delete_algolia_article(returned_data.id.toString());
      await delete_s3_directory(`${returned_data.url}-${returned_data.id}`);

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
