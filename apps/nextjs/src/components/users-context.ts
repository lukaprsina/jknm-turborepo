"use client";

import { createContext } from "react";

import type { GoogleAdminUser } from "~/app/converter/google-admin";

type UsersContextValue = GoogleAdminUser[] | undefined;

const UsersContext = createContext<UsersContextValue>(undefined);

export default UsersContext;
