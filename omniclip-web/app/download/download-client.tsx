"use client";

import React, { useEffect, useState } from "react";
import { downloadRelease } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Apple, Terminal, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type Platform = "windows" | "mac-arm" | "mac-intel" | "linux";

interface Release {
  version: string;
  publishedAt: string;
  assets: Array<{ name: string; browser_download_url: string; size: number }>;
}

function detectOS(): Platform {
  if (typeof window === "undefined") return "windows";
  const ua = navigator.userAgent;
  if (/Win/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) {
    // Heuristic: M-series Macs run Chrome/Safari with arm64 or report themselves
    // We check for Apple Silicon via canvas trick or just default to arm for modern Macs
    return "mac-arm";
  }
  if (/Linux/i.test(ua)) return "linux";
  return "windows";
}

const platforms: { id: Platform; label: string; sublabel?: string; Icon: React.ElementType }[] = [
  { id: "windows",   label: "Windows",            sublabel: "Windows 10/11 (x64)", Icon: Monitor },
  { id: "mac-arm",   label: "macOS — Apple Silicon", sublabel: "M1 / M2 / M3 / M4", Icon: Apple },
  { id: "mac-intel", label: "macOS — Intel",      sublabel: "x86_64", Icon: Apple },
  { id: "linux",     label: "Linux",              sublabel: "AppImage (x64)", Icon: Terminal },
];

export function DownloadClient({ release, error }: { release: Release | null; error: string | null }) {
  const [detected, setDetected] = useState<Platform>("windows");
  const [downloading, setDownloading] = useState<Platform | null>(null);

  useEffect(() => { setDetected(detectOS()); }, []);

  const handleDownload = async (platform: Platform) => {
    setDownloading(platform);
    const fd = new FormData();
    fd.append("platform", platform);
    try {
      const url = await downloadRelease(fd);
      if (url) {
        window.location.href = url;
      }
    } catch (e) {
      console.error("Download error:", e);
    }
    setTimeout(() => setDownloading(null), 3000);
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getAssetSize = (platform: Platform): string => {
    if (!release) return "";
    const patterns: Record<Platform, RegExp> = {
      windows: /\.exe$/i, "mac-arm": /aarch64\.dmg$/i,
      "mac-intel": /x64\.dmg$/i, linux: /\.AppImage$/i,
    };
    const asset = release.assets.find(a => patterns[platform].test(a.name));
    return asset ? formatSize(asset.size) : "";
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="absolute inset-x-0 top-16 flex justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-violet-600/15 blur-[100px] rounded-full" />
        </div>
        <Badge className="mb-4 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-full px-4 py-1.5">
          {release ? `Latest: ${release.version}` : "Download"}
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Download{" "}
          <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            OmniClip
          </span>
        </h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto">
          Free for personal use. No account required to install — just pay on first login.
        </p>
        {release && (
          <p className="mt-3 text-white/25 text-sm">
            Released {new Date(release.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Platform cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        {platforms.map(({ id, label, sublabel, Icon }) => {
          const isRecommended = id === detected;
          const isLoading = downloading === id;
          const size = getAssetSize(id);

          return (
            <Card
              key={id}
              className={`relative border rounded-2xl transition-all duration-300 cursor-pointer group
                ${isRecommended
                  ? "bg-violet-500/8 border-violet-500/40 shadow-lg shadow-violet-500/10 hover:border-violet-400/60"
                  : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/20"
                }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-violet-500 text-white text-xs rounded-full px-3 py-0.5 shadow-md shadow-violet-500/40">
                    <CheckCircle2 size={10} className="mr-1" /> Recommended for your device
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                    ${isRecommended ? "bg-violet-500/20" : "bg-white/6 group-hover:bg-white/10"}`}>
                    <Icon size={22} className={isRecommended ? "text-violet-400" : "text-white/50"} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-white">{label}</h2>
                    <p className="text-white/35 text-sm mt-0.5">{sublabel}</p>
                    {size && <p className="text-white/25 text-xs mt-1">{size}</p>}
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(id)}
                  disabled={isLoading || !release}
                  className={`w-full rounded-xl h-11 font-semibold transition-all
                    ${isRecommended
                      ? "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/30"
                      : "bg-white/8 hover:bg-white/15 text-white/80 hover:text-white border border-white/10"
                    }`}
                >
                  {isLoading
                    ? <><Loader2 size={16} className="mr-2 animate-spin" /> Fetching...</>
                    : <><Download size={16} className="mr-2" /> Download for {label.split(" — ")[0]}</>
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notes */}
      <div className="max-w-4xl mx-auto mt-12 space-y-3 text-sm text-white/30">
        <p className="text-center">🪟 Windows users: if you see a SmartScreen warning, click <strong className="text-white/60">More info</strong> → <strong className="text-white/60">Run anyway</strong>. (Code signing certificate coming soon!)</p>
        <p className="text-center">🍎 macOS users: if you see &quot;damaged app&quot; on first launch, run <code className="bg-white/8 px-2 py-0.5 rounded font-mono text-xs">xattr -cr /Applications/omniclip-client.app</code> in Terminal.</p>
        <p className="text-center">🐧 Linux: make the AppImage executable with <code className="bg-white/8 px-2 py-0.5 rounded font-mono text-xs">chmod +x OmniClip*.AppImage</code> before running.</p>
      </div>
    </main>
  );
}
