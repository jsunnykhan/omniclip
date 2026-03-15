"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { loginAction } from "@/app/admin/actions"
import Link from "next/link"

export function LoginForm() {
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    try {
      await loginAction(formData)
    } catch {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border border-border bg-card shadow-xl shadow-black/10">
      <CardHeader className="space-y-3 flex flex-col items-center pb-6">
        {/* Logo mark */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground mb-1">
          <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/40">
            <Copy size={17} className="text-primary-foreground" />
          </span>
          OmniClip
        </Link>
        <div className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Admin Portal</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Authorized personnel only
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@omniclip.com"
              required
              autoComplete="email"
              className="bg-background border-border focus-visible:ring-primary/30 focus-visible:border-primary/60"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                className="bg-background border-border focus-visible:ring-primary/30 focus-visible:border-primary/60 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 text-sm bg-destructive/8 border border-destructive/25 text-destructive rounded-xl">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/30 font-semibold rounded-xl h-11"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Authenticating…</>
            ) : (
              "Log In"
            )}
          </Button>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            ← Back to OmniClip
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
