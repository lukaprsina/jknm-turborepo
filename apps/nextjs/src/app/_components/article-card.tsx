import Image from "next/image";
import Link from "next/link";

import { AspectRatio } from "@acme/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

export async function ArticleCard() {
  return (
    <Link href="/article/1">
      <Card className="grid grid-cols-7 gap-4 transition-transform hover:scale-105">
        <div className="col-span-4 flex h-full items-center justify-center rounded-xl bg-muted">
          <AspectRatio ratio={16 / 9}>
            <Image
              src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
              alt="Photo by Drew Beamer"
              fill
              className="rounded-md object-cover"
            />
          </AspectRatio>
        </div>
        <div>
          <CardHeader>
            <CardTitle>Article Title</CardTitle>
          </CardHeader>
          <CardContent>Article Content</CardContent>
        </div>
      </Card>
    </Link>
  );
}
