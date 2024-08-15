import React from "react";
import Link from "next/link";

import type { Article } from "@acme/db/schema";
import { auth } from "@acme/auth";
import { Button } from "@acme/ui/button";

import { Background } from "~/components/backgrounds";
import { sign_out } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { TestHeader } from "./header";

interface ShellProps {
  children: React.ReactNode;
  article?: typeof Article.$inferSelect;
}

export function Shell({ children, article }: ShellProps) {
  return (
    <HydrateClient>
      <Background />
      <div className="w-full">
        {/* py-4 md:py-6 backdrop-blur-sm*/}
        <header /* className="z-50" */>
          <Header article={article} />
        </header>
        <main className="relative w-full">{children}</main>
        <footer className="bottom-0">
          <Footer />
        </footer>
      </div>
    </HydrateClient>
  );
}

async function Header({
  article: article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  const session = await auth();

  return (
    <>
      <TestHeader
        article={article}
        session={session ?? undefined}
        className=""
      />
      {/* <DesktopHeader className="hidden xl:flex" article={article} /> */}
      {/* <TabletHeader className="hidden md:flex xl:hidden" article={article} />
      <MobileHeader className="md:hidden" /> */}
    </>
  );
}

/* async function DesktopHeader({
  article,
  className,
  ...props
}: React.ComponentProps<"div"> & { article?: typeof Article.$inferSelect }) {
  const session = await auth();

  return (
    <div
      className={cn("container flex items-center justify-between", className)}
      {...props}
    >
      <LogoAndTitle />
      <div className="flex gap-6">
        <LinksMenu />
        <div className="flex gap-1">
          <EditingButtons article={article} session={session ?? undefined} />
          <ThemeToggle className="dark:bg-primary/80 dark:text-primary-foreground" />
          <ShowDraftsSwitch />
          <NoviceAutocomplete detached="" />
        </div>
      </div>
    </div>
  );
}

async function TabletHeader({
  article,
  className,
  ...props
}: React.ComponentProps<"div"> & { article?: typeof Article.$inferSelect }) {
  const session = await auth();

  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      <LogoAndTitle />
      <div className="container flex flex-col gap-2">
        <div className="flex justify-end">
          <LinksMenu />
        </div>
        <div className="flex gap-4">
          <NoviceAutocomplete />
          <EditingButtons article={article} session={session ?? undefined} />
          <ThemeToggle className="dark:bg-primary/80 dark:text-primary-foreground" />
          <ShowDraftsSwitch />
        </div>
      </div>
    </div>
  );
}

function MobileHeader({
  className,
  ...props
}: React.ComponentProps<"div"> & { article?: typeof Article.$inferSelect }) {
  return (
    <div
      className={cn("container flex items-center justify-between", className)}
      {...props}
    >
      <LogoAndTitle />
      <Button>
        <MenuIcon />
      </Button>
    </div>
  );
} */

async function Footer() {
  const session = await auth();

  return (
    <div className="container mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
      <p>
        Footer Lorem, ipsum dolor sit amet consectetur adipisicing elit. Qui
        ducimus ipsa, distinctio quia, tempore sapiente esse aut omnis hic earum
        molestias illum consequatur et quo maiores labore ex magnam voluptatem?
      </p>
      {!session?.user ? (
        <Button asChild variant="link">
          <Link href="/prijava">Prijava</Link>
        </Button>
      ) : (
        <form>
          <Button formAction={sign_out}>Odjava</Button>
        </form>
      )}
    </div>
  );
}

/* function LogoAndTitle() {
  return (
    <Link href="/" className="flex items-center gap-6 text-2xl font-bold">
      <Logo className="w-24" />
      <p>Jamarski klub Novo mesto</p>
    </Link>
  );
} */
