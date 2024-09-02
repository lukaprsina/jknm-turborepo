"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useOnClickOutside } from "usehooks-ts";

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
import { useBreakpoint } from "~/hooks/use-breakpoint";
import { useGalleryStore } from "./gallery-zustand";

const GALLERY_CANCEL_KEYS: string[] = [
  "Escape",
  "Esc",
  "Enter",
  "Return",
  // "ArrowLeft",
  // "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  // "PageUp",
  // "PageDown",
  // "Home",
  // "End",
  "Tab",
  "Backspace",
  "Delete",
];

export function ImageGallery() {
  const gallery = useGalleryStore();

  useEffect(() => {
    if (!gallery.default_image) return;

    const scroll_callback = (event: WheelEvent | TouchEvent) => {
      if (event instanceof WheelEvent) {
        gallery.clear_default_image();
        // event.preventDefault();
      } else if (event instanceof TouchEvent) {
        const touch = event.touches[0];
        if (typeof touch?.clientY !== "undefined") {
          gallery.clear_default_image();
          // event.preventDefault();
        }
      }
    };

    const keypress_callback = (event: KeyboardEvent) => {
      if (GALLERY_CANCEL_KEYS.includes(event.key)) {
        gallery.clear_default_image();
      }
    };

    window.addEventListener("wheel", scroll_callback);
    window.addEventListener("touchmove", scroll_callback);
    window.addEventListener("keydown", keypress_callback);

    return () => {
      window.removeEventListener("wheel", scroll_callback);
      window.removeEventListener("touchmove", scroll_callback);
      window.removeEventListener("keydown", keypress_callback);
    };
  }, [gallery]);

  /* useEffect(() => {
    console.log(
      "galleryImage useEffect",
      gallery.images,
      gallery.default_image,
    );
  }, [gallery.default_image, gallery.images]); */

  const portal = useCallback(() => {
    // console.log("portal", gallery.images);

    return createPortal(
      <div
        className="fixed inset-0 z-50 h-screen w-screen bg-black/90 backdrop-blur-sm"
        onClick={() => {
          gallery_store.set.default_image(undefined);
        }}
      >
        <div className="h-full w-full">
          {/* "flex h-full w-full items-center justify-center" */}
          {/* p-16 */}
          <div className="flex h-full min-h-[350px] w-full items-center justify-around p-10">
            <MyCarousel first_image={gallery.default_image?.file.url} />
          </div>
        </div>
      </div>,
      document.body,
    );
  }, [gallery.default_image?.file.url]);

  return <>{gallery.default_image ? portal() : null}</>;
}

/* useOutsideClickMultipleRefs(() => {
    gallery.clear_default_image();
  }, [carousel_ref, previous_ref, next_ref]); */

export function MyCarousel({ first_image }: { first_image?: string }) {
  const gallery = useGalleryStore();
  const [api, setApi] = useState<CarouselApi>();
  const md_breakpoint = useBreakpoint("md", true);
  const carousel_ref = useRef<HTMLDivElement>(null);
  const previous_ref = useRef<HTMLButtonElement>(null);
  const next_ref = useRef<HTMLButtonElement>(null);

  const refs: RefObject<HTMLElement>[] = useMemo(
    () => [carousel_ref, previous_ref, next_ref] as RefObject<HTMLElement>[],
    [carousel_ref, previous_ref, next_ref],
  );

  useOnClickOutside(refs, () => {
    gallery.clear_default_image();
  });

  useEffect(() => {
    if (!api) return;

    if (first_image) {
      const index = gallery.images.findIndex(
        (image) => image.file.url === first_image,
      );

      // console.log("scrolling to", index, first_image);

      api.scrollTo(index);
    }
  }, [api, first_image, gallery.images]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "center",
        duration: 0,
      }}
      // max-h-[90vh] max-w-[90vw]  p-10
      className="flex h-full w-full max-w-[80%] items-center justify-center"
      // max-w-xs h-full w-full
      // fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
      // className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-md border-4 bg-white/90"
      // className="flex h-full w-full items-center justify-center"
    >
      <CarouselContent ref={carousel_ref}>
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
      {md_breakpoint && (
        <>
          <CarouselPrevious ref={previous_ref} />
          <CarouselNext ref={next_ref} />
        </>
      )}
    </Carousel>
  );
}

function GalleryImage({ image }: { image: EditorJSImageData }) {
  const { width, height } = useMemo(
    () => ({
      width: image.file.width ?? 1500,
      height: image.file.height ?? 1000,
    }),
    [image.file.width, image.file.height],
  );
  return (
    <figure>
      <div className="flex h-full w-full items-center justify-center">
        <Image
          /* max-h-[1500px] max-w-[1500px] */
          className="max-h-[90vh] rounded-xl object-scale-down"
          src={image.file.url}
          alt={image.caption}
          sizes="(max-width: 1500px) 100vw, 1500px"
          width={width}
          height={height}
          loader={({ src }) => src}
        />
      </div>
      {image.caption && (
        <figcaption
          className="mt-2 w-full rounded-xl text-white"
          style={{
            width: `${image.file.width}px`,
            // height: `${image.file.height}px`,
          }}
        >
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}
