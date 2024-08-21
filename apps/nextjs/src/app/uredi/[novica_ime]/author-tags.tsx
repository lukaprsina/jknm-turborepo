import type { Tag } from "emblor";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Delimiter, TagInput } from "emblor";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@acme/ui/button";
import { FancyBox } from "@acme/ui/fancy-box";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { toast } from "@acme/ui/use-toast";

const FormSchema = z.object({
  topics: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
});

export function AuthorTags() {
  return <FancyBox />;
}

export function AuthorTags2() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [tags, setTags] = React.useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(
    null,
  );

  const { setValue } = form;

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div id="try" className="w-full py-8">
      <div className="relative my-4 flex w-full flex-col space-y-2">
        <div className="preview relative mt-2 flex min-h-[350px] w-full items-center justify-center rounded-md border p-10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-start space-y-8"
            >
              <FormField
                control={form.control}
                name="topics"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel className="text-left">Topics</FormLabel>
                    <FormControl>
                      <TagInput
                        activeTagIndex={activeTagIndex}
                        setActiveTagIndex={setActiveTagIndex}
                        enableAutocomplete
                        autocompleteOptions={[
                          { id: "1", text: "React" },
                          { id: "2", text: "SolidJS" },
                        ]}
                        autocompleteFilter={(option) =>
                          option.toLowerCase().includes("react")
                        }
                        usePopoverForTags={true}
                        delimiter={Delimiter.Comma}
                        {...field}
                        placeholder="Enter a topic"
                        tags={tags}
                        className="sm:min-w-[450px]"
                        setTags={(newTags) => {
                          setTags(newTags);
                          setValue("topics", newTags as [Tag, ...Tag[]]);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      These are the topics that you&apos;re interested in.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
