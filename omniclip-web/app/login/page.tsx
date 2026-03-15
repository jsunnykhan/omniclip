import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background px-4 overflow-hidden">
      {/* Brand glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,oklch(0.6_0.22_280/6%)_1px,transparent_1px)] bg-[size:36px_36px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
