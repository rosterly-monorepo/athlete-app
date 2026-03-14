"use client";

import type { ComponentType } from "react";
import type { AthleteSportView } from "@/services/types";
import { RowingProfile } from "./rowing-profile";

export interface SportProfileProps {
  sport: AthleteSportView;
}

const SPORT_RENDERERS: Record<string, ComponentType<SportProfileProps>> = {
  rowing: RowingProfile,
};

export function SportRenderer({ sport }: SportProfileProps) {
  const Renderer = SPORT_RENDERERS[sport.sport_code];
  if (!Renderer) return null;
  return <Renderer sport={sport} />;
}
