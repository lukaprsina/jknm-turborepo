"use client";

import { cn } from "@acme/ui";

export function Background() {
  return (
    <div className="absolute top-0 -z-10 h-full w-full">
      <DarkBackground className="hidden dark:fixed" />
      <LightBackground className="fixed dark:hidden" />
    </div>
  );
}

function LightBackground({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "absolute top-0 h-full w-full bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]",
        className,
      )}
    ></div>
  );
}

function DarkBackground({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "absolute top-0 h-full w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]",
        className,
      )}
    ></div>
  );
}
