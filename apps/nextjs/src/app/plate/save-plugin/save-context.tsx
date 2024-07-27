import React, { createContext, useContext, useState } from "react";

export type MyContextType = {
  saving: boolean;
  setSaving: (value: boolean) => void;
};

const SavingContext = createContext<MyContextType | null>(null);

export const useSaving = () => {
  return useContext(SavingContext);
};

export const SavingProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState<boolean>(false);

  return (
    <SavingContext.Provider value={{ saving: value, setSaving: setValue }}>
      {children}
    </SavingContext.Provider>
  );
};
