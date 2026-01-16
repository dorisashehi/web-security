"use client";

import { AlertTriangle, ChevronRight, Wifi } from "lucide-react";

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  icon: typeof Wifi;
  time: string;
  subtitle?: string;
}

interface AlertCardProps {
  alert: Alert;
  index: number;
  isDarkMode: boolean;
  onClick: () => void;
}

export function AlertCard({
  alert,
  index,
  isDarkMode,
  onClick,
}: AlertCardProps) {
  const Icon = alert.icon;

  return (
    <button
      key={alert.id}
      onClick={onClick}
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
}

