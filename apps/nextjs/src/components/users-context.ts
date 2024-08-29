"use client";

import { createContext } from "react";

import type { GoogleAdminUser } from "~/app/api/get_users/google-admin";

type UsersContextValue = GoogleAdminUser[] | undefined;

const UsersContext = createContext<UsersContextValue>(undefined);

export default UsersContext;
