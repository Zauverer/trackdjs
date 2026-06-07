"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

export function TrackedLink({
  event,
  properties,
  children,
  ...props
}: ComponentProps<typeof Link> & { event: AnalyticsEvent; properties?: Record<string, string | number | boolean> }) {
  return (
    <Link
      {...props}
      onClick={(clickEvent) => {
        trackEvent(event, properties);
        props.onClick?.(clickEvent);
      }}
    >
      {children}
    </Link>
  );
}
