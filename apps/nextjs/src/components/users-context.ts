"use client";

import type { admin_directory_v1 } from "googleapis";
import { createContext } from "react";

interface UsersContextValue {
  users: admin_directory_v1.Schema$User[] | undefined;
}

const UsersContext = createContext<UsersContextValue>({ users: [] });

export default UsersContext;
