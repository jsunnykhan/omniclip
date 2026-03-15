"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Copy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="py-32 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/12 blur-[100px] rounded-full" />
        </div>
        <div className="relative bg-card border border-border rounded-3xl p-14 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/35">
            <Copy size={28} className="text-primary-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Start syncing in{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              60 seconds.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Download OmniClip, log in on each device, and your clipboard is instantly connected. No configuration. No setup wizard.
          </p>
          <Link
            href="/download"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 h-14 text-base font-semibold shadow-lg shadow-primary/35 transition-all hover:scale-[1.03]"
            )}
          >
            Download Free <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
