import React from "react";
import { withRef, withVariants } from "@udecode/cn";
import { PlateElement } from "@udecode/plate-common";
import { cva } from "class-variance-authority";

const headingVariants = cva("", {
  variants: {
    isFirstBlock: {
      false: "",
      true: "mt-0",
    },
    variant: {
      h1: "font-heading mb-1 mt-[2em] text-4xl font-bold",
      h2: "font-heading mb-px mt-[1.4em] text-2xl font-semibold tracking-tight",
      h3: "font-heading mb-px mt-[1em] text-xl font-semibold tracking-tight",
      h4: "font-heading mt-[0.75em] text-lg font-semibold tracking-tight",
      h5: "mt-[0.75em] text-lg font-semibold tracking-tight",
      h6: "mt-[0.75em] text-base font-semibold tracking-tight",
    },
  },
});

const HeadingElementVariants = withVariants(PlateElement, headingVariants, [
  "isFirstBlock",
  "variant",
]);

export const HeadingElement = withRef<typeof HeadingElementVariants>(
  ({ children, variant = "h1", ...props }, ref) => {
    const { editor, element } = props;

    if (variant === null) throw new Error("Heading variant is null");

    const Element = variant;

    return (
      <HeadingElementVariants
        asChild
        isFirstBlock={element === editor.children[0]}
        ref={ref}
        variant={variant}
        {...props}
      >
        <Element>{children}</Element>
      </HeadingElementVariants>
    );
  },
);
