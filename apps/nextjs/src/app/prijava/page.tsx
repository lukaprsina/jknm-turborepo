import { Skeleton } from "@acme/ui/skeleton";

import { HydrateClient } from "~/trpc/server";
import SignIn from "./signin";

import "./google.css";

import { Shell } from "../../components/shell";

// import ResponsiveShell from "../../components/responsive_shell";
{
  /* <ResponsiveShell user={data?.user}>
</ResponsiveShell> */
}

export default function Prijava() {
  return (
    <Shell>
      <div className="h-screen w-full min-w-full">
        <SignIn />
      </div>
    </Shell>
  );
}
