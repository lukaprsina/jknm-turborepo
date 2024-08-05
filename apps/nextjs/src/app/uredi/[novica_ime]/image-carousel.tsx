"use client";

import React from "react";

import { cn } from "@acme/ui";
import { Card, CardContent } from "@acme/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

import { settings_store } from "./settings-store";

interface ImageCarouselProps {
  onImageUrlChange: (value: string) => void;
  imageUrl?: string;
}

const ImageCarousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ImageCarouselProps
>(({ onImageUrlChange, imageUrl, ...props }, ref) => {
  const image_data = settings_store.use.image_data();

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-sm"
      {...props}
      ref={ref}
    >
      <CarouselContent>
        {image_data.map((image, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <Card
              className={cn(imageUrl === image.url ? "bg-slate-600" : null)}
              onClick={() => {
                onImageUrlChange(image.url);
              }}
            >
              <CardContent className="flex aspect-square items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} />
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious type="button" />
      <CarouselNext type="button" />
    </Carousel>
  );
});

export { ImageCarousel };
