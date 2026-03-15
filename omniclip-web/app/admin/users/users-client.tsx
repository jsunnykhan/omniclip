"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldAlert, X } from "lucide-react"
import type { User, Device } from "@/types"
import { promoteUserAction } from "@/app/admin/actions"

interface UsersClientProps {
  initialUsers: User[]
  role: string
}

export function UsersClient({ initialUsers, role }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userDevices, setUserDevices] = useState<Device[]>([])
  const [promoteTarget, setPromoteTarget] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6030"

  const openUser = async (user: User) => {
    setSelectedUser(user)
    try {
      // In a real app, this fetch could also be a Server Action or a tied route
      // For now we keep it since it is specific to the modal detail
      const res = await fetch(`${apiBase}/api/admin/users/${user.id}/devices`)
      if (res.ok) setUserDevices(await res.json())
      else setUserDevices([])
    } catch (e) {
      setUserDevices([])
    }
  }

  const handlePromote = async () => {
    if (!promoteTarget) return
    setLoading(true)
    try {
      await promoteUserAction(promoteTarget.id)
      // Update local state for immediate feedback
      setUsers(prev => prev.map(u => u.id === promoteTarget.id ? { ...u, role: "admin" } : u))
      setPromoteTarget(null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-800/50 text-neutral-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Max Devices</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral-800/30 transition-colors">
                <td className="px-6 py-4">
                  <button 
                    type="button"
                    onClick={() => openUser(u)}
                    className="text-white font-medium hover:text-red-500 transition-colors"
                  >
                    {u.email}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <Badge className={u.role === "admin" || u.role === "super_admin" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-neutral-300">{u.max_allowed_devices}</td>
                <td className="px-6 py-4 text-neutral-500 text-sm">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {role === "super_admin" && u.role === "user" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPromoteTarget(u)}
                      className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Make Admin
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/30">
              <h2 className="text-xl font-bold">User Details: {selectedUser.email}</h2>
              <button onClick={() => setSelectedUser(null)} className="text-neutral-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-xs text-neutral-500 block mb-1">Current Role</span>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">{selectedUser.role}</Badge>
                </div>
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                  <span className="text-xs text-neutral-500 block mb-1">Max Devices</span>
                  <span className="font-mono text-white">{selectedUser.max_allowed_devices}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
                  Linked Devices ({userDevices.length})
                </h3>
                {userDevices.length === 0 ? (
                  <p className="text-neutral-500 text-sm italic">No devices linked.</p>
                ) : (
                  <div className="bg-neutral-950 border border-neutral-800 rounded-md overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-neutral-800/30 text-neutral-500 border-b border-neutral-800">
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">OS</th>
                          <th className="px-4 py-2">Last Sync</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {userDevices.map(d => (
                          <tr key={d.id}>
                            <td className="px-4 py-2 text-white">{d.name}</td>
                            <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{d.os}</Badge></td>
                            <td className="px-4 py-2 text-neutral-500 text-[11px]">{new Date(d.last_sync).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {promoteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">Confirm Promotion</h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Are you sure you want to promote <span className="text-white font-semibold">{promoteTarget.email}</span> to Admin? They will have full access to system controls.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-neutral-800 hover:bg-neutral-800"
                  onClick={() => setPromoteTarget(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={loading}
                  onClick={handlePromote}
                >
                  {loading ? "Promoting..." : "Yes, Promote"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
