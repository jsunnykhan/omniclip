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
  shipped: { label: "Shipped", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", Icon: CheckCircle2 },
  "in-progress": { label: "In Progress", color: "bg-violet-500/10 text-violet-400 border-violet-500/20", dot: "bg-violet-400", Icon: Clock },
  planned: { label: "Planned", color: "bg-white/5 text-white/40 border-white/10", dot: "bg-white/20", Icon: Circle },
};

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-32 px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-white/5 text-white/50 border border-white/10 rounded-full px-4 py-1.5">
            Roadmap
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Where we&apos;re{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">headed.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Transparent progress. Big plans. Built in the open.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmap.map((phase) => {
            const cfg = statusConfig[phase.status as keyof typeof statusConfig];
            const Icon = cfg.Icon;
            return (
              <div
                key={phase.quarter}
                className="relative bg-white/3 border border-white/8 rounded-2xl p-6 flex flex-col gap-5 hover:border-white/15 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs font-mono uppercase tracking-widest">{phase.quarter}</span>
                  <Badge className={`text-xs rounded-full border ${cfg.color} flex items-center gap-1`}>
                    <Icon size={10} />
                    {cfg.label}
                  </Badge>
                </div>
                <ul className="space-y-3">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                      <span className={phase.status === "shipped" ? "text-white/70" : "text-white/35"}>{item}</span>
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
