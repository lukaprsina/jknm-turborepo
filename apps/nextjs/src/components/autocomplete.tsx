"use client";

import type {
  AutocompleteComponents,
  AutocompleteSource,
} from "@algolia/autocomplete-js";
import type { Root } from "react-dom/client";
import React, { createElement, Fragment, useEffect, useRef } from "react";
import { autocomplete, getAlgoliaResults } from "@algolia/autocomplete-js";
import { createRoot } from "react-dom/client";

import { algolia } from "~/lib/algolia";

import "@algolia/autocomplete-theme-classic";

import Link from "next/link";

import "./autocomplete.css";

import type { ArticleHit } from "@acme/validators";

export function NoviceAutocomplete({ detached }: { detached?: string }) {
  const searchClient = algolia.getClient();

  return (
    <Autocomplete
      detached={detached}
      openOnFocus
      getSources={({ query }) => [
        {
          sourceId: "novice",
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: "novice",
                  query,
                  params: {
                    hitsPerPage: 8,
                  },
                },
              ],
            });
          },
          templates: {
            header() {
              return (
                <>
                  <span className="aa-SourceHeaderTitle">Novice</span>
                  <div className="aa-SourceHeaderLine" />
                </>
              );
            },
            item({ item, components }) {
              return <ProductItem hit={item} components={components} />;
            },
            noResults() {
              return "Ni ujemajočih novic.";
            },
          },
        },
      ]}
    />
  );
}

interface AutocompleteProps {
  detached?: string;
  openOnFocus: boolean;
  getSources: (props: { query: string }) => AutocompleteSource<ArticleHit>[];
}

// https://www.algolia.com/doc/ui-libraries/autocomplete/integrations/using-react/
export function Autocomplete({ detached, ...props }: AutocompleteProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLElement>();
  const panelRootRef = useRef<Root>();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const search_api = autocomplete({
      container: containerRef.current,
      detachedMediaQuery: detached ?? "(max-width: 1024px)",
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      renderer: { createElement, Fragment, render: () => {} },
      render({ children }, root) {
        if (!panelRootRef.current || rootRef.current !== root) {
          rootRef.current = root;

          panelRootRef.current?.unmount();
          panelRootRef.current = createRoot(root);
        }

        panelRootRef.current.render(children);
      },
      ...props,
    });

    return () => {
      search_api.destroy();
    };
  }, [detached, props]);

  return <div className="box-border flex-grow border-0" ref={containerRef} />;
}

interface ProductItemProps {
  hit: ArticleHit;
  components: AutocompleteComponents;
}

function ProductItem({ hit, components }: ProductItemProps) {
  return (
    <Link
      href={`/novica/${hit.url}-${hit.objectID}`}
      className="aa-ItemLink text-inherit"
    >
      <div className="aa-ItemContent h-12 overflow-hidden">
        {/* {hit.image && (
          <div className="aa-ItemIcon aa-ItemIcon--noBorder">
            <img src={hit.image}/>
          </div>
        )} */}
        <div className="aa-ItemContentBody">
          <div className="aa-ItemContentTitle">
            <components.Highlight hit={hit} attribute="title" />
          </div>
          <div className="aa-ItemContentDescription">
            {/* <components.Snippet hit={hit} attribute="content" /> */}
          </div>
        </div>
      </div>
    </Link>
  );
}
