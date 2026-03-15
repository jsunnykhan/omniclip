"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, MonitorSmartphone, Ticket, Copy, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  { href: "/admin/users",   label: "Users",       icon: Users },
  { href: "/admin/devices", label: "Devices",     icon: MonitorSmartphone },
  { href: "/admin/promos",  label: "Promo Codes", icon: Ticket },
]

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2.5 border-b border-border">
        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
          <Copy size={15} className="text-primary-foreground" />
        </span>
        <h2 className="text-base font-bold text-foreground tracking-tight">OmniClip</h2>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon
                size={17}
                className={cn(
                  "transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {role}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 rounded-xl transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
