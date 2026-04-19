"use client";

import { createContext, useContext } from "react";
import type { DigestTickerDirection } from "@/components/ui/DigestTickerBadge";

export type TickerMap = Map<string, DigestTickerDirection>;

export const TickerContext = createContext<TickerMap>(new Map());

export function useTickerMap(): TickerMap {
  return useContext(TickerContext);
}
