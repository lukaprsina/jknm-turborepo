import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import type { Article } from "@acme/db/schema";
import { auth } from "@acme/auth";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@acme/ui/navigation-menu";
import { ThemeToggle } from "@acme/ui/theme";

import logo from "~/../assets/logo.png";
import { sign_out } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { NoviceAutocomplete } from "./autocomplete";
import { ShowDraftsCheckbox } from "./drafts-provider";
import EditingButtons from "./editing-buttons";
import { NavigationMenuTrigger } from "./navigation-menu-trigger";

interface ShellProps {
  children: React.ReactNode;
  article?: typeof Article.$inferSelect;
}

export function Shell({ children, article }: ShellProps) {
  return (
    <HydrateClient>
      <div className="w-full">
        <header className="sticky top-0 z-50 bg-primary/80 px-6 py-4 text-primary-foreground backdrop-blur-sm md:px-12 md:py-6">
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
      <DesktopHeader className="hidden xl:flex" article={article} />
      <TabletHeader className="hidden md:flex xl:hidden" article={article} />
      <MobileHeader className="md:hidden" />
    </>
  );
}

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
      <Logo />
      <div className="flex gap-6">
        <LinksMenu />
        <div className="flex gap-1">
          <EditingButtons article={article} session={session ?? undefined} />
          {/* <Button
            className="dark:bg-primary/80 dark:text-primary-foreground"
            variant="ghost"
            size="icon"
          >
            <SearchIcon size={18} />
          </Button> */}
          <ThemeToggle className="dark:bg-primary/80 dark:text-primary-foreground" />
          <ShowDraftsCheckbox />
          <NoviceAutocomplete />
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
      <Logo />
      <div className="container flex flex-col gap-2">
        <div className="flex justify-end">
          <LinksMenu />
        </div>
        <div className="flex justify-end gap-1">
          <EditingButtons article={article} session={session ?? undefined} />
          {/* <Button
              className="dark:bg-primary/80 dark:text-primary-foreground"
              variant="ghost"
              size="icon"
            >
              <SearchIcon size={18} />
            </Button> */}
          <ThemeToggle className="dark:bg-primary/80 dark:text-primary-foreground" />
          <ShowDraftsCheckbox />
          <NoviceAutocomplete />
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
      <Logo />
      <Button>
        <MenuIcon />
      </Button>
    </div>
  );
}

function LinksMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <DesktopHeaderLink href="/novice">Novice</DesktopHeaderLink>
        <DesktopHeaderLink href="/zgodovina">Zgodovina</DesktopHeaderLink>
        <DesktopHeaderLink href="/raziskovanje">Raziskovanje</DesktopHeaderLink>
        <DesktopHeaderLink href="/publiciranje">Publiciranje</DesktopHeaderLink>
        <DesktopHeaderLink href="/varstvo">Varstvo</DesktopHeaderLink>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent text-primary-foreground focus:bg-transparent focus:text-primary-foreground dark:bg-primary/80">
            Klub
          </NavigationMenuTrigger>
          <NavigationMenuContent className="relative">
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem title="Kataster jam" href=""></ListItem>
              <ListItem title="Izobraževanje" href=""></ListItem>
              <ListItem title="Etični kodeks" href=""></ListItem>
              <ListItem title="Društvo v javnem interesu" href=""></ListItem>
              <ListItem title="Jamarska reševalna služba" href=""></ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex w-full items-center gap-2 text-2xl font-bold"
    >
      <Image
        src={logo}
        alt="logo"
        sizes="100vw" // TODO: Modify the sizes prop here
        placeholder="empty"
        className="w-24" // object-contain
      />
      <div>
        <p>Jamarski klub</p>
        <p>Novo mesto</p>
      </div>
    </Link>
  );
}

function DesktopHeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink
          className={cn(
            navigationMenuTriggerStyle(),
            "bg-transparent dark:bg-primary/80 dark:text-primary-foreground",
          )}
        >
          {children}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

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
