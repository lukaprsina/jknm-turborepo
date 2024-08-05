"use client";

import React, { useEffect } from "react";

import type { CarouselProps } from "@acme/ui/carousel";
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
  onImageUrlChange(value: string): void;
  imageUrl: string;
}

const ImageCarousel = React.forwardRef<
  ImageCarouselProps & React.RefAttributes<HTMLDivElement>,
  React.HTMLAttributes<HTMLDivElement> & ImageCarouselProps
>(({ onImageUrlChange, imageUrl, ...props }, ref) => {
  const image_data = settings_store.use.image_data();

  useEffect(() => {
    console.log(image_data);
    onImageUrlChange("testing");
  }, [image_data, onImageUrlChange]);

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
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="Nekaj" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious type="button" />
      <CarouselNext type="button" />
    </Carousel>
  );
});

export { ImageCarousel };
