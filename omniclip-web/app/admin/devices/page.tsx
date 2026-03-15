import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Device } from "@/types"
import { DevicesClient } from "./devices-client"

export default async function DevicesPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6030"
  let devices: Device[] = []

  try {
    const res = await fetch(`${apiBase}/api/admin/devices`, {
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
      },
      next: { revalidate: 0 }
    })

    if (res.ok) {
      devices = await res.json()
    }
  } catch (error) {
    console.error("Failed to fetch devices:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Connected Devices</h2>
        <p className="text-neutral-400">Active clip watcher instances globally.</p>
      </div>

      <DevicesClient initialDevices={devices} />
    </div>
  )
}
