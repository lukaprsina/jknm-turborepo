/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Gee0Ry6aieD
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";

export default function Component() {
  return (
    <div className="w-full">
      <header className="bg-primary px-6 py-4 text-primary-foreground md:px-12 md:py-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="#" className="text-2xl font-bold" prefetch={false}>
            News Website
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#"
              className="hover:text-primary-foreground/80"
              prefetch={false}
            >
              Home
            </Link>
            <Link
              href="#"
              className="hover:text-primary-foreground/80"
              prefetch={false}
            >
              News
            </Link>
            <Link
              href="#"
              className="hover:text-primary-foreground/80"
              prefetch={false}
            >
              Features
            </Link>
            <Link
              href="#"
              className="hover:text-primary-foreground/80"
              prefetch={false}
            >
              About
            </Link>
            <Link
              href="#"
              className="hover:text-primary-foreground/80"
              prefetch={false}
            >
              Contact
            </Link>
          </nav>
          <button className="md:hidden">
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </header>
      <main className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
        <div className="col-span-1 overflow-hidden rounded-lg bg-card shadow-lg md:col-span-2 lg:col-span-3">
          <Link href="#" className="grid gap-0 md:grid-cols-2" prefetch={false}>
            <img
              src="/placeholder.svg"
              alt="Featured Article"
              width={800}
              height={450}
              className="aspect-[16/9] object-cover"
            />
            <div className="p-6 md:p-8 lg:p-12">
              <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                Featured Article Title
              </h2>
              <p className="mb-6 text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl,
                eget aliquam nisl nisl sit amet nisl.
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-2 font-medium hover:text-primary"
                prefetch={false}
              >
                Read More
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg bg-card shadow-lg">
          <Link href="#" prefetch={false}>
            <img
              src="/placeholder.svg"
              alt="Article 1"
              width={400}
              height={225}
              className="aspect-video object-cover"
            />
            <div className="p-4 md:p-6">
              <h3 className="mb-2 text-lg font-semibold md:text-xl">
                Article 1 Title
              </h3>
              <p className="line-clamp-3 text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl,
                eget aliquam nisl nisl sit amet nisl.
              </p>
            </div>
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg bg-card shadow-lg">
          <Link href="#" prefetch={false}>
            <img
              src="/placeholder.svg"
              alt="Article 2"
              width={400}
              height={225}
              className="aspect-video object-cover"
            />
            <div className="p-4 md:p-6">
              <h3 className="mb-2 text-lg font-semibold md:text-xl">
                Article 2 Title
              </h3>
              <p className="line-clamp-3 text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl,
                eget aliquam nisl nisl sit amet nisl.
              </p>
            </div>
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg bg-card shadow-lg">
          <Link href="#" prefetch={false}>
            <img
              src="/placeholder.svg"
              alt="Article 3"
              width={400}
              height={225}
              className="aspect-video object-cover"
            />
            <div className="p-4 md:p-6">
              <h3 className="mb-2 text-lg font-semibold md:text-xl">
                Article 3 Title
              </h3>
              <p className="line-clamp-3 text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                euismod, nisl nec ultricies lacinia, nisl nisl aliquam nisl,
                eget aliquam nisl nisl sit amet nisl.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

function ArrowRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
