"use client";

import { useState } from "react";
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

export const form_schema = z.object({
  /* TODO: message to all zod fields
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }), */
  title: z.string().min(2),
  url: z.string().min(2),
  published_at: z.date().optional(),
  updated_at: z.date().optional(),
  image_url: z.string(),
});

export function SettingsForm({
  article,
}: {
  article: typeof Article.$inferInsert;
}) {
  const [override, setOverride] = useState<boolean>(false);

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      title: article.title,
      url: article.url,
      published_at: new Date(),
      updated_at: new Date(),
      image_url: "https://example.com/image.jpg",
    },
  });

  function onDraftSave(values: z.infer<typeof form_schema>) {
    console.log(values);
  }

  function onDelete(values: z.infer<typeof form_schema>) {
    console.log(values);
  }

  function onPublish(values: z.infer<typeof form_schema>) {
    console.log(values);
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
            name="published_at"
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
          <FormField
            disabled={!override}
            control={form.control}
            name="updated_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex flex-col">
                  Zadnja posodobitev
                </FormLabel>
                <FormControl>
                  <DateTimePicker {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <Button onClick={form.handleSubmit(onPublish)} variant="secondary">
            Objavi spremembe
          </Button>
          <Button onClick={form.handleSubmit(onDelete)} variant="secondary">
            Zbriši novičko
          </Button>
          <hr />
          <Button onClick={form.handleSubmit(onDraftSave)}>
            Shrani osnutek
          </Button>
        </div>
      </form>
    </Form>
  );
}
