"use client";

import React, { createContext } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export interface SaveOptions {
  save_draft: ReturnType<typeof api.article.save_draft.useMutation>["mutate"];
  publish: ReturnType<typeof api.article.publish.useMutation>["mutate"];
  unpublish: ReturnType<typeof api.article.unpublish.useMutation>["mutate"];
  delete: ReturnType<typeof api.article.delete.useMutation>["mutate"];
}

export const SaveContext = createContext<SaveOptions | undefined>(undefined);

interface EditableProviderProps {
  children: React.ReactNode;
}

export const EditableProvider: React.FC<EditableProviderProps> = ({
  children,
}) => {
  const router = useRouter();

  const article_save_draft = api.article.save_draft.useMutation();

  const article_publish = api.article.publish.useMutation({
    onSuccess: (data) => {
      const returned_data = data?.at(0);
      if (!returned_data) return;

      router.push(`/uredi/${returned_data.url}-${returned_data.id}`);
    },
  });

  const article_unpublish = api.article.unpublish.useMutation();

  const article_delete = api.article.delete.useMutation({
    onSuccess: () => {
      router.replace(`/`);
    },
  });

  return (
    <SaveContext.Provider
      value={{
        save_draft: article_save_draft.mutate,
        publish: article_publish.mutate,
        unpublish: article_unpublish.mutate,
        delete: article_delete.mutate,
      }}
    >
      {children}
    </SaveContext.Provider>
  );
};
