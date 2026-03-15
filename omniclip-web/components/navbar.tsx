"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Copy, Menu, X, Download, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#roadmap",  label: "Roadmap"  },
  { href: "/download",  label: "Download" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Main header bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-foreground shrink-0">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/40">
              <Copy size={15} className="text-primary-foreground" />
            </span>
            OmniClip
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground hover:text-foreground font-medium rounded-full px-4"
              )}
            >
              <LogIn size={15} className="mr-1.5" />
              Login
            </Link>
            <Link
              href="/download"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/30 rounded-full px-5 font-semibold"
              )}
            >
              <Download size={14} className="mr-1.5" />
              Download
            </Link>
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-[280px] bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Mobile navigation"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 font-bold text-base text-foreground"
          >
            <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
              <Copy size={13} className="text-primary-foreground" />
            </span>
            OmniClip
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar CTAs */}
        <div className="p-4 border-t border-border space-y-2 shrink-0">
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full rounded-xl font-medium justify-center"
            )}
          >
            <LogIn size={15} className="mr-2" />
            Login
          </Link>
          <Link
            href="/download"
            onClick={() => setMobileOpen(false)}
            className={cn(
              buttonVariants(),
              "w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold justify-center shadow-sm shadow-primary/30"
            )}
          >
            <Download size={15} className="mr-2" />
            Download Free
          </Link>
        </div>
      </aside>
    </>
  );
}
