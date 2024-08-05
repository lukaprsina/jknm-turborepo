"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Article } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import { DateTimePicker } from "@acme/ui/date-time-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";

import type { SaveCallbackType } from "./editor";
import { api } from "~/trpc/react";
import { settings_store } from "./settings-store";

export const form_schema = z.object({
  /* TODO: message to all zod fields
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }), */
  title: z.string().min(2).optional(),
  url: z.string().min(2).optional(),
  created_at: z.date().optional(),
  preview_image: z.string().nullable(),
});

export function SettingsForm({
  article,
  save_callback,
}: {
  article: typeof Article.$inferInsert;
  save_callback: SaveCallbackType;
}) {
  const [override, setOverride] = useState<boolean>(false);
  const router = useRouter();

  const article_delete = api.article.delete.useMutation({
    onSuccess: () => {
      router.replace(`/`);
    },
  });

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      title: settings_store.get.title(),
      url: settings_store.get.url(),
      preview_image: settings_store.get.preview_image() ?? null,
      created_at: article.created_at,
    },
  });

  async function onDraftSave(values: z.infer<typeof form_schema>) {
    await save_callback({
      variables: values,
      update: { draft: true },
    });
  }

  async function onUnpublish(values: z.infer<typeof form_schema>) {
    await save_callback({
      variables: { published: false, ...values },
      update: { draft: true, content: true },
    });
  }

  async function onPublish(values: z.infer<typeof form_schema>) {
    await save_callback({
      variables: { published: true, ...values },
      update: { draft: true, content: true },
    });
  }

  function onDelete(_: z.infer<typeof form_schema>) {
    if (!article.id) {
      console.error("Article ID is missing.");
      return;
    }

    article_delete.mutate(article.id);
  }

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={override}
              onCheckedChange={(checked) => setOverride(checked === true)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Omogoči popravljanje polj.</FormLabel>
            <FormDescription>
              Obkljukajte, da lahko ročno nastavite spodnja polja.
            </FormDescription>
          </div>
        </FormItem>
        <div
          className={cn(
            "space-y-6 rounded-md p-4 outline outline-1 outline-muted",
            override || "bg-muted",
          )}
        >
          <FormField
            disabled={!override}
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naslov</FormLabel>
                <FormControl>
                  <Input placeholder={article.title} {...field} />
                </FormControl>
                <FormDescription>
                  Če želite spremeniti naslov, to raje naredite v članku.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={!override}
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder={article.url} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={!override}
            control={form.control}
            name="created_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Čas objave</FormLabel>
                <FormControl>
                  <DateTimePicker {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <Button
            type="submit"
            onClick={form.handleSubmit(onPublish)}
            variant="secondary"
          >
            Objavi spremembe
          </Button>
          {article.published ? (
            <Button
              onClick={form.handleSubmit(onUnpublish)}
              variant="secondary"
            >
              Skrij novičko
            </Button>
          ) : null}
          <Button
            type="submit"
            onClick={form.handleSubmit(onDelete)}
            variant="secondary"
          >
            Zbriši novičko
          </Button>
          <hr />
          <Button type="submit" onClick={form.handleSubmit(onDraftSave)}>
            Shrani osnutek
          </Button>
        </div>
      </form>
    </Form>
  );
}
