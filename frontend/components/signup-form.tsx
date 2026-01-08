"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell } from "lucide-react"

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to dashboard on signup
    router.push("/dashboard")
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a1b2e] border border-[#2a2d4a] rounded-lg p-8 shadow-2xl">
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-[#d97706] p-2 rounded-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">Join our security monitoring platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#d97706] focus:ring-[#d97706]"
            />
          </div>

          <div className="space-y-2">
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
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#d97706] focus:ring-[#d97706]"
            />
          </div>

          <div className="space-y-2">
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
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#d97706] focus:ring-[#d97706]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#d97706] focus:ring-[#d97706]"
            />
          </div>

          <div className="flex items-start gap-2 text-sm">
            <input type="checkbox" required className="mt-1 rounded border-[#2a2d4a] bg-[#0f1119]" />
            <label className="text-gray-400">
              I agree to the{" "}
              <Link href="#" className="text-[#d97706] hover:text-[#f59e0b]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#d97706] hover:text-[#f59e0b]">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button type="submit" className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-semibold">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#d97706] hover:text-[#f59e0b] font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
