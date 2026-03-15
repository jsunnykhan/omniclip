"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Copy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial brand glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute top-2/3 left-1/4 w-[350px] h-[350px] rounded-full bg-primary/8 blur-[100px]" />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,oklch(0.6_0.22_280/8%)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-36 text-center">
        <Badge
          className="mb-6 bg-primary/10 text-primary border border-primary/25 hover:bg-primary/15 transition-colors px-4 py-1.5 text-sm rounded-full font-medium"
        >
          <Zap size={12} className="mr-1.5" />
          Now Available for Windows, macOS &amp; Linux
        </Badge>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-foreground leading-[1.08]">
          Your Clipboard,<br />
          <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            Everywhere.
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          OmniClip silently syncs your clipboard across all your devices in real-time.
          Copy on Mac. Paste on Windows. Stay in your flow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/download"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/35 rounded-full px-8 h-14 text-base font-semibold transition-all hover:scale-[1.03] hover:shadow-primary/50"
            )}
          >
            <Copy size={17} className="mr-2" />
            Download Now — It&apos;s Free
          </Link>
          <Link
            href="/#features"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full px-8 h-14 text-base font-medium"
            )}
          >
            See How It Works <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {/* Terminal mockup */}
        <div className="mt-20 relative">
          <div className="relative mx-auto max-w-3xl rounded-2xl border border-border bg-card shadow-xl shadow-black/10 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-muted-foreground text-sm font-mono">omniclip — clipboard sync</span>
            </div>
            <div className="p-5 space-y-2.5">
              {[
                { os: "MacBook Pro (M4)", text: "npm install react-router-dom", time: "just now", active: true },
                { os: "Windows PC", text: "npm install react-router-dom", time: "synced instantly", active: false },
                { os: "Linux ThinkPad", text: "npm install react-router-dom", time: "synced instantly", active: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    item.active
                      ? "bg-primary/8 border border-primary/20"
                      : "bg-muted/60 border border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.active ? "bg-primary" : "bg-emerald-500"}`} />
                    <span className="text-muted-foreground text-xs">{item.os}</span>
                    <code className="text-foreground text-sm font-mono">{item.text}</code>
                  </div>
                  <span className="text-muted-foreground text-xs shrink-0 ml-4">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Glow below card */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-primary/20 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  );
}
