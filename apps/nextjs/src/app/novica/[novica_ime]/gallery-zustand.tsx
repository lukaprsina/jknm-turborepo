import { create } from "zustand";

import { EditorJSImageData } from "~/components/plugins";

interface GalleryStoreType {
  images: EditorJSImageData[];
  default_image: EditorJSImageData | undefined;
}

const useGalleryStore = create<GalleryStoreType>()((set) => ({
  images: [],
  default_image: undefined,
}));
