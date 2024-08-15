"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { Session } from "@acme/auth";
import type { Article } from "@acme/db/schema";
import { cn } from "@acme/ui";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@acme/ui/navigation-menu";
import { ThemeToggle } from "@acme/ui/theme";

import { NoviceAutocomplete } from "./autocomplete";
import { ShowDraftsSwitch } from "./drafts-provider";
import EditingButtons from "./editing-buttons";
import { Logo } from "./logo";
import { NavigationMenuTrigger } from "./navigation-menu-trigger";

export function TestHeader({
  article,
  className,
  session,
  ...props
}: React.ComponentProps<"div"> & {
  article?: typeof Article.$inferSelect;
  session?: Session;
}) {
  const [sticky, setSticky] = useState(false);
  const sticky_navbar = useRef<HTMLDivElement | null>(null);
  const header_ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sticky_navbar.current || !header_ref.current) return;

      // TODO
      const new_sticky = window.scrollY > header_ref.current.clientHeight + 2;

      if (new_sticky !== sticky) {
        setSticky(new_sticky);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sticky]);

  return (
    <>
      <div
        ref={header_ref}
        className={cn(
          "container relative flex h-[182px] w-full items-end justify-between px-6 py-4 backdrop-blur-sm md:px-12",
          className,
        )}
        {...props}
      >
        <Link href="/" className="flex-shrink-0 gap-6 text-2xl font-bold">
          <p>Jamarski klub</p>
          <p>Novo mesto</p>
        </Link>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 transform">
          <Logo className="w-[150px]" />
        </Link>
        <div className="flex h-full flex-shrink-0 flex-col justify-between">
          <div className="flex justify-end">
            <ShowDraftsSwitch />
            <EditingButtons article={article} session={session} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <NoviceAutocomplete detached="" />
            <ThemeToggle className="dark:bg-primary/80 dark:text-primary-foreground" />
          </div>
        </div>
      </div>
      <div
        className="h-0.5 w-full bg-blue-800/40"
        style={{
          marginBottom: sticky ? sticky_navbar.current?.clientHeight : "",
        }}
      />
      <div
        ref={sticky_navbar}
        className={cn(
          "relative z-[111] flex w-full items-center justify-center px-6 py-4 backdrop-blur-sm md:px-12",
          sticky ? "fixed top-0 bg-white/60 transition-colors" : null,
        )}
      >
        <LinksMenu />
      </div>
    </>
  );
}

export function LinksMenu() {
  return (
    <NavigationMenu className="z-50">
      <NavigationMenuList>
        <DesktopHeaderLink href="/novice">Novice</DesktopHeaderLink>
        <DesktopHeaderLink href="/zgodovina">Zgodovina</DesktopHeaderLink>
        <DesktopHeaderLink href="/raziskovanje">Raziskovanje</DesktopHeaderLink>
        <DesktopHeaderLink href="/publiciranje">Publiciranje</DesktopHeaderLink>
        <DesktopHeaderLink href="/varstvo">Varstvo</DesktopHeaderLink>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent">
            Klub
          </NavigationMenuTrigger>
          <NavigationMenuContent className="relative z-50">
            <ul className="z-50 grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem
                className="z-50"
                title="Kataster jam"
                href=""
              ></ListItem>
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
