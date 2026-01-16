"use client";

import { useState, useEffect } from "react";
import {
  Bell,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDetailModal } from "@/components/alert-detail-modal";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  icon: typeof Wifi;
  time: string;
  ip?: string;
  subtitle?: string;
  recommended_action?: string;
  agent?: string;
  created_at?: string;
  details?: {
    origin: string;
    rate: string;
    location: string;
    tags: string[];
    fullDescription: string;
  };
}

export function SecurityDashboard() {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [relatedAlerts, setRelatedAlerts] = useState<Alert[]>([]);
  const [filterAgent, setFilterAgent] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const router = useRouter();

  const getAgentIcon = (agent: string) => {
    if (agent === "traffic_monitor") return Wifi;
    if (agent === "log_analyzer") return FileText;
    if (agent === "behavior_analyzer") return User;
    return AlertTriangle;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getAlertTitle = (
    agent: string,
    classification: string | null,
    reason: string | null
  ) => {
    if (agent === "traffic_monitor") {
      return classification === "suspicious"
        ? "Network Traffic Spike Detected!"
        : "Traffic Anomaly Detected";
    }
    if (agent === "log_analyzer") {
      return "Multiple Failed Login Attempts";
    }
    if (agent === "behavior_analyzer") {
      return "Suspicious User Behavior Detected!";
    }
    return "Security Alert";
  };

  const getAlertDescription = (alert: any) => {
    if (alert.ip && alert.route) {
      return `Unusual activity from IP ${alert.ip} on route ${alert.route}`;
    }
    if (alert.reason) {
      return alert.reason.length > 100
        ? alert.reason.substring(0, 100) + "..."
        : alert.reason;
    }
    return "Security alert detected";
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/alerts");
      const data = await response.json();

      if (data.success && data.alerts) {
        const formattedAlerts: Alert[] = data.alerts.map((alert: any) => ({
          id: alert.id,
          title: getAlertTitle(alert.agent, alert.classification, alert.reason),
          description: getAlertDescription(alert),
          severity: alert.severity.toUpperCase() as "HIGH" | "MEDIUM" | "LOW",
          icon: getAgentIcon(alert.agent),
          time: formatTimeAgo(alert.created_at),
          ip: alert.ip || undefined,
          recommended_action: alert.recommended_action || undefined,
          agent: alert.agent || undefined,
          created_at: alert.created_at || undefined,
          details: {
            origin: alert.ip ? `${alert.ip} (Origin)` : "Unknown (Origin)",
            rate: alert.requests_per_minute
              ? `${alert.requests_per_minute} req/min`
              : "N/A",
            location: "Unknown",
            tags: alert.classification ? [alert.classification] : [],
            fullDescription: alert.reason || "No additional details available.",
          },
        }));
        setAlerts(formattedAlerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const fetchRelatedAlerts = async (alertId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/alerts/${alertId}/related`
      );
      const data = await response.json();

      if (data.success && data.related_alerts) {
        const formattedRelatedAlerts: Alert[] = data.related_alerts.map(
          (alert: any) => ({
            id: alert.id,
            title: getAlertTitle(
              alert.agent,
              alert.classification,
              alert.reason
            ),
            description: getAlertDescription(alert),
            severity: alert.severity.toUpperCase() as "HIGH" | "MEDIUM" | "LOW",
            icon: getAgentIcon(alert.agent),
            time: formatTimeAgo(alert.created_at),
            ip: alert.ip || undefined,
            recommended_action: alert.recommended_action || undefined,
            agent: alert.agent || undefined,
            created_at: alert.created_at || undefined,
            details: {
              origin: alert.ip ? `${alert.ip} (Origin)` : "Unknown (Origin)",
              rate: alert.requests_per_minute
                ? `${alert.requests_per_minute} req/min`
                : "N/A",
              location: "Unknown",
              tags: alert.classification ? [alert.classification] : [],
              fullDescription:
                alert.reason || "No additional details available.",
            },
          })
        );
        setRelatedAlerts(formattedRelatedAlerts);
      }
    } catch (error) {
      console.error("Error fetching related alerts:", error);
      setRelatedAlerts([]);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedAlert) {
      fetchRelatedAlerts(selectedAlert.id);
    } else {
      setRelatedAlerts([]);
    }
  }, [selectedAlert]);

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime(); // Set initial time
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Calculate incidents summary statistics
  const calculateSummaryStats = () => {
    const total = alerts.length;

    // Severity breakdown
    const highCount = alerts.filter((a) => a.severity === "HIGH").length;
    const mediumCount = alerts.filter((a) => a.severity === "MEDIUM").length;
    const lowCount = alerts.filter((a) => a.severity === "LOW").length;

    // Agent breakdown - use agent field or fallback to icon
    const trafficMonitorCount = alerts.filter(
      (a) => a.agent === "traffic_monitor" || a.icon === Wifi
    ).length;
    const logAnalyzerCount = alerts.filter(
      (a) => a.agent === "log_analyzer" || a.icon === FileText
    ).length;
    const behaviorAnalyzerCount = alerts.filter(
      (a) => a.agent === "behavior_analyzer" || a.icon === User
    ).length;

    // Recent activity (last 24 hours and 7 days)
    // Parse time strings like "2m ago", "1h ago", "3d ago"
    const now = new Date();
    const last24hCount = alerts.filter((alert) => {
      const timeStr = alert.time;
      const match = timeStr.match(/(\d+)([smhd])/);
      if (!match) return false;

      const value = parseInt(match[1]);
      const unit = match[2];

      if (unit === "s") return value < 86400; // seconds in 24h
      if (unit === "m") return value < 1440; // minutes in 24h
      if (unit === "h") return value < 24; // hours
      if (unit === "d") return value < 1; // days
      return false;
    }).length;

    const last7dCount = alerts.filter((alert) => {
      const timeStr = alert.time;
      const match = timeStr.match(/(\d+)([smhd])/);
      if (!match) return true; // If we can't parse, assume it's recent

      const value = parseInt(match[1]);
      const unit = match[2];

      if (unit === "d") return value <= 7; // days
      return true; // If it's hours/minutes/seconds, it's within 7 days
    }).length;

    return {
      total,
      severity: { high: highCount, medium: mediumCount, low: lowCount },
      agents: {
        trafficMonitor: trafficMonitorCount,
        logAnalyzer: logAnalyzerCount,
        behaviorAnalyzer: behaviorAnalyzerCount,
      },
      recent: { last24h: last24hCount, last7d: last7dCount },
    };
  };

  const stats = calculateSummaryStats();

  // Prepare chart data
  const severityChartData = [
    { name: "High", value: stats.severity.high, fill: "#dc2626" },
    { name: "Medium", value: stats.severity.medium, fill: "#d97706" },
    { name: "Low", value: stats.severity.low, fill: "#3b82f6" },
  ].filter((item) => item.value > 0);

  const agentChartData = [
    {
      name: "Traffic Monitor",
      value: stats.agents.trafficMonitor,
      fill: "#3b82f6",
    },
    { name: "Log Analyzer", value: stats.agents.logAnalyzer, fill: "#8b5cf6" },
    {
      name: "Behavior Analyzer",
      value: stats.agents.behaviorAnalyzer,
      fill: "#06b6d4",
    },
  ].filter((item) => item.value > 0);

  const recentActivityData = [
    { name: "Last 24h", value: stats.recent.last24h },
    { name: "Last 7d", value: stats.recent.last7d },
  ];

  const severityChartConfig = {
    high: {
      label: "High",
      color: "#dc2626",
    },
    medium: {
      label: "Medium",
      color: "#d97706",
    },
    low: {
      label: "Low",
      color: "#3b82f6",
    },
  };

  const agentChartConfig = {
    trafficMonitor: {
      label: "Traffic Monitor",
      color: "#3b82f6",
    },
    logAnalyzer: {
      label: "Log Analyzer",
      color: "#8b5cf6",
    },
    behaviorAnalyzer: {
      label: "Behavior Analyzer",
      color: "#06b6d4",
    },
  };

  // Calculate alerts trend over time (grouped by month)
  const calculateAlertsTrend = (): Array<{
    month: string;
    monthKey: string;
    count: number;
    date: Date;
  }> => {
    const now = new Date();
    const months = 12; // Show last 12 months
    const trendData: Array<{
      month: string;
      monthKey: string;
      count: number;
      date: Date;
    }> = [];

    // Initialize all months with 0 alerts
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i, 1);
      monthDate.setHours(0, 0, 0, 0);

      const monthKey = `${monthDate.getFullYear()}-${String(
        monthDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const monthLabel = monthDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      trendData.push({
        month: monthLabel,
        monthKey: monthKey,
        count: 0,
        date: new Date(monthDate),
      });
    }

    // Count alerts per month
    alerts.forEach((alert) => {
      if (!alert.created_at) return;
      const alertDate = new Date(alert.created_at);
      const monthKey = `${alertDate.getFullYear()}-${String(
        alertDate.getMonth() + 1
      ).padStart(2, "0")}`;

      const dataPoint = trendData.find((d) => d.monthKey === monthKey);
      if (dataPoint) {
        dataPoint.count++;
      }
    });

    // Filter out future months and return only months with data or within range
    const currentMonthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    return trendData.filter((d) => {
      // Include if it has data or is within the last 12 months
      return d.count > 0 || d.monthKey <= currentMonthKey;
    });
  };

  const alertsTrendData = calculateAlertsTrend();

  // Calculate top 3 suspicious IPs from alerts
  const calculateTopSuspiciousIPs = (): Array<{
    ip: string;
    count: number;
    severity: "HIGH" | "MEDIUM" | "LOW";
  }> => {
    const ipCounts = new Map<string, { count: number; severities: string[] }>();

    // Count alerts per IP and collect severities
    alerts.forEach((alert) => {
      if (!alert.ip) return;

      const existing = ipCounts.get(alert.ip);
      if (existing) {
        existing.count++;
        existing.severities.push(alert.severity);
      } else {
        ipCounts.set(alert.ip, {
          count: 1,
          severities: [alert.severity],
        });
      }
    });

    // Convert to array and determine severity based on highest severity alert
    const ipArray = Array.from(ipCounts.entries()).map(([ip, data]) => {
      // Determine severity: if any HIGH, it's HIGH; else if any MEDIUM, it's MEDIUM; else LOW
      let severity: "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (data.severities.includes("HIGH")) {
        severity = "HIGH";
      } else if (data.severities.includes("MEDIUM")) {
        severity = "MEDIUM";
      }

      return {
        ip,
        count: data.count,
        severity,
      };
    });

    // Sort by count (descending) and take top 3
    return ipArray.sort((a, b) => b.count - a.count).slice(0, 3);
  };

  const topSuspiciousIPs = calculateTopSuspiciousIPs();

  // Filter alerts based on selected agent
  const filteredAlerts = filterAgent
    ? alerts.filter((alert) => alert.agent === filterAgent)
    : alerts;

  // Calculate counts for each filter
  const networkAlertsCount = alerts.filter(
    (a) => a.agent === "traffic_monitor" || a.icon === Wifi
  ).length;
  const logAlertsCount = alerts.filter(
    (a) => a.agent === "log_analyzer" || a.icon === FileText
  ).length;
  const userAlertsCount = alerts.filter(
    (a) => a.agent === "behavior_analyzer" || a.icon === User
  ).length;

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-[#0a0b14]" : "bg-gray-100"
      } animate-fadeIn`}
    >
      {/* Header */}
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
              Real-Time Security Alerts Dashboard
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
                {alerts.length}
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
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator
                  className={isDarkMode ? "bg-[#2a2d4a]" : "bg-gray-200"}
                />
                <DropdownMenuItem
                  onClick={() => router.push("/about")}
                  className={`cursor-pointer ${
                    isDarkMode
                      ? "hover:bg-[#2a2d4a] focus:bg-[#2a2d4a]"
                      : "hover:bg-gray-100"
                  } transition-fast`}
                >
                  <Info className="mr-2 h-4 w-4" />
                  <span>About</span>
                </DropdownMenuItem>
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

      <div className="flex">
        {/* Left Sidebar - Alert List */}
        <div
          className={`flex-1 min-w-0 ${
            isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"
          } border-r ${
            isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"
          } p-6 animate-slideInLeft animate-delay-100`}
        >
          {/* Section Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h2
                className={`text-2xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Real-Time Security Alerts
              </h2>
              <Clock
                className={`h-5 w-5 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                } animate-pulse-slow`}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3">
              <Button
                variant={filterAgent === null ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilterAgent(null)}
                className={`${
                  filterAgent === null
                    ? isDarkMode
                      ? "bg-[#2a2d4a] text-gray-300"
                      : "bg-gray-200 text-gray-700"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-[#1a1b2e]"
                    : "text-gray-600 hover:bg-gray-200"
                } transition-smooth hover-lift`}
              >
                <Shield className="h-4 w-4 mr-2" />
                All Alerts
                <Badge
                  className={`ml-2 ${
                    filterAgent === null
                      ? "bg-[#3a3d5a] text-gray-300"
                      : isDarkMode
                      ? "bg-[#2a2d4a] text-gray-400"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {alerts.length}
                </Badge>
              </Button>
              <Button
                variant={
                  filterAgent === "traffic_monitor" ? "secondary" : "ghost"
                }
                size="sm"
                onClick={() => setFilterAgent("traffic_monitor")}
                className={`${
                  filterAgent === "traffic_monitor"
                    ? isDarkMode
                      ? "bg-[#2a2d4a] text-gray-300"
                      : "bg-gray-200 text-gray-700"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-[#1a1b2e]"
                    : "text-gray-600 hover:bg-gray-200"
                } transition-smooth hover-lift`}
              >
                <Wifi className="h-4 w-4 mr-2" />
                Network
                <Badge
                  variant="secondary"
                  className={`ml-2 ${
                    filterAgent === "traffic_monitor"
                      ? isDarkMode
                        ? "bg-[#3a3d5a] text-gray-300"
                        : "bg-gray-300 text-gray-700"
                      : ""
                  }`}
                >
                  {networkAlertsCount}
                </Badge>
              </Button>
              <Button
                variant={filterAgent === "log_analyzer" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilterAgent("log_analyzer")}
                className={`${
                  filterAgent === "log_analyzer"
                    ? isDarkMode
                      ? "bg-[#2a2d4a] text-gray-300"
                      : "bg-gray-200 text-gray-700"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-[#1a1b2e]"
                    : "text-gray-600 hover:bg-gray-200"
                } transition-smooth hover-lift`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Logs
                <Badge
                  variant="secondary"
                  className={`ml-2 ${
                    filterAgent === "log_analyzer"
                      ? isDarkMode
                        ? "bg-[#3a3d5a] text-gray-300"
                        : "bg-gray-300 text-gray-700"
                      : ""
                  }`}
                >
                  {logAlertsCount}
                </Badge>
              </Button>
              <Button
                variant={
                  filterAgent === "behavior_analyzer" ? "secondary" : "ghost"
                }
                size="sm"
                onClick={() => setFilterAgent("behavior_analyzer")}
                className={`${
                  filterAgent === "behavior_analyzer"
                    ? isDarkMode
                      ? "bg-[#2a2d4a] text-gray-300"
                      : "bg-gray-200 text-gray-700"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-[#1a1b2e]"
                    : "text-gray-600 hover:bg-gray-200"
                } transition-smooth hover-lift`}
              >
                <User className="h-4 w-4 mr-2" />
                User
                <Badge
                  variant="secondary"
                  className={`ml-2 ${
                    filterAgent === "behavior_analyzer"
                      ? isDarkMode
                        ? "bg-[#3a3d5a] text-gray-300"
                        : "bg-gray-300 text-gray-700"
                      : ""
                  }`}
                >
                  {userAlertsCount}
                </Badge>
              </Button>
            </div>
          </div>

          {/* Live Alerts Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse-slow" />
              <h3 className="text-lg font-semibold text-red-500">
                LIVE ALERTS
              </h3>
              <span
                className={`text-sm ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                ({filteredAlerts.filter((a) => a.severity === "HIGH").length})
              </span>
            </div>

            {/* Alert Cards */}
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert, index) => {
                  const Icon = alert.icon;
                  return (
                    <button
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      className={`w-full rounded-lg p-4 transition-all duration-300 text-left hover-lift animate-fadeInUp cursor-pointer ${
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
                              <h4
                                className={`font-semibold ${
                                  isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {alert.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-500" : "text-gray-400"
                                }`}
                              >
                                {alert.time}
                              </span>
                              <ChevronRight
                                className={`h-5 w-5 ${
                                  isDarkMode ? "text-gray-600" : "text-gray-400"
                                } transition-smooth group-hover:translate-x-1`}
                              />
                            </div>
                          </div>
                          <p
                            className={`text-sm ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            } mb-1`}
                          >
                            {alert.description}
                          </p>
                          {alert.subtitle && (
                            <p
                              className={`text-sm ${
                                isDarkMode ? "text-gray-500" : "text-gray-500"
                              }`}
                            >
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
                  );
                })
              ) : (
                <div
                  className={`flex flex-col items-center justify-center py-12 px-4 rounded-lg ${
                    isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"
                  }`}
                >
                  <AlertTriangle
                    className={`h-12 w-12 mb-4 ${
                      isDarkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-lg font-medium ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    } mb-2`}
                  >
                    No alerts found
                  </p>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {filterAgent === "traffic_monitor"
                      ? "No network alerts available"
                      : filterAgent === "log_analyzer"
                      ? "No log alerts available"
                      : filterAgent === "behavior_analyzer"
                      ? "No user behavior alerts available"
                      : "No alerts available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Statistics */}
        <div className="w-[650px] shrink-0 p-6 space-y-6 animate-slideInRight animate-delay-200">
          {/* Incidents Summary */}
          <div
            className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${
              isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"
            } rounded-lg p-6 hover-lift transition-smooth animate-fadeInUp`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Incidents Summary
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className={`${
                  isDarkMode
                    ? "text-gray-600 hover:bg-[#2a2d4a]"
                    : "text-gray-400 hover:bg-gray-100"
                } transition-smooth hover-lift`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Button>
            </div>

            {/* Total Incidents */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Incidents
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`text-4xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {stats.total}
                </div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  total alerts
                </div>
              </div>
            </div>

            {/* Severity Breakdown - Pie Chart */}
            <div className="mb-6">
              <h4
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } mb-4`}
              >
                By Severity
              </h4>
              {severityChartData.length > 0 ? (
                <ChartContainer
                  config={severityChartConfig}
                  className="h-[200px] w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={severityChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {severityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div
                  className={`h-[200px] flex items-center justify-center rounded-lg ${
                    isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    No severity data available
                  </span>
                </div>
              )}
            </div>

            {/* Agent Breakdown - Pie Chart */}
            <div className="mb-6">
              <h4
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } mb-4`}
              >
                By Agent Type
              </h4>
              {agentChartData.length > 0 ? (
                <ChartContainer
                  config={agentChartConfig}
                  className="h-[200px] w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={agentChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {agentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div
                  className={`h-[200px] flex items-center justify-center rounded-lg ${
                    isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    No agent data available
                  </span>
                </div>
              )}
            </div>

            {/* Recent Activity - Bar Chart */}
            <div>
              <h4
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } mb-4`}
              >
                Recent Activity
              </h4>
              <ChartContainer
                config={{
                  recent: {
                    label: "Incidents",
                    color: isDarkMode ? "#3b82f6" : "#2563eb",
                  },
                }}
                className="h-[150px] w-full"
              >
                <BarChart data={recentActivityData}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: isDarkMode ? "#9ca3af" : "#6b7280",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: isDarkMode ? "#9ca3af" : "#6b7280",
                      fontSize: 12,
                    }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={false}
                  />
                  <Bar
                    dataKey="value"
                    fill={isDarkMode ? "#3b82f6" : "#2563eb"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Alerts Trend */}
          <div
            className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${
              isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"
            } rounded-lg p-6 hover-lift transition-smooth animate-fadeInUp animate-delay-100`}
          >
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              Alerts Trend (Monthly)
            </h3>
            {alertsTrendData.length > 0 ? (
              <ChartContainer
                config={{
                  alerts: {
                    label: "Alerts",
                    color: isDarkMode ? "#3b82f6" : "#2563eb",
                  },
                }}
                className="h-[200px] w-full"
              >
                <AreaChart data={alertsTrendData}>
                  <defs>
                    <linearGradient
                      id="alertsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={isDarkMode ? "#3b82f6" : "#2563eb"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={isDarkMode ? "#3b82f6" : "#2563eb"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#2a2d4a" : "#e5e7eb"}
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: isDarkMode ? "#9ca3af" : "#6b7280",
                      fontSize: 11,
                    }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    label={{
                      value: "Month",
                      position: "insideBottom",
                      offset: -5,
                      fill: isDarkMode ? "#9ca3af" : "#6b7280",
                      fontSize: 11,
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <YAxis
                    dataKey="count"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: isDarkMode ? "#9ca3af" : "#6b7280",
                      fontSize: 11,
                    }}
                    width={40}
                    label={{
                      value: "Number of Alerts",
                      angle: -90,
                      position: "insideLeft",
                      fill: isDarkMode ? "#9ca3af" : "#6b7280",
                      fontSize: 11,
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{
                      stroke: isDarkMode ? "#3b82f6" : "#2563eb",
                      strokeWidth: 1,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
                    strokeWidth={2}
                    fill="url(#alertsGradient)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div
                className={`h-[200px] flex items-center justify-center rounded-lg ${
                  isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"
                }`}
              >
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  No trend data available
                </span>
              </div>
            )}
          </div>

          {/* Top 3 Suspicious IPs */}
          <div
            className={`${isDarkMode ? "bg-[#1a1b2e]" : "bg-white"} border ${
              isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"
            } rounded-lg p-6 hover-lift transition-smooth animate-fadeInUp animate-delay-200`}
          >
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              } mb-4`}
            >
              Top 3 Suspicious IPs
            </h3>
            <div className="space-y-3">
              {topSuspiciousIPs.length > 0 ? (
                topSuspiciousIPs.map((item, index) => (
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
                      <span
                        className={`font-mono text-sm ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.ip}
                      </span>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  className={`p-3 rounded-lg ${
                    isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    No suspicious IPs found
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert!}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        relatedAlerts={relatedAlerts}
      />
    </div>
  );
}
