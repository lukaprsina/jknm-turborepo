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

/* [
  false,
  () => {
    // alert("You forgot to wrap your component in a provider");
  },
] */

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
}: {
  children: React.ReactNode;
}) {
  const [showDrafts, setShowDrafts] = useState(true);

  return (
    <ShowDraftsContext.Provider value={[showDrafts, setShowDrafts]}>
      {children}
    </ShowDraftsContext.Provider>
  );
}
