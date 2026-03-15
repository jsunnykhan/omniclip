"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2, X } from "lucide-react"
import type { PromoCode } from "@/types"
import { createPromoAction, updatePromoAction, deletePromoAction } from "@/app/admin/actions"

interface PromosClientProps {
  initialPromos: PromoCode[]
}

export function PromosClient({ initialPromos }: PromosClientProps) {
  const [promos, setPromos] = useState<PromoCode[]>(initialPromos)
  const [loading, setLoading] = useState(false)
  const [createModal, setCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState<PromoCode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PromoCode | null>(null)

  const [newCode, setNewCode] = useState("")
  const [newBoost, setNewBoost] = useState("5")
  const [newLimit, setNewLimit] = useState("100")
  const [newExpiry, setNewExpiry] = useState("")

  const [editLimit, setEditLimit] = useState("")
  const [editExpiry, setEditExpiry] = useState("")

  const handleCreate = async () => {
    if (!newCode) return
    setLoading(true)
    try {
      const data = {
        code: newCode.toUpperCase(),
        device_boost_count: Number.parseInt(newBoost),
        usage_limit: Number.parseInt(newLimit),
        expiry_date: newExpiry ? new Date(newExpiry).toISOString() : null,
      }
      await createPromoAction(data)
      setCreateModal(false)
      setNewCode(""); setNewBoost("5"); setNewLimit("100"); setNewExpiry("")
      // Re-fetching or updating state manually if needed. revalidatePath handles it usually.
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editTarget) return
    setLoading(true)
    try {
      await updatePromoAction(editTarget.code, {
        usage_limit: editLimit ? Number.parseInt(editLimit) : null,
        expiry_date: editExpiry ? new Date(editExpiry).toISOString() : null,
      })
      setEditTarget(null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    try {
      await deletePromoAction(deleteTarget.code)
      setDeleteTarget(null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateModal(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <Plus size={18} /> Generate Promo
        </Button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-800/50 text-neutral-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Code</th>
              <th className="px-6 py-4 font-semibold">Provides</th>
              <th className="px-6 py-4 font-semibold">Uses / Limit</th>
              <th className="px-6 py-4 font-semibold">Expires</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {promos.map((p) => (
              <tr key={p.code} className="hover:bg-neutral-800/30 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-red-500 tracking-wider text-sm">{p.code}</td>
                <td className="px-6 py-4 text-white">+{p.device_boost_count} Devices</td>
                <td className="px-6 py-4 text-neutral-300">
                  <span className="text-white font-medium">{p.times_used}</span>
                  <span className="text-neutral-500 mx-1">/</span>
                  <span className="text-neutral-500">{p.usage_limit}</span>
                </td>
                <td className="px-6 py-4 text-neutral-500 text-sm">
                  {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : "Never"}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button type="button" variant="ghost" size="icon" onClick={() => {
                    setEditTarget(p)
                    setEditLimit(String(p.usage_limit))
                    setEditExpiry(p.expiry_date ? new Date(p.expiry_date).toISOString().slice(0, 16) : "")
                  }} className="text-neutral-400 hover:text-white hover:bg-neutral-800">
                    <Edit2 size={16} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteTarget(p)} className="text-neutral-400 hover:text-red-500 hover:bg-red-500/10">
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/30">
              <h2 className="text-xl font-bold">Generate Promo Code</h2>
              <button onClick={() => setCreateModal(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} placeholder="SUMMER-26" className="uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Device Boost</Label>
                  <Input type="number" value={newBoost} onChange={e => setNewBoost(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Usage Limit</Label>
                  <Input type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (optional)</Label>
                <Input type="datetime-local" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 border-neutral-800" onClick={() => setCreateModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={loading || !newCode} onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-800/30">
              <h2 className="text-xl font-bold">Edit: {editTarget.code}</h2>
              <button onClick={() => setEditTarget(null)} className="text-neutral-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input type="number" value={editLimit} onChange={e => setEditLimit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="datetime-local" value={editExpiry} onChange={e => setEditExpiry(e.target.value)} />
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 border-neutral-800" onClick={() => setEditTarget(null)}>Cancel</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={loading} onClick={handleEdit}>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold mb-2">Delete Promo Code</h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                Are you sure you want to delete <span className="text-white font-semibold font-mono">{deleteTarget.code}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-neutral-800" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={loading} onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
