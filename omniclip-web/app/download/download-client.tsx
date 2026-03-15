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
  if (/Mac/i.test(ua)) return "mac-arm";
  if (/Linux/i.test(ua)) return "linux";
  return "windows";
}

const platforms: { id: Platform; label: string; sublabel?: string; Icon: React.ElementType }[] = [
  { id: "windows",   label: "Windows",               sublabel: "Windows 10/11 (x64)", Icon: Monitor },
  { id: "mac-arm",   label: "macOS — Apple Silicon", sublabel: "M1 / M2 / M3 / M4",  Icon: Apple   },
  { id: "mac-intel", label: "macOS — Intel",         sublabel: "x86_64",              Icon: Apple   },
  { id: "linux",     label: "Linux",                 sublabel: "AppImage (x64)",       Icon: Terminal },
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
      if (url) window.location.href = url;
    } catch (e) {
      console.error("Download error:", e);
    }
    setTimeout(() => setDownloading(null), 3000);
  };

  const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const getAssetSize = (platform: Platform): string => {
    if (!release) return "";
    const patterns: Record<Platform, RegExp> = {
      windows: /\.exe$/i,
      "mac-arm": /aarch64\.dmg$/i,
      "mac-intel": /x64\.dmg$/i,
      linux: /\.AppImage$/i,
    };
    const asset = release.assets.find(a => patterns[platform].test(a.name));
    return asset ? formatSize(asset.size) : "";
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16 relative">
        <div className="absolute inset-0 pointer-events-none flex justify-center">
          <div className="w-[500px] h-[280px] bg-primary/12 blur-[100px] rounded-full" />
        </div>

        <Badge className="mb-4 bg-primary/10 text-primary border border-primary/25 rounded-full px-4 py-1.5 font-medium">
          {release ? `Latest: ${release.version}` : "Download"}
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
          Download{" "}
          <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            OmniClip
          </span>
        </h1>

        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Free for personal use. No account required to install — just pay on first login.
        </p>

        {release && (
          <p className="mt-3 text-muted-foreground/60 text-sm">
            Released{" "}
            {new Date(release.publishedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/25 text-destructive rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} className="shrink-0" />
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
              className={`relative border rounded-2xl transition-all duration-200 group ${
                isRecommended
                  ? "bg-primary/5 border-primary/30 shadow-md shadow-primary/10 hover:border-primary/50 hover:shadow-primary/20"
                  : "bg-card border-border hover:border-border/80 hover:shadow-sm"
              }`}
            >
              {isRecommended && (
                <div className="absolute right-4 top-4">
                  <Badge className="bg-primary text-primary-foreground text-xs rounded-full px-3 py-1 shadow-sm shadow-primary/30 font-medium">
                    <CheckCircle2 size={10} className="mr-1" /> Recommended
                  </Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    isRecommended
                      ? "bg-primary/15 group-hover:bg-primary/20"
                      : "bg-muted group-hover:bg-muted/80"
                  }`}>
                    <Icon size={22} className={isRecommended ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-foreground">{label}</h2>
                    <p className="text-muted-foreground text-sm mt-0.5">{sublabel}</p>
                    {size && <p className="text-muted-foreground/60 text-xs mt-1">{size}</p>}
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(id)}
                  disabled={isLoading || !release}
                  className={`w-full rounded-xl h-11 font-semibold transition-all ${
                    isRecommended
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/30"
                      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border"
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

      {/* Platform notes */}
      <div className="max-w-4xl mx-auto mt-12 space-y-3 text-sm text-muted-foreground">
        <p className="text-center">
          🪟 Windows: if you see SmartScreen, click <strong className="text-foreground/80">More info</strong> → <strong className="text-foreground/80">Run anyway</strong>. (Code signing coming soon!)
        </p>
        <p className="text-center">
          🍎 macOS: if you see &quot;damaged app&quot;, run{" "}
          <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">xattr -cr /Applications/omniclip-client.app</code> in Terminal.
        </p>
        <p className="text-center">
          🐧 Linux: make the AppImage executable with{" "}
          <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">chmod +x OmniClip*.AppImage</code> before running.
        </p>
      </div>
    </main>
  );
}
