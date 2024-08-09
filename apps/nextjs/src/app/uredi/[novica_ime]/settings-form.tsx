"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
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

import type { SaveCallbackType } from "./editor";
import { api } from "~/trpc/react";
import { ImageCarousel } from "./image-carousel";
import { settings_store } from "./settings-store";

export const form_schema = z.object({
  /* TODO: message to all zod fields
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }), */
  created_at: z.date().optional(),
  preview_image: z.string().optional(),
});

export function SettingsForm({
  article,
  save_callback,
  closeDialog,
}: {
  article: typeof Article.$inferInsert;
  save_callback: SaveCallbackType;
  closeDialog: () => void;
}) {
  const router = useRouter();

  const article_delete = api.article.delete.useMutation({
    onSuccess: () => {
      router.replace(`/`);
    },
  });

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      preview_image: settings_store.get.preview_image() ?? undefined,
      created_at: article.created_at,
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          defaultValue={
            article.preview_image ??
            settings_store.get.image_data()[0]?.url ??
            undefined
          }
          name="preview_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Naslovna slika</FormLabel>
              <FormDescription>
                Izberite naslovno sliko za novičko.
              </FormDescription>
              <FormControl>
                <ImageCarousel
                  article={article}
                  onImageUrlChange={(value) => field.onChange(value)}
                  imageUrl={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
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
        <div className="mt-6 flex flex-col gap-4">
          <Button
            onClick={form.handleSubmit(
              async (values: z.infer<typeof form_schema>) => {
                await save_callback({
                  variables: {
                    ...values,
                    published: true,
                    draft_content: null,
                  },
                  update: { content: true },
                  redirect_to: "novica",
                });

                closeDialog();
              },
            )}
            variant="secondary"
          >
            Objavi spremembe
          </Button>
          {article.published ? (
            <Button
              onClick={form.handleSubmit(
                async (values: z.infer<typeof form_schema>) => {
                  await save_callback({
                    variables: { published: false, ...values },
                    update: { draft: true, content: true },
                  });

                  closeDialog();
                },
              )}
              variant="secondary"
            >
              Skrij novičko
            </Button>
          ) : null}
          <Button
            onClick={form.handleSubmit((_: z.infer<typeof form_schema>) => {
              if (!article.id) {
                console.error("Article ID is missing.");
                return;
              }

              article_delete.mutate(article.id);

              closeDialog();
            })}
            variant="destructive"
          >
            Zbriši novičko
          </Button>
          <hr />
          <Button
            onClick={form.handleSubmit(
              async (values: z.infer<typeof form_schema>) => {
                await save_callback({
                  variables: values,
                  update: { draft: true },
                });

                closeDialog();
              },
            )}
          >
            Shrani osnutek
          </Button>
        </div>
      </form>
    </Form>
  );
}
