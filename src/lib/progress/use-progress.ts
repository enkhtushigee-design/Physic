"use client";

import { useSyncExternalStore } from "react";
import { createLocalProgressStore, type ProgressState } from "./store";

export const progressStore = createLocalProgressStore();

/** Серверийн рендерт хоосон төлөв буцаана; hydration-ий дараа хөтчийн өгөгдлөөр шинэчлэгдэнэ. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(progressStore.subscribe, progressStore.getSnapshot, progressStore.getServerSnapshot);
}

const noopSubscribe = () => () => {};

/** Hydration дууссан эсэх (явцаас хамаарах текстийг анивчуулахгүйн тулд). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
