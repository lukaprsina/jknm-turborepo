import { useEffect, useRef } from "react";

export const useOutsideClick = (
  callback: (event: MouseEvent | TouchEvent) => void,
) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        event.stopPropagation();
        // event.preventDefault();
        callback(event);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [callback]);

  return ref;
};
export const useOutsideClickMultipleRefs = (
  callback: (event: MouseEvent | TouchEvent) => void,
  refs: React.RefObject<HTMLElement | null>[],
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      let no_refs_contain_target = true;

      for (const ref of refs) {
        if (!ref.current) continue;

        if (ref.current.contains(event.target as Node)) {
          no_refs_contain_target = false;
          break;
        }
      }

      if (no_refs_contain_target) {
        event.stopPropagation();
        callback(event);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [callback, refs]);
};
