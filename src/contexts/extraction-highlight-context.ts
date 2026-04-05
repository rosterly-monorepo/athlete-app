"use client";

import { createContext, useContext } from "react";

const EMPTY_SET = new Set<string>();

const ExtractionHighlightContext = createContext<Set<string>>(EMPTY_SET);

export const ExtractionHighlightProvider = ExtractionHighlightContext.Provider;

export function useExtractionHighlight() {
  return useContext(ExtractionHighlightContext);
}
