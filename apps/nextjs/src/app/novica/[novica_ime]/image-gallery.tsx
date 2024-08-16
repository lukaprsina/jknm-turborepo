"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";

import type { CarouselApi } from "@acme/ui/carousel";
import { Card, CardContent } from "@acme/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

import type { EditorJSImageData } from "~/components/plugins";
import { NextImageRenderer } from "~/components/editor-to-react";
import { gallery_store } from "~/components/gallery-store";

/* return (
    <>
      {createPortal(
        <div className="absolute left-0 top-0 z-50 h-screen w-screen bg-white/10 backdrop-blur-sm">
          <div className="h-full w-full">
            <CarouselDemo defaultValue={gallery_image} />
          </div>
        </div>,
        document.body,
      )}
    </>
  ); */

export function ImageGallery() {
  // const gallery_image = gallery_store.use.default_image();
  const search_params = useSearchParams();

  useEffect(() => {
    search_params.get("image");
    // Disable scrolling when gallery_image is truthy
  });

  return (
    <>
      {createPortal(
        <div className="absolute left-0 top-0 z-50 h-screen w-screen bg-white/10 backdrop-blur-sm">
          <div className="h-full w-full">
            <CarouselDemo defaultValue={gallery_image} />
          </div>
        </div>,
        document.body,
      )}
    </>
  );

  /* return (
    <Dialog
      open={!!gallery_image}
      onOpenChange={(open) => {
        if (!open) {
          gallery_store.set.default_image(undefined);
        }
      }}
    >
      <DialogContent className="backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle>Galerija</DialogTitle>
          <DialogDescription>Test</DialogDescription>
        </DialogHeader>
        <CarouselDemo defaultValue={gallery_image} />
      </DialogContent>
    </Dialog>
  ); */
}

export function CarouselDemo({
  defaultValue,
}: {
  defaultValue?: EditorJSImageData;
}) {
  const image_data = gallery_store.use.images();
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;

    if (defaultValue) {
      const index = image_data.findIndex(
        (image) => image.file.url === defaultValue.file.url,
      );

      api.scrollTo(index);
    }
  }, [api, defaultValue, image_data]);

  return (
    <Carousel
      setApi={setApi}
      className="mx-auto flex h-full w-full max-w-xs items-center"
    >
      <CarouselContent>
        {image_data.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <NextImageRenderer data={image} />
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
