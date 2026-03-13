import Link from "next/link";
import { Copy } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/8 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Copy size={16} className="text-white" />
          </span>
          OmniClip
        </div>
        <p className="text-white/30 text-sm">© 2026 OmniClip. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm text-white/30">
          <Link href="/download" className="hover:text-white transition-colors">Download</Link>
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#roadmap" className="hover:text-white transition-colors">Roadmap</Link>
        </div>
      </div>
    </footer>
  );
}
