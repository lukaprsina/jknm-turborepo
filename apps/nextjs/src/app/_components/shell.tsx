import Link from "next/link";

import { auth } from "@acme/auth";
import { Button } from "@acme/ui/button";

import { HydrateClient } from "~/trpc/server";

type ShellProps = {
  children: React.ReactNode;
  editable?: boolean;
};

export async function Shell({ editable, children }: ShellProps) {
  return (
    <HydrateClient>
      <div className="relative h-full min-h-screen justify-between">
        <header className="top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Header />
        </header>
        <main className="relative h-full min-h-screen w-full">
          {/* <main className="container h-screen py-16"> */}
          {children}
        </main>
        <footer className="bottom-0 z-10">
          <Footer />
        </footer>
      </div>
    </HydrateClient>
  );
}

async function Header() {
  return (
    <div className="container flex h-14 max-w-screen-2xl items-center">
      Header
    </div>
  );
}

async function Footer() {
  const session = await auth();

  return (
    <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
      <p>
        Footer Lorem, ipsum dolor sit amet consectetur adipisicing elit. Qui
        ducimus ipsa, distinctio quia, tempore sapiente esse aut omnis hic earum
        molestias illum consequatur et quo maiores labore ex magnam voluptatem?
      </p>
      <Button asChild variant="link">
        {!session?.user ? <Link href="/prijava">Prijava</Link> : null}
      </Button>
    </div>
  );
}
