"use client";

import { useEffect } from "react";

export function PreviewPrintTrigger({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const t = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(t);
  }, [enabled]);

  return null;
}
