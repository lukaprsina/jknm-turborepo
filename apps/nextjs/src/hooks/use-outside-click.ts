"use client";

import { useEffect, useState } from "react";





export const useOutsideClickMultipleRefs = (
  callback: (event: MouseEvent | TouchEvent) => void,
  refs: React.RefObject<HTMLElement | null>[],
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      event.stopPropagation();
      console.log("handling click", event);
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      let should_callback = true;

      for (const ref of refs) {
        if (!ref.current) continue;

        if (ref.current.contains(event.target as Node)) {
          should_callback = false;
          break;
        }
      }

      console.log({ no_refs_contain_target: should_callback });
      if (should_callback) {
        document.addEventListener("pointerup", handleClick);
        event.stopPropagation();
        console.log("calling callback", event);
        callback(event);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("pointerup", handleClick);
    };
  }, [callback, refs]);
};