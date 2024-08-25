"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

import type { CarouselApi } from "@acme/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

import type { EditorJSImageData } from "~/components/plugins";
import { gallery_store } from "~/components/gallery-store";
import { useGalleryStore } from "./gallery-zustand";

export function ImageGallery() {
  const gallery = useGalleryStore();

  useEffect(() => {
    if (!gallery.default_image) return;

    const scroll_callback = (event: WheelEvent | TouchEvent) => {
      if (event instanceof WheelEvent) {
        gallery.clear_default_image();
      } else if (event instanceof TouchEvent) {
        // Handle touch scroll logic here
        const touch = event.touches[0];
        if (typeof touch?.clientY !== "undefined") {
          gallery.clear_default_image();
        }
      }
    };

    window.addEventListener("wheel", scroll_callback);
    window.addEventListener("touchmove", scroll_callback);

    return () => {
      window.removeEventListener("wheel", scroll_callback);
      window.removeEventListener("touchmove", scroll_callback);
    };
  }, [gallery]);

  useEffect(() => {
    console.log(
      "galleryImage useEffect",
      gallery.images,
      gallery.default_image,
    );
  }, [gallery.default_image, gallery.images]);

  const portal = useCallback(() => {
    console.log("portal", gallery.images);
    return createPortal(
      <div
        className="fixed inset-0 z-50 h-screen w-screen bg-white/10 backdrop-blur-sm"
        onClick={() => {
          gallery_store.set.default_image(undefined);
        }}
      >
        <div className="h-full w-full">
          <div className="flex h-full w-full items-center justify-center">
            <MyCarousel first_image={gallery.default_image?.file.url} />
          </div>
        </div>
      </div>,
      document.body,
    );
  }, [gallery.default_image?.file.url, gallery.images]);

  return <>{gallery.default_image ? portal() : null}</>;
}

export function MyCarousel({ first_image }: { first_image?: string }) {
  // const image_data = gallery_store.use.images();
  const gallery = useGalleryStore();
  const [api, setApi] = useState<CarouselApi>();
  // const router = useRouter();
  // const ref = useDetectClickOutside({ onTriggered: () => router.back() });

  useEffect(() => {
    if (!api) return;

    if (first_image) {
      const index = gallery.images.findIndex(
        (image) => image.file.url === first_image,
      );

      console.log("scrolling to", index, first_image);

      api.scrollTo(index);
    }
  }, [api, first_image, gallery.images]);

  return (
    <Carousel
      setApi={setApi}
      className="max-h-[90vh] max-w-[90vw]"
      // max-w-xs h-full w-full
      // fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
      // className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-md border-4 bg-white/90"
      // className="flex h-full w-full items-center justify-center"
    >
      <CarouselContent className="items-center" /* ref={ref} */>
        {gallery.images.map((image, index) => (
          <CarouselItem
            className="flex items-center justify-center"
            key={index}
          >
            {/* <div className="p-1"> */}
            {/* <Card> */}
            {/*  className="flex aspect-square items-center justify-center p-6" */}
            {/* <CardContent> */}
            <GalleryImage image={image} />
            {/* </CardContent> */}
            {/* </Card> */}
            {/* </div> */}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

function GalleryImage({ image }: { image: EditorJSImageData }) {
  return (
    <figure className="p-20">
      <Image
        className="max-h-[1500] max-w-[1500] rounded-xl shadow-2xl"
        src={image.file.url}
        alt={image.caption}
        width={image.file.width ?? 1500}
        height={image.file.height ?? 1000}
      />
      <figcaption className="mt-2 w-full rounded-xl border bg-background/90 p-4 shadow-2xl">
        {image.caption}
      </figcaption>
    </figure>
  );
}
