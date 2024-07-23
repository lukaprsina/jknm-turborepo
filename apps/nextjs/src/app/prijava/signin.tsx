import Image from "next/image";

import { auth, signIn } from "@acme/auth";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";

import logo from "./logo.png";

export default async function SignIn() {
  const session = await auth();

  if (!session) {
    return (
      <div className="relative hidden h-full min-h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="dark:border-r> relative hidden h-full flex-col justify-center bg-muted p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="z-10 flex items-center justify-center text-lg font-medium">
            <Image
              src={logo}
              alt="logo"
              sizes="100vw"
              placeholder="blur"
              className="w-1/2"
            />
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Prijava</h1>
              <p className="text-sm text-muted-foreground">
                Prijavi se lahko samo z Google računom info@jknm.si.
              </p>
            </div>
            <form className="w-full text-center">
              <Button
                className=""
                formAction={async () => {
                  "use server";
                  await signIn("google");
                }}
                variant="outline"
              >
                {/* TODO */}
                {/* <Icons.google className="mr-2 h-4 w-4" /> */}
                Google
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>Prijavljen</CardContent>
    </Card>
  );
}
