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

import type { SaveCallbackType } from "./editor";
import { SettingsForm } from "./settings-form";

export function SettingsDialog({
  article,
  save_callback,
}: {
  article: typeof Article.$inferInsert;
  save_callback: SaveCallbackType;
}) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              onClick={() => save_callback({ update: false })}
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
        <SettingsForm article={article} save_callback={save_callback} />
      </DialogContent>
    </Dialog>
  );
}
