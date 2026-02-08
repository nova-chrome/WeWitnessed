"use client";

import { Nunito_Sans } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";
import "./globals.css";

const nunitoSans = Nunito_Sans({ variable: "--font-sans" });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={nunitoSans.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 text-center">
            <div className="mb-8">
              <div className="text-6xl font-light tracking-tight text-foreground">
                W
              </div>
              <div className="mx-auto mt-1 h-px w-8 bg-linear-to-r from-transparent via-border to-transparent" />
            </div>

            <h1 className="text-xl font-light tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              An unexpected error occurred. Please try again or return to the
              home page.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={reset}
                className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Try again
              </button>
              <a
                href="/"
                className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Go home
              </a>
            </div>

            {error.digest && (
              <p className="mt-6 font-mono text-xs text-muted-foreground/50">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
