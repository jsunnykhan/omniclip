"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Copy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-800/15 blur-[100px]" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
        <Badge className="mb-6 bg-violet-500/10 text-violet-400 border border-violet-500/30 hover:bg-violet-500/20 transition-colors px-4 py-1.5 text-sm rounded-full">
          <Zap size={12} className="mr-1.5" /> Now Available for Windows, macOS & Linux
        </Badge>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent leading-[1.1]">
          Your Clipboard,<br />
          <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Everywhere.
          </span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          OmniClip silently syncs your clipboard across all your devices in real-time.
          Copy on Mac. Paste on Windows. Stay in your flow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/download"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-violet-600 hover:bg-violet-500 text-white shadow-2xl shadow-violet-500/40 rounded-full px-8 h-14 text-base font-semibold transition-all hover:scale-105 hover:shadow-violet-500/60"
            )}
          >
            <Copy size={18} className="mr-2" />
            Download Now — It&apos;s Free
          </Link>
          <Link
            href="/#features"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/15 text-white/70 hover:text-white hover:bg-white/5 rounded-full px-8 h-14 text-base bg-transparent"
            )}
          >
            See How It Works <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {/* Device mockup */}
        <div className="mt-20 relative">
          <div className="relative mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-4 text-white/30 text-sm font-mono">omniclip — clipboard sync</span>
            </div>
            <div className="space-y-3">
              {[
                { os: "MacBook Pro (M4)", text: "npm install react-router-dom", time: "just now", active: true },
                { os: "Windows PC", text: "npm install react-router-dom", time: "synced instantly", active: false },
                { os: "Linux ThinkPad", text: "npm install react-router-dom", time: "synced instantly", active: false },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 ${item.active ? "bg-violet-500/10 border border-violet-500/20" : "bg-white/3 border border-white/5"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.active ? "bg-violet-400" : "bg-green-400"}`} />
                    <span className="text-white/40 text-xs">{item.os}</span>
                    <code className="text-white/80 text-sm font-mono">{item.text}</code>
                  </div>
                  <span className="text-white/30 text-xs">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-violet-500/20 blur-3xl rounded-full" />
        </div>
      </div>
    </section>
  );
}
