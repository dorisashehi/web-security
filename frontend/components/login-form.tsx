"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to dashboard on login
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md animate-fadeInUp">
      <div className="bg-[#1a1b2e] border border-[#2a2d4a] rounded-lg p-8 shadow-2xl hover-lift transition-smooth">
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-scaleIn">
          <div className="bg-[#d97706] p-2 rounded-lg animate-glow">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
        </div>

        <div className="text-center mb-8 animate-fadeIn animate-delay-100">
          <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Sign in to access your security dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 animate-fadeIn animate-delay-200">
            <Label htmlFor="email" className="text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@security.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#d97706] focus:ring-[#d97706] transition-fast"
            />
          </div>

          <div className="space-y-2 animate-fadeIn animate-delay-300">
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#d97706] focus:ring-[#d97706] transition-fast"
            />
          </div>

          <div className="flex items-center justify-between text-sm animate-fadeIn animate-delay-400">
            <label className="flex items-center gap-2 text-gray-400 cursor-pointer transition-smooth hover:text-gray-300">
              <input type="checkbox" className="rounded border-[#2a2d4a] bg-[#0f1119]" />
              Remember me
            </label>
            <Link href="#" className="text-[#d97706] hover:text-[#f59e0b] transition-fast">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-semibold transition-smooth hover-lift animate-fadeIn animate-delay-500"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400 animate-fadeIn animate-delay-500">
          {"Don't have an account? "}
          <Link href="/signup" className="text-[#d97706] hover:text-[#f59e0b] font-semibold transition-fast">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
