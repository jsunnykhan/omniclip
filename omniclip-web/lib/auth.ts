import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { AuthResponse } from "@/types"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "OmniClip Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6030"
          const res = await fetch(`${apiBase}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null
          
          const user: AuthResponse = await res.json()

          if (user && (user.role === "admin" || user.role === "super_admin")) {
            return {
              id: user.id || user.email,
              email: user.email,
              role: user.role,
              accessToken: user.access_token,
            }
          }
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string
        token.accessToken = user.accessToken as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
