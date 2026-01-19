"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  Wifi,
  FileText,
  User,
  AlertTriangle,
} from "lucide-react";
import { AlertDetailModal } from "@/components/alert-detail-modal";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { DashboardHeader } from "./dashboard-header";
import { AlertFilters } from "./alert-filters";
import { AlertList } from "./alert-list";
import { IncidentsSummary } from "./incidents-summary";
import { AlertsTrend } from "./alerts-trend";
import { TopSuspiciousIPs } from "./top-suspicious-ips";
import { getAdminToken, removeAdminToken } from "@/lib/auth";

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
  // Agent 1 specific fields
  user_agent?: string;
  geo?: string;
  detection_timestamp?: string;
  requests_per_minute?: number;
  // Agent 2 specific fields
  log_entry?: string;
  log_type?: string;
  username?: string;
  log_timestamp?: string;
  alert_pattern?: string;
  // Agent 3 specific fields
  user_id?: string;
  action?: string;
  behavior_location?: string;
  clicks_per_minute?: string;
  is_sensitive_route?: boolean;
  is_bot_like?: boolean;
  is_odd_hour?: boolean;
  impossible_travel?: boolean;
  deviates_from_baseline?: boolean;
  behavior_timestamp?: string;
  details?: {
    origin: string;
    rate: string;
    location: string;
    tags: string[];
    fullDescription: string;
    requestPattern?: string;
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
      const token = getAdminToken();
      if (!token) {
        // No token found, redirect to login
        removeAdminToken();
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/alerts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if token expired (401)
      if (response.status === 401) {
        removeAdminToken();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.alerts) {
        // Get request pattern description based on requests_per_minute
        const getRequestPattern = (rpm: number | null | undefined): string => {
          if (!rpm) return "No pattern data";
          if (rpm < 10) return "Low traffic - Normal pattern";
          if (rpm < 50) return "Moderate traffic - Normal pattern";
          if (rpm < 100) return "High traffic - Potential spike";
          if (rpm < 300) return "Very high traffic - Suspicious spike";
          return "Extreme traffic - Possible attack pattern";
        };

        // Generate alert pattern for Agent 2
        const getAlertPattern = (
          failedLoginCount: number | null | undefined
        ): string => {
          if (!failedLoginCount || failedLoginCount === 0) {
            return "No failed login pattern detected";
          } else if (failedLoginCount === 1) {
            return "1 failed attempt detected";
          } else if (failedLoginCount === 2) {
            return "2 failed attempts in 2 minutes";
          } else if (failedLoginCount >= 3) {
            return `${failedLoginCount} failed attempts in 2 minutes`;
          } else {
            return "Multiple failed login attempts detected";
          }
        };

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
          // Agent 1 specific fields
          user_agent: alert.user_agent || undefined,
          geo: alert.geo || undefined,
          detection_timestamp: alert.detection_timestamp || undefined,
          requests_per_minute: alert.requests_per_minute || undefined,
          // Agent 2 specific fields
          log_entry: alert.log_entry || undefined,
          log_type: alert.log_type || undefined,
          username: alert.username || undefined,
          log_timestamp: alert.log_timestamp || undefined,
          alert_pattern: getAlertPattern(alert.failed_login_count),
          // Agent 3 specific fields
          user_id: alert.user_id || undefined,
          action: alert.action || undefined,
          behavior_location: alert.behavior_location || undefined,
          clicks_per_minute: alert.clicks_per_minute || undefined,
          is_sensitive_route: alert.is_sensitive_route || undefined,
          is_bot_like: alert.is_bot_like || undefined,
          is_odd_hour: alert.is_odd_hour || undefined,
          impossible_travel: alert.impossible_travel || undefined,
          deviates_from_baseline: alert.deviates_from_baseline || undefined,
          behavior_timestamp: alert.behavior_timestamp || undefined,
          details: {
            origin: alert.ip ? `${alert.ip} (Origin)` : "Unknown (Origin)",
            rate: alert.requests_per_minute
              ? `${alert.requests_per_minute} req/min`
              : "N/A",
            location: alert.geo || "Unknown",
            tags: alert.classification ? [alert.classification] : [],
            fullDescription: alert.reason || "No additional details available.",
            // Agent 1 additional info
            requestPattern: getRequestPattern(alert.requests_per_minute),
          },
        }));
        setAlerts(formattedAlerts);
      }
    } catch (error: any) {
      // Check if it's a token expiration error
      if (
        error?.status === 401 ||
        (error instanceof Error &&
          (error.message.includes("expired") ||
            error.message.includes("Invalid or expired token") ||
            error.message.includes("401")))
      ) {
        removeAdminToken();
        router.push("/login");
        return;
      }
      console.error("Error fetching alerts:", error);
    }
  };

  const fetchRelatedAlerts = async (alertId: number) => {
    try {
      const token = getAdminToken();
      if (!token) {
        removeAdminToken();
        router.push("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/alerts/${alertId}/related`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if token expired (401)
      if (response.status === 401) {
        removeAdminToken();
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch related alerts: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.related_alerts) {
        console.log("dataaa", data)
        // Get request pattern description based on requests_per_minute
        const getRequestPattern = (rpm: number | null | undefined): string => {
          if (!rpm) return "No pattern data";
          if (rpm < 10) return "Low traffic - Normal pattern";
          if (rpm < 50) return "Moderate traffic - Normal pattern";
          if (rpm < 100) return "High traffic - Potential spike";
          if (rpm < 300) return "Very high traffic - Suspicious spike";
          return "Extreme traffic - Possible attack pattern";
        };

        // Generate alert pattern for Agent 2
        const getAlertPattern = (
          failedLoginCount: number | null | undefined
        ): string => {
          if (!failedLoginCount || failedLoginCount === 0) {
            return "No failed login pattern detected";
          } else if (failedLoginCount === 1) {
            return "1 failed attempt detected";
          } else if (failedLoginCount === 2) {
            return "2 failed attempts in 2 minutes";
          } else if (failedLoginCount >= 3) {
            return `${failedLoginCount} failed attempts in 2 minutes`;
          } else {
            return "Multiple failed login attempts detected";
          }
        };

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
            // Agent 1 specific fields
            user_agent: alert.user_agent || undefined,
            geo: alert.geo || undefined,
            detection_timestamp: alert.detection_timestamp || undefined,
            requests_per_minute: alert.requests_per_minute || undefined,
            // Agent 2 specific fields
            log_entry: alert.log_entry || undefined,
            log_type: alert.log_type || undefined,
            username: alert.username || undefined,
            log_timestamp: alert.log_timestamp || undefined,
            alert_pattern: getAlertPattern(alert.failed_login_count),
            // Agent 3 specific fields
            user_id: alert.user_id || undefined,
            action: alert.action || undefined,
            behavior_location: alert.behavior_location || undefined,
            clicks_per_minute: alert.clicks_per_minute || undefined,
            is_sensitive_route: alert.is_sensitive_route || undefined,
            is_bot_like: alert.is_bot_like || undefined,
            is_odd_hour: alert.is_odd_hour || undefined,
            impossible_travel: alert.impossible_travel || undefined,
            deviates_from_baseline: alert.deviates_from_baseline || undefined,
            behavior_timestamp: alert.behavior_timestamp || undefined,
            details: {
              origin: alert.ip ? `${alert.ip} (Origin)` : "Unknown (Origin)",
              rate: alert.requests_per_minute
                ? `${alert.requests_per_minute} req/min`
                : "N/A",
              location: alert.geo || "Unknown",
              tags: alert.classification ? [alert.classification] : [],
              fullDescription:
                alert.reason || "No additional details available.",
              // Agent 1 additional info
              requestPattern: getRequestPattern(alert.requests_per_minute),
            },
          })
        );
        setRelatedAlerts(formattedRelatedAlerts);
      }
    } catch (error: any) {
      // Check if it's a token expiration error
      if (
        error?.status === 401 ||
        (error instanceof Error &&
          (error.message.includes("expired") ||
            error.message.includes("Invalid or expired token") ||
            error.message.includes("401")))
      ) {
        removeAdminToken();
        router.push("/login");
        return;
      }
      console.error("Error fetching related alerts:", error);
      setRelatedAlerts([]);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <DashboardHeader alertsCount={alerts.length} currentTime={currentTime} />

      <div className="flex">
        {/* Left Sidebar - Alert List */}
        <AlertList
          alerts={filteredAlerts}
          isDarkMode={isDarkMode}
          onAlertClick={setSelectedAlert}
          filterAgent={filterAgent}
          onFilterChange={setFilterAgent}
          alertsCount={alerts.length}
          networkAlertsCount={networkAlertsCount}
          logAlertsCount={logAlertsCount}
          userAlertsCount={userAlertsCount}
        />

        {/* Right Sidebar - Statistics */}
        <div className="w-[650px] shrink-0 p-6 space-y-6 animate-slideInRight animate-delay-200">
          <IncidentsSummary isDarkMode={isDarkMode} stats={stats} />
          <AlertsTrend isDarkMode={isDarkMode} trendData={alertsTrendData} />
          <TopSuspiciousIPs
            isDarkMode={isDarkMode}
            suspiciousIPs={topSuspiciousIPs}
          />
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
