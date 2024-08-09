"use client";

import React, { createContext, useState } from "react";

import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";

type ShowDraftsContextProps =
  | [
      showDrafts: boolean,
      setShowDrafts: React.Dispatch<React.SetStateAction<boolean>>,
    ]
  | undefined;

export const ShowDraftsContext = createContext<
  ShowDraftsContextProps | undefined
>(undefined);

export function ShowDraftsCheckbox() {
  const drafts = React.useContext(ShowDraftsContext);

  if (!drafts) {
    return null;
  }

  const [showDrafts, setShowDrafts] = drafts;

  return (
    <Badge
      className={cn("cursor-pointer", !showDrafts ? "text-background" : "")}
      variant={showDrafts ? "secondary" : "outline"}
      onClick={() => setShowDrafts(!showDrafts)}
    >
      Osnutki
    </Badge>
  );
}

export function ShowDraftsProvider({
  children,
  show_button = true,
}: {
  children: React.ReactNode;
  show_button?: boolean;
}) {
  const [showDrafts, setShowDrafts] = useState(true);

  return (
    <ShowDraftsContext.Provider
      value={show_button ? [showDrafts, setShowDrafts] : undefined}
    >
      {children}
    </ShowDraftsContext.Provider>
  );
}
