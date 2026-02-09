import { Fragment, type PropsWithChildren } from "react";
import { ConvexProvider } from "./convex-provider";
import { PWARegister } from "./pwa-register";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: PropsWithChildren) {
  return (
    <Fragment>
      <ThemeProvider>
        <ConvexProvider>{children}</ConvexProvider>
        <Toaster />
      </ThemeProvider>
      <PWARegister />
    </Fragment>
  );
}
