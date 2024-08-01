"use client";

import React, { createContext } from "react";

export type EditableOptions = "editable" | "readonly" | "not_an_article";

export const EditableContext = createContext<EditableOptions>("not_an_article");

type EditableProviderProps = {
  editable: EditableOptions;
  children: React.ReactNode;
};

export const EditableProvider: React.FC<EditableProviderProps> = ({
  editable,
  children,
}) => {
  return (
    <EditableContext.Provider value={editable}>
      {children}
    </EditableContext.Provider>
  );
};
