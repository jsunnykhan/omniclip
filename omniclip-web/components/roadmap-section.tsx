import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const roadmap = [
  {
    quarter: "Q1 2026",
    status: "shipped",
    items: [
      "Text clipboard sync (Windows, macOS, Linux)",
      "AES-256-GCM end-to-end encryption",
      "WebSocket real-time relay server",
      "JWT authentication & promo code system",
      "Admin dashboard with user & device management",
      "Auto-update via Tauri updater plugin",
    ],
  },
  {
    quarter: "Q2 2026",
    status: "in-progress",
    items: [
      "Image clipboard sync",
      "Mobile apps (iOS & Android)",
      "Clipboard history (last 50 items)",
      "Custom relay server support",
    ],
  },
  {
    quarter: "Q3 2026",
    status: "planned",
    items: [
      "File transfer (drag & drop)",
      "Shared clipboard rooms (team mode)",
      "Browser extension (Chrome, Firefox)",
      "Offline queue with sync on reconnect",
    ],
  },
  {
    quarter: "Q4 2026",
    status: "planned",
    items: [
      "Rich text & HTML paste support",
      "Apple Watch clipboard glance",
      "Enterprise SSO & audit logs",
      "On-premise self-hosting kit",
    ],
  },
];

const statusConfig = {
  shipped: {
    label: "Shipped",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
    textClass: "text-foreground",
    Icon: CheckCircle2,
    cardClass: "border-emerald-500/20 bg-card",
  },
  "in-progress": {
    label: "In Progress",
    badgeClass: "bg-primary/10 text-primary border-primary/25",
    dot: "bg-primary",
    textClass: "text-foreground/80",
    Icon: Clock,
    cardClass: "border-primary/20 bg-card",
  },
  planned: {
    label: "Planned",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/40",
    textClass: "text-muted-foreground",
    Icon: Circle,
    cardClass: "border-border bg-card/50",
  },
};

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-32 px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-primary/6 blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border border-primary/25 rounded-full px-4 py-1.5 font-medium">
            Roadmap
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Where we&apos;re{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">headed.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Transparent progress. Big plans. Built in the open.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roadmap.map((phase) => {
            const cfg = statusConfig[phase.status as keyof typeof statusConfig];
            const Icon = cfg.Icon;
            return (
              <div
                key={phase.quarter}
                className={`relative border rounded-2xl p-6 flex flex-col gap-5 hover:shadow-md transition-all duration-300 ${cfg.cardClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-mono font-semibold uppercase tracking-widest">{phase.quarter}</span>
                  <Badge className={`text-xs rounded-full border font-medium flex items-center gap-1 ${cfg.badgeClass}`}>
                    <Icon size={10} />
                    {cfg.label}
                  </Badge>
                </div>
                <ul className="space-y-2.5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                      <span className={cfg.textClass}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
