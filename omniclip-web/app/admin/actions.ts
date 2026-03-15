"use server"

import { auth, signIn, signOut } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6030"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    })
  } catch (error) {
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

export async function promoteUserAction(userId: string) {
  const session = await auth()
  if (!session || (session.user as any).role !== "super_admin") {
    throw new Error("Unauthorized")
  }

  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/upgrade`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to promote user")
  }

  revalidatePath("/admin/users")
}

export async function createPromoAction(data: {
  code: string
  device_boost_count: number
  usage_limit: number
  expiry_date: string | null
}) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const res = await fetch(`${API_BASE}/api/admin/promo-codes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error("Failed to create promo code")
  revalidatePath("/admin/promos")
}

export async function updatePromoAction(
  code: string,
  data: { usage_limit: number | null; expiry_date: string | null }
) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const res = await fetch(`${API_BASE}/api/admin/promo-codes/${code}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error("Failed to update promo code")
  revalidatePath("/admin/promos")
}

export async function deletePromoAction(code: string) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")

  const res = await fetch(`${API_BASE}/api/admin/promo-codes/${code}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  if (!res.ok) throw new Error("Failed to delete promo code")
  revalidatePath("/admin/promos")
}
