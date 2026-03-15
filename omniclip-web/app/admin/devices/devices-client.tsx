"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Device } from "@/types"

interface DevicesClientProps {
  initialDevices: Device[]
}

export function DevicesClient({ initialDevices }: DevicesClientProps) {
  const [devices] = useState<Device[]>(initialDevices)
  const [search, setSearch] = useState("")

  const filtered = search.trim()
    ? devices.filter(d => d.user_email?.toLowerCase().includes(search.toLowerCase()))
    : devices

  const sessionCount = search.trim() ? filtered.length : null

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
        <Input
          placeholder="Filter by user email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-neutral-900 border-neutral-800 focus:ring-red-500 w-full max-w-md"
        />
        {sessionCount !== null && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">
            {sessionCount} active session{sessionCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-800/50 text-neutral-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">OS</th>
              <th className="px-6 py-4 font-semibold">User Email</th>
              <th className="px-6 py-4 font-semibold">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-neutral-500 italic">
                  No devices found.
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{d.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="bg-neutral-800/50 border-neutral-700">
                      {d.os}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">{d.user_email}</td>
                  <td className="px-6 py-4 text-neutral-500 text-sm">
                    {new Date(d.last_sync).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
