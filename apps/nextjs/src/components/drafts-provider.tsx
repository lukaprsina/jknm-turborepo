"use client";

import React, { createContext, useState } from "react";

import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";

type ShowDraftsContextProps =
  | [
      showDrafts: boolean,
      setShowDrafts: React.Dispatch<React.SetStateAction<boolean>>,
    ]
  | undefined;

export const ShowDraftsContext = createContext<
  ShowDraftsContextProps | undefined
>(undefined);

export function ShowDraftsSwitch() {
  const drafts = React.useContext(ShowDraftsContext);

  if (!drafts) {
    return null;
  }

  const [showDrafts, setShowDrafts] = drafts;

  return (
    <div className="flex h-9 items-center space-x-2 rounded-md px-2">
      <Switch
        id="show-drafts-switch"
        checked={showDrafts}
        onCheckedChange={(checked) => setShowDrafts(checked)}
      />
      <Label htmlFor="show-drafts-switch">Osnutki</Label>
    </div>
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
