"use client";

import { useState, useEffect } from "react";
import { Bell, Clock, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { removeAdminToken, getAdminToken } from "@/lib/auth";
import { getCurrentAdminInfo, AdminInfo } from "@/lib/api";

interface DashboardHeaderProps {
  alertsCount: number;
  currentTime: string;
}

export function DashboardHeader({
  alertsCount,
  currentTime,
}: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<AdminInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = getAdminToken();
        if (token) {
          const info = await getCurrentAdminInfo(token);
          setUserInfo(info);
        }
      } catch (error) {
        // If token is invalid, remove it and redirect
        if (error instanceof Error && error.message.includes("401")) {
          removeAdminToken();
          router.push("/login");
        }
      }
    };

    fetchUserInfo();
  }, [router]);

  const handleLogout = () => {
    removeAdminToken();
    router.push("/login");
  };

  return (
    <header
      className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border-b ${
        isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"
      } px-6 py-4 animate-slideInLeft`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#d97706] p-2 rounded-lg animate-glow">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h1
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            CyberPulse Monitor
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 transition-smooth hover:scale-105">
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              All Alerts
            </span>
            <Badge
              variant="secondary"
              className={`${
                isDarkMode
                  ? "bg-[#2a2d4a] text-gray-400"
                  : "bg-gray-200 text-gray-700"
              } transition-smooth hover:scale-110`}
            >
              {alertsCount}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {isDarkMode ? "Dark" : "Light"}
            </span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                isDarkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div
            className={`flex items-center gap-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            } transition-smooth hover:text-white`}
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentTime || "Loading..."}
            </span>
          </div>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${
                  isDarkMode ? "hover:bg-[#2a2d4a]" : "hover:bg-gray-200"
                } transition-smooth hover-lift`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center transition-smooth hover:shadow-lg hover:shadow-blue-500/50">
                  <UserCircle className="h-6 w-6 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={`w-56 ${
                isDarkMode
                  ? "bg-[#1a1b2e] border-[#2a2d4a] text-white"
                  : "bg-white border-gray-200"
              } animate-scaleIn`}
            >
              <DropdownMenuLabel
                className={isDarkMode ? "text-gray-300" : "text-gray-900"}
              >
                {userInfo ? (
                  <div className="flex flex-col">
                    <span className="font-semibold">{userInfo.username}</span>
                    <span className="text-xs text-gray-400 font-normal">
                      {userInfo.email}
                    </span>
                  </div>
                ) : (
                  "My Account"
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator
                className={isDarkMode ? "bg-[#2a2d4a]" : "bg-gray-200"}
              />
              <DropdownMenuItem
                onClick={handleLogout}
                className={`cursor-pointer ${
                  isDarkMode
                    ? "hover:bg-red-600/20 focus:bg-red-600/20 text-red-400"
                    : "hover:bg-red-50 text-red-600"
                } transition-fast`}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
