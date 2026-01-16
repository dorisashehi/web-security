"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SecurityDashboard } from "@/components/security-dashboard";
import { isAdminLoggedIn, removeAdminToken } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if admin is logged in when component loads
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAdminLoggedIn()) {
        router.push("/login");
        setIsAuthenticated(false);
        return;
      }

      // Token exists, but we should verify it's still valid
      // We'll verify it when making API calls
      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  // Show nothing (or loading) while checking authentication
  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return <SecurityDashboard />;
}
