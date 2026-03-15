import { auth } from "@/lib/auth"
import { PromosClient } from "./promos-client"
import { redirect } from "next/navigation"
import type { PromoCode } from "@/types"

export default async function PromosPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6030"
  let promos: PromoCode[] = []
  
  try {
    const res = await fetch(`${apiBase}/api/admin/promo-codes`, {
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
      },
      next: { revalidate: 0 }
    })
    
    if (res.ok) {
      promos = await res.json()
    }
  } catch (error) {
    console.error("Failed to fetch promos:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotional Codes</h2>
          <p className="text-neutral-400">Issue device limit upgrades to users.</p>
        </div>
      </div>
      
      <PromosClient initialPromos={promos} />
    </div>
  )
}
