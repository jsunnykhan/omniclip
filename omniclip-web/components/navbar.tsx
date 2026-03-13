"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Copy size={16} className="text-white" />
          </span>
          OmniClip
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#roadmap" className="hover:text-white transition-colors">Roadmap</Link>
          <Link href="/download" className="hover:text-white transition-colors">Download</Link>
        </nav>
        <Link href="/download" className={cn(buttonVariants({ variant: "default" }), "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30 rounded-full px-5")}>
          Download Free
        </Link>
      </div>
    </header>
  );
}
