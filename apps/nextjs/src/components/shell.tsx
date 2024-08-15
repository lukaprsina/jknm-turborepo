import React from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import type { Article } from "@acme/db/schema";
import { auth } from "@acme/auth";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { ThemeToggle } from "@acme/ui/theme";

import { Background } from "~/components/backgrounds";
import { sign_out } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { NoviceAutocomplete } from "./autocomplete";
import { ShowDraftsSwitch } from "./drafts-provider";
import EditingButtons from "./editing-buttons";
import { LinksMenu, TestHeader } from "./header";
import { Logo } from "./logo";

interface ShellProps {
  children: React.ReactNode;
  article?: typeof Article.$inferSelect;
}

export function Shell({ children, article }: ShellProps) {
  return (
    <HydrateClient>
      <Background />
      <div className="w-full">
        {/* py-4 md:py-6 */}
        <header className="z-50 backdrop-blur-sm">
          <Header article={article} />
        </header>
        <main className="relative w-full">{children}</main>
        <footer className="bottom-0 z-10">
          <Footer />
        </footer>
      </div>
    </HydrateClient>
  );
}

function Header({
  article: article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  return (
    <>
      <TestHeader article={article} className="" />
      {/* <DesktopHeader className="hidden xl:flex" article={article} /> */}
      {/* <TabletHeader className="hidden md:flex xl:hidden" article={article} />
      <MobileHeader className="md:hidden" /> */}
    </>
  );
}

/* 
<div className="relative flex h-full w-full items-center justify-between">
      <div className="flex-shrink-0">
        <span className="text-lg font-bold text-white">Website Name</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 transform">
        <img src="logo.png" alt="Logo" className="h-10" />
      </div>

      <div className="w-92 flex-shrink-0">
        <input
          type="text"
          placeholder="Search..."
          className="rounded border border-gray-300 p-2"
        />
      </div>
*/

async function DesktopHeader({
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
}

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

function LogoAndTitle() {
  return (
    <Link href="/" className="flex items-center gap-6 text-2xl font-bold">
      <Logo className="w-24" />
      <p>Jamarski klub Novo mesto</p>
    </Link>
  );
}
