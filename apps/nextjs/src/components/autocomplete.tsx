"use client";

import type {
  AutocompleteApi,
  AutocompleteComponents,
  AutocompleteSource,
} from "@algolia/autocomplete-js";
import type { Root } from "react-dom/client";
import React, {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { autocomplete, getAlgoliaResults } from "@algolia/autocomplete-js";
import { createRoot } from "react-dom/client";

import { algoliaInstance } from "~/lib/algolia";

import "@algolia/autocomplete-theme-classic";

import Link from "next/link";

import "./autocomplete.css";

import type { ArticleContentType } from "@acme/db/schema";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type NoviceHit = {
  objectID: string;
  title: string;
  url: string;
  created_at: Date;
  content?: ArticleContentType;
  image?: string;
};

export function NoviceAutocomplete({ detached }: { detached?: string }) {
  const searchClient = algoliaInstance.getClient();

  return (
    <Autocomplete
      detached={detached}
      openOnFocus
      getSources={({ query }) => [
        {
          sourceId: "products",
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
  getSources: (props: { query: string }) => AutocompleteSource<NoviceHit>[];
}

let created_search = false;
// https://www.algolia.com/doc/ui-libraries/autocomplete/integrations/using-react/
export function Autocomplete(props: AutocompleteProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLElement>();
  const panelRootRef = useRef<Root>();
  const search_api = useRef<AutocompleteApi<NoviceHit> | null>(null);

  const create_search = useCallback(() => {
    if (search_api.current || !containerRef.current) {
      return;
    }

    console.log("creating search");
    const search = autocomplete({
      container: containerRef.current,
      detachedMediaQuery: props.detached ?? "(max-width: 1024px)",
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      renderer: { createElement, Fragment, render: () => {} },
      defaultActiveItemId: 0,
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

    return search;
  }, [props]);

  useEffect(() => {
    if (created_search || search_api.current || !containerRef.current) {
      return;
    }

    search_api.current = create_search() ?? null;
    created_search = true;

    return () => {
      search_api.current?.destroy();
    };
  }, [create_search]);

  return <div className="box-border flex-grow border-0" ref={containerRef} />;
}

interface ProductItemProps {
  hit: NoviceHit;
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
