import React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { auth } from "@acme/auth";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@acme/ui/navigation-menu";
import { ThemeToggle } from "@acme/ui/theme";

import { HydrateClient } from "~/trpc/server";

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
        <main className="relative w-full">
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
    <div className="container mx-auto flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold">
        Jamarski klub Novo mesto
      </Link>
      <DesktopHeader />
      <Button className="md:hidden">
        <Menu />
      </Button>
    </div>
  );
}

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Kataster jam",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Izobraževanje",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Etični kodeks",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Društvo v javnem interesu",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Jamarska reševalna služba",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
];

async function DesktopHeader() {
  return (
    <div className="flex gap-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/zgodovina" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Zgodovina
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/raziskovanje" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Raziskovanje
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/publiciranje" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Publiciranje
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/varstvo" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Varstvo jam
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Klub</NavigationMenuTrigger>
            <NavigationMenuContent className="relative">
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/novice" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Novice
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <ThemeToggle />
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
      ) : null}
    </div>
  );
}
