"use client";

import React, { createContext, useState } from "react";

type EditableContextProps = {
  editable: boolean;
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditableContext = createContext<EditableContextProps>({
  editable: false,
  setIsEditable: () => {},
});

export function EditableProvider({ children }: { children: React.ReactNode }) {
  const [editable, setIsEditable] = useState(false);

  return (
    <EditableContext.Provider value={{ editable, setIsEditable }}>
      {children}
    </EditableContext.Provider>
  );
}
