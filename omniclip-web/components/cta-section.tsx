"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Copy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/20 blur-[100px] rounded-full" />
        </div>
        <div className="relative bg-white/3 border border-white/10 rounded-3xl p-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-500/30">
            <Copy size={28} className="text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Start syncing in{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
              60 seconds.
            </span>
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto">
            Download OmniClip, log in on each device, and your clipboard is instantly connected. No configuration. No setup wizard.
          </p>
          <Link
            href="/download"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-violet-600 hover:bg-violet-500 text-white rounded-full px-10 h-14 text-base font-semibold shadow-2xl shadow-violet-500/40 transition-all hover:scale-105"
            )}
          >
            Download Free <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
