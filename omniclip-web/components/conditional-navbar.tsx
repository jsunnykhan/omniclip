"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

// Pages that have their own layout (no public navbar needed)
const HIDDEN_ON = ["/admin", "/login"];

export function ConditionalNavbar() {
  const pathname = usePathname();
  const hidden = HIDDEN_ON.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;
  return <Navbar />;
}
