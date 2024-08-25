import { create } from "zustand";

import type { EditorJSImageData } from "~/components/plugins";

export interface GalleryStoreType {
  images: EditorJSImageData[];
  default_image: EditorJSImageData | undefined;
  clear_default_image: () => void;
  set_default_image: (image: EditorJSImageData) => void;
  set_images: (images: EditorJSImageData[]) => void;
}

export const useGalleryStore = create<GalleryStoreType>()((set) => ({
  images: [],
  default_image: undefined,
  clear_default_image: () => set({ default_image: undefined }),
  set_default_image: (image) => set({ default_image: image }),
  set_images: (images) => set({ images }),
}));
