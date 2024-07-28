import Image from "next/image";
import Link from "next/link";

import { AspectRatio } from "@acme/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

export function FeaturedArticleCard() {
  return (
    <Link
      href="#test"
      className="col-span-1 overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105 md:col-span-2 lg:col-span-3"
    >
      <Card>
        <AspectRatio ratio={16 / 9} className="rounded-md bg-red-500">
          <Image
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            alt="Photo by Drew Beamer"
            fill
            className="rounded-md object-cover"
          />
        </AspectRatio>
        <div className="p-4 md:p-6">
          <CardHeader>
            <CardTitle>Featured Article</CardTitle>
          </CardHeader>
          <CardContent>Article Content</CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function ArticleCard() {
  return (
    <Link
      href="/article/1"
      className="overflow-hidden rounded-lg bg-card shadow-lg transition-transform hover:scale-105"
    >
      <Card>
        <AspectRatio ratio={16 / 9} className="rounded-md bg-red-500">
          <Image
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            alt="Photo by Drew Beamer"
            fill
            className="rounded-md object-cover"
          />
        </AspectRatio>
        <div className="lg:p12 p-6 md:p-8">
          <CardHeader>
            <CardTitle>Article Title</CardTitle>
          </CardHeader>
          <CardContent>Article Content</CardContent>
        </div>
      </Card>
    </Link>
  );
}
