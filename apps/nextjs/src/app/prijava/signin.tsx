import Image from "next/image";

import { auth, signIn, signOut } from "@acme/auth";
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
                Prijava je možna samo z Google računom info@jknm.si.
              </p>
            </div>
            <form className="w-full text-center">
              <GoogleSignInButton />
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <p>Prijavljen</p>
      <form className="w-full text-center">
        <Button
          type="submit"
          formAction={async () => {
            "use server";
            await signOut();
          }}
          variant="outline"
        >
          Odjavi se
        </Button>
      </form>
    </>
  );
}

async function GoogleSignInButton() {
  return (
    <button
      className="gsi-material-button"
      formAction={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            style={{ display: "block" }}
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            ></path>
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            ></path>
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            ></path>
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            ></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
        <span className="gsi-material-button-contents">
          Sign in with Google
        </span>
        <span style={{ display: "none" }}>Sign in with Google</span>
      </div>
    </button>
  );
}
