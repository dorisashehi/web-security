"use client"

import { useState } from "react"
import { Bell, Shield, Activity, Eye, TrendingUp, ArrowLeft, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const [isDarkMode] = useState(true)
  const router = useRouter()

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#0a0b14]" : "bg-gray-100"}`}>
      {/* Header */}
      <header
        className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border-b ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} px-6 py-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className={`${isDarkMode ? "text-gray-400 hover:bg-[#2a2d4a]" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="bg-[#d97706] p-2 rounded-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h1 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              About Real-Time Security Alerts Dashboard
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#d97706] to-[#b45309] rounded-2xl mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-4`}>
            Real-Time Security Monitoring
          </h1>
          <p className={`text-xl ${isDarkMode ? "text-gray-400" : "text-gray-600"} max-w-3xl mx-auto`}>
            A comprehensive security dashboard that provides real-time threat detection, network monitoring, and
            incident management to protect your digital infrastructure.
          </p>
        </div>

        {/* Video Demo Section */}
        <div
          className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-xl p-8 mb-12`}
        >
          <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-6 text-center`}>
            Platform Demo
          </h2>
          <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden group cursor-pointer">
            <img
              src="/security-dashboard-monitoring-interface.jpg"
              alt="Dashboard Demo"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="h-10 w-10 text-white ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-8 text-center`}>
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-xl p-6`}
            >
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-red-500" />
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                Real-Time Alerts
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Receive instant notifications for security threats including network spikes, unauthorized access
                attempts, and suspicious behavior patterns.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-xl p-6`}
            >
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                Threat Analysis
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Advanced analytics engine categorizes threats by severity (HIGH, MEDIUM, LOW) and provides detailed
                incident reports with actionable insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-xl p-6`}
            >
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                Network Monitoring
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Continuous monitoring of network traffic patterns, IP addresses, and connection attempts to identify
                potential DDoS attacks and intrusions.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-xl p-6`}
            >
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                User Behavior Tracking
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Monitor user activities including failed login attempts, privilege escalations, and access to restricted
                areas to prevent insider threats.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-xl p-6`}
            >
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                Trend Visualization
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Interactive charts and graphs display alert trends over time, helping identify patterns and forecast
                potential security incidents.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-xl p-6`}
            >
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                Incident Response
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Suggested actions for each threat including IP blocking, investigation guidelines, and automated
                response workflows to mitigate risks quickly.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div
          className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"} rounded-xl p-8 mb-12`}
        >
          <h2 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-8 text-center`}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src="/network-security-monitoring.png"
                alt="Security Monitoring"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                1. Continuous Monitoring
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Our system continuously monitors your network infrastructure, analyzing traffic patterns, user
                behaviors, and system logs in real-time to detect anomalies.
              </p>
            </div>
            <div>
              <img
                src="/threat-detection-alert-system.jpg"
                alt="Threat Detection"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                2. Threat Detection
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Advanced algorithms identify potential threats including DDoS attacks, brute force attempts, and
                suspicious IP addresses, categorizing them by severity level.
              </p>
            </div>
            <div>
              <img
                src="/security-incident-analysis-dashboard.jpg"
                alt="Analysis"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                3. Detailed Analysis
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Each alert provides comprehensive details including origin IP, request rates, geographic location, and
                historical activity logs for thorough investigation.
              </p>
            </div>
            <div>
              <img
                src="/automated-security-response-action.jpg"
                alt="Response"
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                4. Rapid Response
              </h3>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Take immediate action with suggested responses including blocking malicious IPs, investigating logs, or
                triggering automated security protocols to neutralize threats.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white px-8 py-6 text-lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </main>
    </div>
  )
}
