"use client";

import {
  ConvexProvider as BaseConvexProvider,
  ConvexReactClient,
} from "convex/react";
import type { PropsWithChildren } from "react";
import { env } from "~/env";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexProvider({ children }: Readonly<PropsWithChildren>) {
  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
