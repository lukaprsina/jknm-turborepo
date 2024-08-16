"use client";

import { Card, CardContent } from "@acme/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@acme/ui/dialog";

import { image_store } from "~/components/image-store";

{
  /* {createPortal(
        <div className="absolute left-0 top-0 z-50 h-screen w-screen bg-white/10 backdrop-blur-sm">
          <div className="h-full w-full">
            <CarouselDemo />
          </div>
        </div>,
        document.body,
      )} */
}

export function ImageGallery() {
  const gallery_image = image_store.use.gallery_image();

  return (
    <Dialog
      open={!!gallery_image}
      onOpenChange={(open) => {
        if (!open) {
          image_store.set.gallery_image(undefined);
        }
      }}
    >
      <DialogTitle>Galerija</DialogTitle>
      <DialogContent className="backdrop-blur-sm">
        <CarouselDemo />
      </DialogContent>
    </Dialog>
  );
}

export function CarouselDemo() {
  return (
    <Carousel className="mx-auto flex h-full w-full max-w-xs items-center">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
