"use state";

import { useState } from "react";
import { Settings2Icon } from "lucide-react";

import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { SettingsForm } from "./settings-form";

export function SettingsDialog({
  article,
}: {
  article: typeof Article.$inferInsert;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              // TODO
              // onClick={() => save_callback({ update: false })}
              variant="ghost"
              size="icon"
            >
              <Settings2Icon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Nastvitve novičke</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nastvitve novičke</DialogTitle>
          <DialogDescription>
            Spremeni naslov, določi naslovno slike, objavi ali shrani kot
            osnutek.
          </DialogDescription>
        </DialogHeader>
        <SettingsForm
          closeDialog={() => setDialogOpen(false)}
          article={article}
        />
      </DialogContent>
    </Dialog>
  );
}
