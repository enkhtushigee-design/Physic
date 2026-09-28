import type { ReactNode } from "react";

export function Container({ children, className = "", size = "lg" }: { children: ReactNode; className?: string; size?: "md" | "lg" }) {
  return <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${size === "md" ? "max-w-4xl" : "max-w-6xl"} ${className}`}>{children}</div>;
}
