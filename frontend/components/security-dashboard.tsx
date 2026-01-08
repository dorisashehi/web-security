"use client"

import { useState } from "react"
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  FileText,
  User,
  Wifi,
  AlertTriangle,
  LogOut,
  UserCircle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDetailModal } from "@/components/alert-detail-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"

const alerts = [
  {
    id: 1,
    title: "Network Traffic Spike Detected!",
    description: "Unusual traffic patterns from IP 192.168.1.5",
    severity: "HIGH",
    icon: Wifi,
    time: "2m ago",
    ip: "192.168.1.5",
    details: {
      origin: "192.168.1.5 (Origin)",
      rate: "350 req/s",
      location: "New York, USA",
      tags: ["Suspicious", "DDoS Risk"],
      fullDescription:
        "A sudden traffic spike has been detected from IP address 192.168.1.5. Large volume of unusual requests within a short time frame, indicating possible DDoS attack or malicious activity.",
    },
  },
  {
    id: 2,
    title: "Multiple Failed Login Attempts",
    description: "Detected on admin account",
    subtitle: "Apnt Secved Start impact",
    severity: "MEDIUM",
    icon: FileText,
    time: "5m ago",
  },
  {
    id: 3,
    title: "Suspicious User Behavior Detected!",
    description: "Sudden access from multiple locations",
    severity: "HIGH",
    icon: User,
    time: "8m ago",
  },
  {
    id: 4,
    title: "Possible DDoS Attack Detected!",
    description: "High volume of requests from suspicious IPs",
    severity: "HIGH",
    icon: Wifi,
    time: "12m ago",
  },
  {
    id: 5,
    title: "Unauthorized Access Attempt",
    description: "Detected",
    subtitle: "to sensitive folder",
    severity: "LOW",
    icon: FileText,
    time: "15m ago",
  },
  {
    id: 6,
    title: "Unusual User Activity",
    description: "Detected!",
    subtitle: "Accessing restricted areas without escalation",
    severity: "MEDIUM",
    icon: User,
    time: "20m ago",
  },
  {
    id: 7,
    title: "Privilege Escalation Detected!",
    description: "Admin privileges granted without valid request",
    severity: "HIGH",
    icon: FileText,
    time: "25m ago",
  },
]

const suspiciousIPs = [
  { ip: "194.28.13.47", count: 58, severity: "HIGH" },
  { ip: "203.0.113.15", count: 43, severity: "MEDIUM" },
  { ip: "178.62.20.16", count: 37, severity: "LOW" },
]

