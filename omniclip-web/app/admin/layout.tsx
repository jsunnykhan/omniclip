import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/admin/sidebar"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const role = (session.user as any)?.role || "Unknown"

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-base font-semibold text-foreground">Admin Console</h1>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">{session.user?.email}</span>
              <span className="text-xs text-muted-foreground capitalize">{role}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm text-primary-foreground shadow-sm shadow-primary/30">
              {session.user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
