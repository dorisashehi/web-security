"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAdmin } from "@/lib/api";
import { saveAdminToken } from "@/lib/auth";
import { Bell } from "lucide-react";

export function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerAdmin(
        formData.username,
        formData.email,
        formData.password
      );
      saveAdminToken(response.access_token);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fadeInUp">
      <Card className="bg-[#1a1b2e] border border-[#2a2d4a] p-8 shadow-2xl hover-lift transition-smooth">
        {/* Logo and Title */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-scaleIn">
          <div className="bg-[#d97706] p-2 rounded-lg animate-glow">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
        </div>

        <div className="text-center mb-8 animate-fadeIn animate-delay-100">
          <h2 className="text-xl font-semibold text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm">
            Sign up to access your security dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#3b82f6]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#3b82f6]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#3b82f6]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-300"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              className="bg-[#0f1119] border-[#2a2d4a] text-white placeholder:text-gray-500 focus:border-[#3b82f6]"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-smooth"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#2a2d4a] text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#3b82f6] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
