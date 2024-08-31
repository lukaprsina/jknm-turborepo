"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@acme/ui";
import { CardDescription } from "@acme/ui/card";

import type { GoogleAdminUser } from "~/app/api/get_users/route";
import { revalidate_next_tag } from "~/server/revalidate-next-tag";

// if author_ids is undefined, return none
export function useAuthors(author_ids?: string[]) {
  const [users, setUsers] = useState<GoogleAdminUser[] | undefined>(undefined);

  useEffect(() => {
    // if (typeof author_ids === "undefined") return;

    const fetchUsers = async () => {
      const users_response = await fetch("/api/get_users", {
        cache: "force-cache",
        next: {
          tags: ["get_users"],
          // expires: 2592000, // 30 days in seconds
        },
      });

      if (!users_response.ok) {
        console.error("Failed to fetch users", users_response);
        void revalidate_next_tag("get_users");
        return;
      }

      const fetched_users = (await users_response.json()) as
        | GoogleAdminUser[]
        | undefined;

      if (fetched_users?.length === 0) {
        console.warn("Revalidating users");
        void revalidate_next_tag("get_users");
      }

      setUsers(fetched_users);
    };

    void fetchUsers();
  }, [author_ids]);

  // if (!users) return [];

  return typeof author_ids === "undefined"
    ? users
    : users?.filter((user) => {
        if (!user.id) return false;

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
          className={cn(
            "flex flex-nowrap items-center justify-start overflow-x-scroll",
            className,
          )}
          {...props}
        >
          <div className="flex items-center">
            {authors.map((author, index) => (
              <span className="flex-shrink-0 text-foreground" key={index}>
                {author.name}
                {index !== authors.length - 1 && ",\u00A0"}
              </span>
            ))}
          </div>
        </CardDescription>
      ) : undefined}
    </>
  );
}
