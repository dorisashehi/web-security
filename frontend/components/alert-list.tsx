"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { AlertCard } from "./alert-card";
import { AlertFilters } from "./alert-filters";

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  icon: any;
  time: string;
  subtitle?: string;
}

interface AlertListProps {
  alerts: Alert[];
  isDarkMode: boolean;
  onAlertClick: (alert: Alert) => void;
  filterAgent: string | null;
  onFilterChange: (agent: string | null) => void;
  alertsCount: number;
  networkAlertsCount: number;
  logAlertsCount: number;
  userAlertsCount: number;
}

export function AlertList({
  alerts,
  isDarkMode,
  onAlertClick,
  filterAgent,
  onFilterChange,
  alertsCount,
  networkAlertsCount,
  logAlertsCount,
  userAlertsCount,
}: AlertListProps) {
  const highSeverityCount = alerts.filter((a) => a.severity === "HIGH").length;

  return (
    <div
      className={`flex-1 min-w-0 ${
        isDarkMode ? "bg-[#0f1119]" : "bg-gray-50"
      } border-r ${
        isDarkMode ? "border-[#2a2d4a]" : "border-gray-200"
      } animate-slideInLeft animate-delay-100`}
    >
      <div className="p-6">
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
          <AlertFilters
            filterAgent={filterAgent}
            onFilterChange={onFilterChange}
            isDarkMode={isDarkMode}
            alertsCount={alertsCount}
            networkAlertsCount={networkAlertsCount}
            logAlertsCount={logAlertsCount}
            userAlertsCount={userAlertsCount}
          />
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
              ({highSeverityCount})
            </span>
          </div>

          {/* Alert Cards */}
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  index={index}
                  isDarkMode={isDarkMode}
                  onClick={() => onAlertClick(alert)}
                />
              ))
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
                  No alerts available for the selected filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

