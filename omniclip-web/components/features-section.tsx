import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Image, FileBox, Wifi, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Copy,
    title: "Text Clipboard Sync",
    description: "Every text you copy is instantly encrypted and synced to all your paired devices in real-time over WebSocket.",
    badge: "Active",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  },
  {
    icon: Image,
    title: "Image Share",
    description: "Copy an image on one device and paste it on another. Full resolution, zero configuration, just works.",
    badge: "Coming Soon",
    badgeClass: "bg-primary/10 text-primary border-primary/25",
    iconClass: "text-primary",
    iconBg: "bg-primary/10 group-hover:bg-primary/20",
  },
  {
    icon: FileBox,
    title: "File Sync",
    description: "Transfer files between your devices without cables, AirDrop, or cloud storage. Select, copy, paste.",
    badge: "Coming Soon",
    badgeClass: "bg-primary/10 text-primary border-primary/25",
    iconClass: "text-primary",
    iconBg: "bg-primary/10 group-hover:bg-primary/20",
  },
  {
    icon: Wifi,
    title: "Real-Time WebSocket",
    description: "No polling. No delays. Changes propagate in milliseconds over a persistent, encrypted WebSocket connection.",
    badge: "Active",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  },
  {
    icon: Shield,
    title: "End-to-End Encrypted",
    description: "AES-256-GCM encryption before your data ever leaves the device. Your clipboard stays private.",
    badge: "Active",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Silent Background Sync",
    description: "Runs quietly in the system tray. Zero UI friction, zero battery drain. You won't even know it's there.",
    badge: "Active",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 relative bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border border-primary/25 rounded-full px-4 py-1.5 font-medium">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Everything you need,{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              nothing you don&apos;t.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            OmniClip is built to get out of your way. Launch it once, forget about it, and just keep working.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="group bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${f.iconBg}`}>
                      <Icon size={20} className={`transition-colors ${f.iconClass}`} />
                    </div>
                    <Badge className={`text-xs rounded-full border font-medium ${f.badgeClass}`}>{f.badge}</Badge>
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
