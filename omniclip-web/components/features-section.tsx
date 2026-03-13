import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Image, FileBox, Wifi, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Copy,
    title: "Text Clipboard Sync",
    description: "Every text you copy is instantly encrypted and synced to all your paired devices in real-time over WebSocket.",
    badge: "Active",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
  {
    icon: Image,
    title: "Image Share",
    description: "Copy an image on one device and paste it on another. Full resolution, zero configuration, just works.",
    badge: "Coming Soon",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    glow: "group-hover:shadow-violet-500/10",
  },
  {
    icon: FileBox,
    title: "File Sync",
    description: "Transfer files between your devices without cables, AirDrop, or cloud storage. Select, copy, paste.",
    badge: "Coming Soon",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    glow: "group-hover:shadow-violet-500/10",
  },
  {
    icon: Wifi,
    title: "Real-Time WebSocket",
    description: "No polling. No delays. Changes propagate in milliseconds over a persistent, encrypted WebSocket connection.",
    badge: "Active",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
  {
    icon: Shield,
    title: "End-to-End Encrypted",
    description: "AES-256-GCM encryption before your data ever leaves the device. Your clipboard stays private.",
    badge: "Active",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Silent Background Sync",
    description: "Runs quietly in the system tray. Zero UI friction, zero battery drain. You won't even know it's there.",
    badge: "Active",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-white/5 text-white/50 border border-white/10 rounded-full px-4 py-1.5">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
              nothing you don&apos;t.
            </span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            OmniClip is built to get out of your way. Launch it once, forget about it, and just keep working.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className={`group bg-white/3 border border-white/8 rounded-2xl hover:bg-white/6 hover:border-white/15 transition-all duration-300 hover:shadow-xl ${f.glow}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                      <Icon size={20} className="text-white/60 group-hover:text-violet-400 transition-colors" />
                    </div>
                    <Badge className={`text-xs rounded-full border ${f.badgeColor}`}>{f.badge}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
