import { Skeleton } from "@acme/ui/skeleton";

import { HydrateClient } from "~/trpc/server";
import SignIn from "./signin";

// import ResponsiveShell from "../../components/responsive_shell";
{
  /* <ResponsiveShell user={data?.user}>
</ResponsiveShell> */
}

export default function Prijava() {
  return (
    <HydrateClient>
      <div className="prose dark:prose-invert lg:prose-xl h-screen w-full min-w-full">
        <SignIn />
      </div>
    </HydrateClient>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
