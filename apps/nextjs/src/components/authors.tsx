"use client";

import React, { useEffect, useState } from "react";

import type { Article } from "@acme/db/schema";

import type { GoogleAdminUser } from "~/app/api/get_users/route";

export function useAllAuthors() {
  const [users, setUsers] = useState<GoogleAdminUser[] | undefined>(undefined);

  useEffect(() => {
    const fetchUsers = async () => {
      const users_response = await fetch("/api/get_users", {
        cache: "force-cache",
        next: {
          tags: ["get_users"],
          // revalidate: 3600 * 24 * 7, // 1 week
        },
      });

      if (!users_response.ok) {
        console.error("Failed to fetch users", users_response);
        return;
      }

      const fetched_users = (await users_response.json()) as
        | GoogleAdminUser[]
        | undefined;

      if (fetched_users?.length === 0) {
        console.warn("Revalidating users");
      }

      console.log("Fetched users", fetched_users);
      setUsers(fetched_users);
    };

    void fetchUsers();
  }, []);

  return users;
}

export function useAuthors(author_names: string[]) {
  const all_authors = useAllAuthors();

  return typeof author_names === "undefined"
    ? all_authors
    : all_authors?.filter((user) => {
        if (!user.name) return false;

        return author_names.includes(user.name);
      });
}

export function Authors({ author_names }: { author_names: string[] }) {
  const authors = useAuthors(author_names);

  return (
    <>
      {authors?.map((author, index) => (
        // span className="flex-shrink-0"
        <React.Fragment key={index}>
          {author.name}
          {index !== authors.length - 1 && ",\u00A0"}
        </React.Fragment>
      ))}
    </>
  );
}

export function get_author_names(
  article: typeof Article.$inferSelect,
  all_authors: GoogleAdminUser[] | undefined,
) {
  if (!all_authors) return [];
  const combined_authors = [...(article.author_ids ?? [])];

  try {
    const selected_authors =
      article.author_ids?.map((author_id) => {
        const author = all_authors.find((author) => author.id === author_id);
        if (!author?.name)
          throw new Error(
            `Author with id ${author_id} not found: ${all_authors.length}`,
          );
        return author.name;
      }) ?? [];

    combined_authors.push(...selected_authors);
  } catch (error) {
    console.error("get_author_names error", error);
  }

  return combined_authors;
}
