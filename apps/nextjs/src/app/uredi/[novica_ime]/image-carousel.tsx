"use client";

import React, { useRef } from "react";
import { PlusIcon } from "@radix-ui/react-icons";

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
  const file_ref = useRef<HTMLInputElement>(null);
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
          <CarouselItem
            key={index}
            className="cursor-pointer md:basis-1/2 lg:basis-1/3"
          >
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
        <CarouselItem className="md:basis-1/2 lg:basis-1/3">
          <input
            ref={file_ref}
            onChange={async (event) => {
              if (!event.target.files?.[0]) return;

              const form_data = new FormData();
              form_data.append("image", event.target.files[0]);

              const response = await fetch("/api/upload_image_by_file", {
                method: "POST",
                body: form_data,
              });

              const image_json = (await response.json()) as {
                success: number;
                file: {
                  url: string;
                  width: number;
                  height: number;
                };
              };

              // TODO: ko se shrani, se image_data prepiše iz articla
              if (!image_json.success) return;
              settings_store.set.image_data([...image_data, image_json.file]);

              onImageUrlChange(image_json.file.url);
            }}
            id="fileid"
            type="file"
            hidden
          />
          <Card
            onClick={() => {
              file_ref.current?.click();
            }}
            className="cursor-pointer hover:bg-muted"
          >
            <CardContent className="flex aspect-square items-center justify-center p-2">
              <div className="flex items-baseline gap-2">
                <PlusIcon />
                <p>Naloži</p>
              </div>
            </CardContent>
          </Card>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious type="button" />
      <CarouselNext type="button" />
    </Carousel>
  );
});

export { ImageCarousel };
