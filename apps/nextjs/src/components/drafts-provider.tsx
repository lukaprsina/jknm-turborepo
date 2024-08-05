"use client";

import React, { createContext, useState } from "react";

import { Badge } from "@acme/ui/badge";

interface ShowDraftsContextProps {
  showDrafts: boolean;
  setShowDrafts: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ShowDraftsContext = createContext<ShowDraftsContextProps>({
  showDrafts: false,
  setShowDrafts: () => {
    alert("You forgot to wrap your component in a provider");
  },
});

export function ShowDraftsCheckbox() {
  const { showDrafts, setShowDrafts } = React.useContext(ShowDraftsContext);

  /* return (
    <Badge className="flex items-center space-x-2">
      <Checkbox id="show_drafts" />
      <label
        htmlFor="show_drafts"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Osnutki
      </label>
    </Badge>
  ); */

  return (
    <Badge
      className="cursor-pointer"
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
  const [showDrafts, setShowDrafts] = useState(false);

  return (
    <ShowDraftsContext.Provider value={{ showDrafts, setShowDrafts }}>
      {children}
    </ShowDraftsContext.Provider>
  );
}