export function SecurityDashboard() {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const [selectedAlert, setSelectedAlert] = useState<(typeof alerts)[0] | null>(null)
  const router = useRouter()

  const handleLogout = () => {
    router.push("/login")
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#0a0b14]" : "bg-gray-100"} animate-fadeIn`}>
      {/* Header */}
      <header
        className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border-b ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} px-6 py-4 animate-slideInLeft`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#d97706] p-2 rounded-lg animate-glow">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h1 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Real-Time Security Alerts Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 transition-smooth hover:scale-105">
              <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>All Alerts</span>
              <Badge
                variant="secondary"
                className={`${isDarkMode ? "bg-[#2a2d4a] text-gray-400" : "bg-gray-200 text-gray-700"} transition-smooth hover:scale-110`}
              >
                24
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
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
              className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"} transition-smooth hover:text-white`}
            >
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">10:45 AM</span>
            </div>

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${isDarkMode ? "hover:bg-[#2a2d4a]" : "hover:bg-gray-200"} transition-smooth hover-lift`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center transition-smooth hover:shadow-lg hover:shadow-blue-500/50">
                    <UserCircle className="h-6 w-6 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-56 ${isDarkMode ? "bg-[#1a1b2e] border-[#2a2d4a] text-white" : "bg-white border-gray-200"} animate-scaleIn`}
              >
                <DropdownMenuLabel className={isDarkMode ? "text-gray-300" : "text-gray-900"}>
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={isDarkMode ? "bg-[#2a2d4a]" : "bg-gray-200"} />
                <DropdownMenuItem
                  onClick={() => router.push("/about")}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-[#2a2d4a] focus:bg-[#2a2d4a]" : "hover:bg-gray-100"} transition-fast`}
                >
                  <Info className="mr-2 h-4 w-4" />
                  <span>About</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDarkMode ? "bg-[#2a2d4a]" : "bg-gray-200"} />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className={`cursor-pointer ${isDarkMode ? "hover:bg-red-600/20 focus:bg-red-600/20 text-red-400" : "hover:bg-red-50 text-red-600"} transition-fast`}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Alert List */}
        <div
          className={`w-[600px] ${isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"} border-r ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} p-6 animate-slideInLeft animate-delay-100`}
        >
          {/* Navigation */}
          <div className="flex items-center gap-2 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className={`${isDarkMode ? "text-gray-600 hover:bg-[#1a1b2e]" : "text-gray-400 hover:bg-gray-200"} transition-smooth hover-lift`}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${isDarkMode ? "text-gray-600 hover:bg-[#1a1b2e]" : "text-gray-400 hover:bg-gray-200"} transition-smooth hover-lift`}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Section Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Real-Time Security Alerts
              </h2>
              <Clock className={`h-5 w-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"} animate-pulse-slow`} />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                className={`${isDarkMode ? "bg-[#2a2d4a] text-gray-300" : "bg-gray-200 text-gray-700"} transition-smooth hover-lift`}
              >
                <Shield className="h-4 w-4 mr-2" />
                All Alerts
                <Badge className="ml-2 bg-[#3a3d5a] text-gray-300">24</Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${isDarkMode ? "text-gray-400 hover:bg-[#1a1b2e]" : "text-gray-600 hover:bg-gray-200"} transition-smooth hover-lift`}
              >
                <Wifi className="h-4 w-4 mr-2" />
                Network
                <Badge variant="secondary" className="ml-2">
                  18
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${isDarkMode ? "text-gray-400 hover:bg-[#1a1b2e]" : "text-gray-600 hover:bg-gray-200"} transition-smooth hover-lift`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Logs
                <Badge variant="secondary" className="ml-2">
                  5
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${isDarkMode ? "text-gray-400 hover:bg-[#1a1b2e]" : "text-gray-600 hover:bg-gray-200"} transition-smooth hover-lift`}
              >
                <User className="h-4 w-4 mr-2" />
                <Badge variant="secondary" className="ml-1">
                  11
                </Badge>
              </Button>
            </div>
          </div>

          {/* Live Alerts Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse-slow" />
              <h3 className="text-lg font-semibold text-red-500">LIVE ALERTS</h3>
              <span className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>(14)</span>
            </div>

            {/* Alert Cards */}
            <div className="space-y-3">
              {alerts.map((alert, index) => {
                const Icon = alert.icon
                return (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    className={`w-full rounded-lg p-4 transition-all duration-300 text-left hover-lift animate-fadeInUp ${
                      alert.severity === "HIGH"
                        ? isDarkMode
                          ? "bg-gradient-to-r from-[#4a1a2e] via-[#2d1b3d] to-[#1e1b3d] border border-red-900/30 hover:border-red-600 hover:shadow-lg hover:shadow-red-600/20"
                          : "bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 border border-red-200 hover:border-red-400 hover:shadow-lg hover:shadow-red-200"
                        : alert.severity === "MEDIUM"
                          ? isDarkMode
                            ? "bg-gradient-to-r from-[#4a3520] via-[#2d2435] to-[#1e1b3d] border border-yellow-900/30 hover:border-yellow-600 hover:shadow-lg hover:shadow-yellow-600/20"
                            : "bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-200"
                          : isDarkMode
                            ? "bg-gradient-to-r from-[#1e2a3d] via-[#1e1f3d] to-[#1e1b3d] border border-blue-900/30 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20"
                            : "bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 border border-blue-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`p-3 rounded-lg transition-smooth hover:scale-110 ${
                          alert.severity === "HIGH"
                            ? isDarkMode
                              ? "bg-gradient-to-br from-red-600 to-red-700"
                              : "bg-gradient-to-br from-red-500 to-red-600"
                            : alert.severity === "MEDIUM"
                              ? isDarkMode
                                ? "bg-gradient-to-br from-yellow-600 to-yellow-700"
                                : "bg-gradient-to-br from-orange-500 to-orange-600"
                              : isDarkMode
                                ? "bg-gradient-to-br from-blue-600 to-blue-700"
                                : "bg-gradient-to-br from-blue-500 to-blue-600"
                        }`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle
                              className={`h-4 w-4 ${
                                alert.severity === "HIGH"
                                  ? "text-red-500"
                                  : alert.severity === "MEDIUM"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                              }`}
                            />
                            <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                              {alert.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                              {alert.time}
                            </span>
                            <ChevronRight
                              className={`h-5 w-5 ${isDarkMode ? "text-gray-600" : "text-gray-400"} transition-smooth group-hover:translate-x-1`}
                            />
                          </div>
                        </div>
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-1`}>
                          {alert.description}
                        </p>
                        {alert.subtitle && (
                          <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                            {alert.subtitle}
                          </p>
                        )}
                      </div>

                      {/* Severity Badge */}
                      <div
                        className={`px-3 py-1 rounded text-xs font-bold transition-smooth hover:scale-105 ${
                          alert.severity === "HIGH"
                            ? "bg-red-600 text-white"
                            : alert.severity === "MEDIUM"
                              ? "bg-yellow-600 text-white"
                              : "bg-blue-600 text-white"
                        }`}
                      >
                        {alert.severity}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Statistics */}
        <div className="flex-1 p-6 space-y-6 animate-slideInRight animate-delay-200">
          {/* Incidents Summary */}
          <div
            className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-lg p-6 hover-lift transition-smooth animate-fadeInUp`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Incidents Summary
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className={`${isDarkMode ? "text-gray-600 hover:bg-[#2a2d4a]" : "text-gray-400 hover:bg-gray-100"} transition-smooth hover-lift`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Button>
            </div>

            {/* Threat Level Chart */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
                Threat Level
              </h4>
              <div className="relative flex items-center justify-center">
                <svg className="w-64 h-64 transition-smooth hover:scale-105" viewBox="0 0 200 200">
                  {/* Red segment (50%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="40"
                    strokeDasharray="219.9 439.8"
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                  {/* Yellow segment (29%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="40"
                    strokeDasharray="127.5 439.8"
                    strokeDashoffset="-219.9"
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                  {/* Blue segment (21%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="40"
                    strokeDasharray="92.4 439.8"
                    strokeDashoffset="-347.4"
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>7.7</div>
                  <div className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>/\/\/\/ 4</div>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 transition-smooth hover:scale-110 cursor-pointer">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse-slow"></div>
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>50%</span>
                </div>
                <div className="flex items-center gap-2 transition-smooth hover:scale-110 cursor-pointer">
                  <div
                    className="w-3 h-3 bg-yellow-600 rounded-full animate-pulse-slow"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>29%</span>
                </div>
                <div className="flex items-center gap-2 transition-smooth hover:scale-110 cursor-pointer">
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-pulse-slow"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>21%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Trend */}
          <div
            className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-lg p-6 hover-lift transition-smooth animate-fadeInUp animate-delay-100`}
          >
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-4`}>
              Alerts Trend
            </h3>
            <div className="relative h-40">
              <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,120 L 80,100 L 160,80 L 240,60 L 320,70 L 400,30"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
                <path
                  d="M 0,120 L 80,100 L 160,80 L 240,60 L 320,70 L 400,30 L 400,160 L 0,160 Z"
                  fill="url(#gradient)"
                />
                <circle cx="400" cy="30" r="4" fill="#3b82f6" className="animate-pulse-slow" />
              </svg>
              <div
                className={`absolute bottom-0 left-0 right-0 flex justify-between text-xs ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
              >
                <span>09:00</span>
                <span>16:00</span>
                <span>18:00</span>
                <span>21:00</span>
                <span>05:00</span>
              </div>
            </div>
          </div>

          {/* Top 3 Suspicious IPs */}
          <div
            className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-lg p-6 hover-lift transition-smooth animate-fadeInUp animate-delay-200`}
          >
            <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-4`}>
              Top 3 Suspicious IPs
            </h3>
            <div className="space-y-3">
              {suspiciousIPs.map((item, index) => (
                <div
                  key={item.ip}
                  style={{ animationDelay: `${index * 0.15}s` }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"
                  } transition-smooth hover-lift animate-fadeIn`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-smooth ${
                        item.severity === "HIGH"
                          ? "bg-red-600/20"
                          : item.severity === "MEDIUM"
                            ? "bg-yellow-600/20"
                            : "bg-blue-600/20"
                      }`}
                    >
                      <Shield
                        className={`h-5 w-5 ${
                          item.severity === "HIGH"
                            ? "text-red-500"
                            : item.severity === "MEDIUM"
                              ? "text-yellow-500"
                              : "text-blue-500"
                        }`}
                      />
                    </div>
                    <span className={`font-mono text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {item.ip}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert!}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}
