"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";
import type { PropsWithChildren } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexProvider({ children }: Readonly<PropsWithChildren>) {
  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
