"use client";

import type { Control } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@acme/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";

import type { form_schema } from "./settings-button";

export function SettingsForm({
  form_control,
}: {
  form_control: Control<z.infer<typeof form_schema>>;
}) {
  return (
    <>
      <FormField
        control={form_control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input placeholder="shadcn" {...field} />
            </FormControl>
            <FormDescription>This is your public display name.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </>
  );
}
