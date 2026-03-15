import Link from "next/link";
import { Copy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6 bg-card/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5 font-bold text-lg text-foreground">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
            <Copy size={15} className="text-primary-foreground" />
          </span>
          OmniClip
        </div>
        <p className="text-muted-foreground text-sm order-last md:order-none">
          © 2026 OmniClip. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/download" className="hover:text-foreground transition-colors font-medium">Download</Link>
          <Link href="/#features" className="hover:text-foreground transition-colors font-medium">Features</Link>
          <Link href="/#roadmap" className="hover:text-foreground transition-colors font-medium">Roadmap</Link>
        </div>
      </div>
    </footer>
  );
}
