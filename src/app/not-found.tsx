import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-8">
        <div className="text-6xl font-light tracking-tight text-foreground">
          W
        </div>
        <div className="mx-auto mt-1 h-px w-8 bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      <h1 className="text-xl font-light tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
