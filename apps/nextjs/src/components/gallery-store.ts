"use client";

import { createStore } from "zustand-x";
import { createJSONStorage } from "zustand/middleware";

import type { EditorJSImageData } from "./plugins";

interface GalleryStoreType {
  images: EditorJSImageData[];
  default_image: EditorJSImageData | undefined;
}

export const gallery_store = createStore("gallery")<GalleryStoreType>(
  {
    images: [],
    default_image: undefined,
  },
  {
    // middlewares: [persist, immer, devtools],
    persist: {
      enabled: true,
      name: "gallery-local",
      storage: createJSONStorage(() => sessionStorage),
    },
  },
);
