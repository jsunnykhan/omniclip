import { auth } from "@/lib/auth"
import { UsersClient } from "./users-client"
import { redirect } from "next/navigation"
import type { User } from "@/types"

export default async function UsersPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6030"
  let users: User[] = []
  
  try {
    const res = await fetch(`${apiBase}/api/admin/users`, {
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
      },
      next: { revalidate: 0 }
    })
    
    if (res.ok) {
      users = await res.json()
    }
  } catch (error) {
    console.error("Failed to fetch users:", error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Directory</h2>
        <p className="text-neutral-400">Manage all registered clip clients.</p>
      </div>
      
      <UsersClient 
        initialUsers={users} 
        role={session.user.role} 
      />
    </div>
  )
}
