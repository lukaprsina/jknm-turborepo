"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@acme/ui";
import { CardDescription } from "@acme/ui/card";

import type { GoogleAdminUser } from "~/app/api/get_users/google-admin";

export async function fetch_authors() {
  const users_response = await fetch("/api/get_users", {
    cache: "force-cache",
    next: {
      tags: ["get_users"],
    },
  });

  const fetched_users = (await users_response.json()) as
    | GoogleAdminUser[]
    | undefined;
  // if (!fetched_users) throw new Error("No users found");

  return fetched_users;
}

// if author_ids is undefined, return none
export function useAuthors(author_ids?: string[]) {
  const [users, setUsers] = useState<GoogleAdminUser[] | undefined>(undefined);

  useEffect(() => {
    if (typeof author_ids === "undefined") return;

    const fetchUsers = async () => {
      const test = await fetch_authors();
      setUsers(test);
    };

    void fetchUsers();
  }, [author_ids]);

  // if (!users) return [];

  return users?.filter((user) => {
    if (!author_ids || !user.id) return false;

    return author_ids.includes(user.id);
  });
}

export function Authors({
  author_ids,
  className,
  ...props
}: {
  author_ids?: string[];
} & React.HTMLAttributes<HTMLParagraphElement>) {
  const authors = useAuthors(author_ids);

  return (
    <>
      {authors && authors.length !== 0 ? (
        <CardDescription
          className={cn("flex items-center justify-start", className)}
          {...props}
        >
          {authors.map((author, index) => (
            <span className="flex items-center text-foreground" key={index}>
              {author.name}
              {index !== authors.length - 1 && ",\u00A0"}
            </span>
          ))}
        </CardDescription>
      ) : undefined}
    </>
  );
}
