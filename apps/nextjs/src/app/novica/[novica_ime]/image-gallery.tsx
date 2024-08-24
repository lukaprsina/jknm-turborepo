"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

import type { CarouselApi } from "@acme/ui/carousel";
import { Button } from "@acme/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

import type { EditorJSImageData } from "~/components/plugins";
import { gallery_store } from "~/components/gallery-store";

export function GalleryStorePreview() {
  const gallery = gallery_store.useStore();

  return (
    <>
      <Button
        onClick={() => {
          gallery_store.set.default_image(undefined);
        }}
      >
        AAAAAA
      </Button>
      <pre>{JSON.stringify(gallery, null, 2)}</pre>
    </>
  );
}

export function ImageGallery() {
  const galleryImage = gallery_store.use.default_image();
  const aaaa = gallery_store.useStore();
  // const galleryImage = undefined;

  useEffect(() => {
    if (!galleryImage) return;

    const scroll_callback = (event: WheelEvent | TouchEvent) => {
      if (event instanceof WheelEvent && event.deltaY > 0) {
        gallery_store.set.default_image(undefined);
      } else if (event instanceof TouchEvent) {
        // Handle touch scroll logic here
        const touch = event.touches[0];
        if (typeof touch?.clientY !== "undefined" && touch.clientY > 0) {
          gallery_store.set.default_image(undefined);
        }
      }
    };

    window.addEventListener("wheel", scroll_callback);
    window.addEventListener("touchmove", scroll_callback);

    return () => {
      window.removeEventListener("wheel", scroll_callback);
      window.removeEventListener("touchmove", scroll_callback);
    };
  }, [galleryImage]);

  useEffect(() => {
    console.log("galleryImage useEffect", galleryImage, aaaa);
  }, [galleryImage, aaaa]);

  const portal = useCallback(() => {
    console.log("portal", galleryImage);
    return createPortal(
      <div
        className="fixed inset-0 z-50 h-screen w-screen bg-white/10 backdrop-blur-sm"
        onClick={() => {
          gallery_store.set.default_image(undefined);
        }}
      >
        <div className="h-full w-full">
          <div className="flex h-full w-full items-center justify-center">
            <CarouselDemo first_image={galleryImage?.file.url} />
          </div>
        </div>
      </div>,
      document.body,
    );
  }, [galleryImage]);

  return <>{galleryImage ? portal() : null}</>;
}

export function CarouselDemo({ first_image }: { first_image?: string }) {
  const image_data = gallery_store.use.images();
  const [api, setApi] = useState<CarouselApi>();
  // const router = useRouter();
  // const ref = useDetectClickOutside({ onTriggered: () => router.back() });

  useEffect(() => {
    if (!api) return;

    if (first_image) {
      const index = image_data.findIndex(
        (image) => image.file.url === first_image,
      );

      console.log("scrolling to", index, first_image);

      api.scrollTo(index);
    }
  }, [api, first_image, image_data]);

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
        {image_data.map((image, index) => (
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
    <figure>
      <Image
        src={image.file.url}
        alt={image.caption}
        width={image.file.width ?? 1500}
        height={image.file.height ?? 1000}
      />
      <figcaption>{image.caption}</figcaption>
    </figure>
  );
}
