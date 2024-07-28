import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HamburgerMenuIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";

import { auth, signOut } from "@acme/auth";
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

import { HydrateClient } from "~/trpc/server";
import logo from "../../../assets/logo.png";
import { NavigationMenuTrigger } from "./navigation-menu-trigger";

type ShellProps = {
  children: React.ReactNode;
  editable?: boolean;
};

export async function Shell({ editable, children }: ShellProps) {
  return (
    <HydrateClient>
      <div className="w-full">
        <header className="sticky top-0 z-50 bg-primary/80 px-6 py-4 text-primary-foreground backdrop-blur-sm md:px-12 md:py-6">
          <Header />
        </header>
        <main className="relative w-full">{children}</main>
        <footer className="bottom-0 z-10">
          <Footer />
        </footer>
      </div>
    </HydrateClient>
  );
}

async function Header() {
  return (
    <div className="container flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
        <Image
          src={logo}
          alt="logo"
          sizes="(max-width: 640px) 100vw, 640px" // TODO: Modify the sizes prop here
          placeholder="empty"
          className="h-auto w-14 object-contain"
        />
        <p>Jamarski klub Novo mesto</p>
      </Link>
      <DesktopHeader />
      <Button className="md:hidden">
        <HamburgerMenuIcon />
      </Button>
    </div>
  );
}

async function DesktopHeaderLink({
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

async function DesktopHeader() {
  return (
    <div className="flex gap-6">
      <NavigationMenu>
        <NavigationMenuList>
          <DesktopHeaderLink href="/zgodovina">Zgodovina</DesktopHeaderLink>
          <DesktopHeaderLink href="/raziskovanje">
            Raziskovanje
          </DesktopHeaderLink>
          <DesktopHeaderLink href="/publiciranje">
            Publiciranje
          </DesktopHeaderLink>
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
          <DesktopHeaderLink href="/novice">Novice</DesktopHeaderLink>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex gap-1">
        <Button
          className="dark:bg-primary/80 dark:text-primary-foreground"
          variant="ghost"
          size="icon"
        >
          <MagnifyingGlassIcon />
        </Button>
        <ThemeToggle className="dark:bg-primary/80 dark:text-primary-foreground" />
      </div>
    </div>
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
    <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
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
          <Button
            variant="link"
            formAction={async () => {
              "use server";
              await signOut();
            }}
          >
            Odjava
          </Button>
        </form>
      )}
    </div>
  );
}
