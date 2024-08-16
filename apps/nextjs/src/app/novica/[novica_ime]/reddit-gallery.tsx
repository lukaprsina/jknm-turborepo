"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import type { CarouselApi } from "@acme/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@acme/ui/carousel";

import type { EditorJSImageData } from "~/components/plugins";

interface GalleryProps {
  images: EditorJSImageData[];
}

export const RedditGallery = ({ images }: GalleryProps) => {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbnailApi, setThumbnailApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const mainImage = useMemo(
    () =>
      images.map((image, index) => (
        <CarouselItem key={index} className="relative aspect-square w-full">
          <Image
            src={image.file.url}
            alt={`Carousel Main Image ${index + 1}`}
            fill
            style={{ objectFit: "cover" }}
          />
        </CarouselItem>
      )),
    [images],
  );

  const thumbnailImages = useMemo(() => {
    const handleClick = (index: number) => {
      if (!mainApi || !thumbnailApi) {
        return;
      }
      thumbnailApi.scrollTo(index);
      mainApi.scrollTo(index);
      setCurrent(index);
    };

    return images.map((image, index) => (
      <CarouselItem
        key={index}
        className="relative aspect-square w-full basis-1/4"
        onClick={() => handleClick(index)}
      >
        <Image
          className={`${index === current ? "border-2" : ""}`}
          src={image.file.url}
          fill
          alt={`Carousel Thumbnail Image ${index + 1}`}
          style={{ objectFit: "cover" }}
        />
      </CarouselItem>
    ));
  }, [images, mainApi, thumbnailApi, current]);

  useEffect(() => {
    if (!mainApi || !thumbnailApi) {
      return;
    }

    const handleTopSelect = () => {
      const selected = mainApi.selectedScrollSnap();
      setCurrent(selected);
      thumbnailApi.scrollTo(selected);
    };

    const handleBottomSelect = () => {
      const selected = thumbnailApi.selectedScrollSnap();
      setCurrent(selected);
      mainApi.scrollTo(selected);
    };

    mainApi.on("select", handleTopSelect);
    thumbnailApi.on("select", handleBottomSelect);

    return () => {
      mainApi.off("select", handleTopSelect);
      thumbnailApi.off("select", handleBottomSelect);
    };
  }, [mainApi, thumbnailApi]);

  return (
    <div className="w-96 max-w-xl sm:w-auto">
      <Carousel setApi={setMainApi}>
        <CarouselContent className="m-1">{mainImage}</CarouselContent>
      </Carousel>
      <Carousel setApi={setThumbnailApi}>
        <CarouselContent className="m-1">{thumbnailImages}</CarouselContent>
      </Carousel>
    </div>
  );
};
