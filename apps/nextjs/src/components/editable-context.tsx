"use client";

import React, { createContext } from "react";

export const EditableContext = createContext<boolean>(false);

type EditableProviderProps = {
  editable: boolean;
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
