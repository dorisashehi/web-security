"use client";

import {
  X,
  AlertTriangle,
  Info,
  ChevronDown,
  Search,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface RelatedAlert {
  id: number;
  title: string;
  description: string;
  severity: string;
  icon: any;
  time: string;
  ip?: string;
  route?: string;
  details?: {
    rate: string;
  };
}

interface AlertDetailModalProps {
  alert: {
    id: number;
    title: string;
    description: string;
    severity: string;
    icon: any;
    time: string;
    ip?: string;
    recommended_action?: string;
    agent?: string;
    user_agent?: string;
    geo?: string;
    detection_timestamp?: string;
    requests_per_minute?: number;
    log_entry?: string;
    log_type?: string;
    username?: string;
    log_timestamp?: string;
    alert_pattern?: string;
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
  };
  isOpen: boolean;
  onClose: () => void;
  relatedAlerts?: RelatedAlert[];
}

export function AlertDetailModal({
  alert,
  isOpen,
  onClose,
  relatedAlerts = [],
}: AlertDetailModalProps) {
  const { theme } = useTheme();

  if (!isOpen || !alert) return null;

  const Icon = alert.icon;

  const getSeverityGradient = (severity: string) => {
    if (theme === "light") {
      if (severity === "HIGH") {
        return "bg-gradient-to-r from-red-100 via-pink-100 to-purple-100";
      } else if (severity === "MEDIUM") {
        return "bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100";
      } else {
        return "bg-gradient-to-r from-blue-100 via-indigo-100 to-cyan-100";
      }
    } else {
      if (severity === "HIGH") {
        return "bg-gradient-to-r from-red-950/90 via-red-900/80 to-purple-950/90";
      } else if (severity === "MEDIUM") {
        return "bg-gradient-to-r from-amber-950/80 via-amber-900/70 to-blue-950/80";
      } else {
        return "bg-gradient-to-r from-blue-950/70 via-blue-900/60 to-indigo-950/70";
      }
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 ${
        theme === "light" ? "bg-black/40" : "bg-black/70"
      } backdrop-blur-md overflow-y-auto animate-fadeIn`}
    >
      <div
        className={`${
          theme === "light"
            ? "bg-white border-gray-200"
            : "bg-[#1a1b2e] border-[#2a2d4a]/50"
        } border rounded-lg w-full max-w-6xl my-8 shadow-2xl animate-scaleIn`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 ${
            theme === "light" ? "border-gray-200" : "border-[#2a2d4a]/50"
          } border-b`}
        >
          <div className="flex items-center gap-3">
            <ChevronDown
              className={`h-5 w-5 ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              } rotate-180`}
            />
            <h2
              className={`text-lg font-semibold ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Expand Alert View
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={`${
              theme === "light"
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-400 hover:bg-[#2a2d4a]/50"
            } transition-smooth hover-lift`}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Alert Header with gradient background */}
          <div
            className={`${getSeverityGradient(alert.severity)} ${
              theme === "light" ? "border-gray-300" : "border-red-900/30"
            } border rounded-lg p-6 mb-6 animate-fadeInUp transition-smooth`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="relative">
                  <div
                    className={`p-4 rounded-lg ${
                      theme === "light"
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : "bg-gradient-to-br from-red-600/80 to-red-700/80"
                    } border ${
                      theme === "light"
                        ? "border-red-400/50"
                        : "border-red-500/30"
                    } backdrop-blur-sm transition-smooth hover:scale-105`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 px-2 py-0.5 rounded bg-red-600 text-white text-xs font-bold">
                    {alert.severity}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse-slow" />
                    <h3
                      className={`text-xl font-bold ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      {alert.title}
                    </h3>
                  </div>
                  <p
                    className={
                      theme === "light" ? "text-gray-700" : "text-gray-300"
                    }
                  >
                    {alert.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {alert.time}
                </span>
                <button
                  className={`${
                    theme === "light"
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="col-span-2 space-y-6">
              {/* Warning Message */}
              <div
                className={`${
                  theme === "light"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-[#1a1b2e]/80 border-red-900/20"
                } border rounded-lg p-4 flex gap-3 animate-fadeIn transition-smooth`}
              >
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p
                  className={`text-sm whitespace-pre-wrap break-words ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  {alert.details?.fullDescription ||
                    alert.description ||
                    "No additional details available."}
                </p>
              </div>

              {/* Information Section */}
              <div className="animate-fadeIn animate-delay-100">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`p-1.5 rounded-full ${
                      theme === "light" ? "bg-blue-100" : "bg-blue-600/20"
                    }`}
                  >
                    <Info className="h-4 w-4 text-blue-400" />
                  </div>
                  <h4
                    className={`font-semibold ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    Information
                  </h4>
                </div>

                {/* Information Grid */}
                <div className="mb-4">
                  {/* Info details */}
                  <div
                    className={`${
                      theme === "light"
                        ? "bg-gray-50 border-gray-200"
                        : "bg-[#0f1119]/80 border-[#2a2d4a]/50"
                    } border rounded-lg p-4 transition-smooth hover-lift`}
                  >
                    <ul className="space-y-3">
                      {(alert.details?.origin?.split(" ")[0] || alert.ip) && (
                        <li className="flex items-center gap-2 animate-fadeIn">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              theme === "light" ? "bg-gray-400" : "bg-gray-500"
                            }`}
                          ></span>
                          <span
                            className={`text-sm ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            }`}
                          >
                            <span className="font-medium">IP: </span>
                            <span className="font-mono font-semibold">
                              {alert.details?.origin?.split(" ")[0] || alert.ip}
                            </span>
                            <span
                              className={
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-500"
                              }
                            >
                              {" "}
                              {alert.details?.origin
                                ?.split(" ")
                                .slice(1)
                                .join(" ") || "(Origin)"}
                            </span>
                          </span>
                        </li>
                      )}
                      {alert.details?.rate && alert.details.rate !== "N/A" && (
                        <li className="flex items-center gap-2 animate-fadeIn animate-delay-100">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              theme === "light" ? "bg-gray-400" : "bg-gray-500"
                            }`}
                          ></span>
                          <span
                            className={`text-sm ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            }`}
                          >
                            <span className="font-medium">Rate: </span>
                            <span className="font-semibold">
                              {alert.details.rate.split(" ")[0]}
                            </span>{" "}
                            <span
                              className={
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-500"
                              }
                            >
                              {alert.details.rate.split(" ").slice(1).join(" ")}
                            </span>
                          </span>
                        </li>
                      )}
                      {(alert.details?.location &&
                        alert.details.location !== "Unknown") ||
                      (alert.geo && alert.geo !== "Unknown") ? (
                        <li className="flex items-center gap-2 animate-fadeIn animate-delay-200">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              theme === "light" ? "bg-gray-400" : "bg-gray-500"
                            }`}
                          ></span>
                          <span
                            className={`text-sm ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-300"
                            }`}
                          >
                            <span className="font-medium">Location: </span>
                            {alert.details?.location &&
                            alert.details.location !== "Unknown"
                              ? alert.details.location
                              : alert.geo}
                          </span>
                        </li>
                      ) : null}
                      {/* Agent 1 specific fields */}
                      {alert.agent === "traffic_monitor" && (
                        <>
                          {alert.user_agent && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-300">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">
                                  User Agent:{" "}
                                </span>
                                <span className="font-mono text-xs">
                                  {alert.user_agent}
                                </span>
                              </span>
                            </li>
                          )}
                          {alert.detection_timestamp && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-400">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">
                                  Detection Time:{" "}
                                </span>
                                {new Date(
                                  alert.detection_timestamp
                                ).toLocaleString()}
                              </span>
                            </li>
                          )}
                          {alert.details?.requestPattern &&
                            alert.details.requestPattern !==
                              "No pattern data" && (
                              <li className="flex items-center gap-2 animate-fadeIn animate-delay-500">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    theme === "light"
                                      ? "bg-gray-400"
                                      : "bg-gray-500"
                                  }`}
                                ></span>
                                <span
                                  className={`text-sm ${
                                    theme === "light"
                                      ? "text-gray-700"
                                      : "text-gray-300"
                                  }`}
                                >
                                  <span className="font-medium">
                                    Request Pattern:{" "}
                                  </span>
                                  {alert.details.requestPattern}
                                </span>
                              </li>
                            )}
                        </>
                      )}
                      {/* Agent 2 specific fields */}
                      {alert.agent === "log_analyzer" && (
                        <>
                          {alert.log_entry && (
                            <li className="flex items-start gap-2 animate-fadeIn animate-delay-300">
                              <span
                                className={`w-1.5 h-1.5 rounded-full mt-2 ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">Log Entry: </span>
                                <span className="font-mono text-xs break-words">
                                  {alert.log_entry}
                                </span>
                              </span>
                            </li>
                          )}
                          {alert.log_type && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-400">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">Log Type: </span>
                                {alert.log_type.charAt(0).toUpperCase() +
                                  alert.log_type.slice(1)}
                              </span>
                            </li>
                          )}
                          {alert.username && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-500">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">Username: </span>
                                {alert.username}
                              </span>
                            </li>
                          )}
                          {alert.log_timestamp && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-600">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">Timestamp: </span>
                                {new Date(alert.log_timestamp).toLocaleString()}
                              </span>
                            </li>
                          )}
                          {alert.alert_pattern &&
                            alert.alert_pattern !==
                              "No failed login pattern detected" && (
                              <li className="flex items-center gap-2 animate-fadeIn animate-delay-700">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    theme === "light"
                                      ? "bg-gray-400"
                                      : "bg-gray-500"
                                  }`}
                                ></span>
                                <span
                                  className={`text-sm ${
                                    theme === "light"
                                      ? "text-gray-700"
                                      : "text-gray-300"
                                  }`}
                                >
                                  <span className="font-medium">
                                    Alert Pattern:{" "}
                                  </span>
                                  {alert.alert_pattern}
                                </span>
                              </li>
                            )}
                        </>
                      )}
                      {/* Agent 3 specific fields */}
                      {alert.agent === "behavior_analyzer" && (
                        <>
                          {alert.user_id && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-300">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">User ID: </span>
                                {alert.user_id}
                              </span>
                            </li>
                          )}
                          {alert.action && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-400">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">Action: </span>
                                {alert.action.charAt(0).toUpperCase() +
                                  alert.action.slice(1)}
                              </span>
                            </li>
                          )}
                          {alert.behavior_location &&
                            alert.behavior_location !== "Unknown" && (
                              <li className="flex items-center gap-2 animate-fadeIn animate-delay-500">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    theme === "light"
                                      ? "bg-gray-400"
                                      : "bg-gray-500"
                                  }`}
                                ></span>
                                <span
                                  className={`text-sm ${
                                    theme === "light"
                                      ? "text-gray-700"
                                      : "text-gray-300"
                                  }`}
                                >
                                  <span className="font-medium">
                                    Location:{" "}
                                  </span>
                                  {alert.behavior_location}
                                </span>
                              </li>
                            )}
                          {alert.clicks_per_minute && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-600">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">
                                  Clicks Per Minute:{" "}
                                </span>
                                {alert.clicks_per_minute}
                              </span>
                            </li>
                          )}
                          {alert.behavior_timestamp && (
                            <li className="flex items-center gap-2 animate-fadeIn animate-delay-700">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  theme === "light"
                                    ? "bg-gray-400"
                                    : "bg-gray-500"
                                }`}
                              ></span>
                              <span
                                className={`text-sm ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                <span className="font-medium">Timestamp: </span>
                                {new Date(
                                  alert.behavior_timestamp
                                ).toLocaleString()}
                              </span>
                            </li>
                          )}
                          {/* Behavior Flags */}
                          {(alert.is_sensitive_route ||
                            alert.is_bot_like ||
                            alert.is_odd_hour ||
                            alert.impossible_travel ||
                            alert.deviates_from_baseline) && (
                            <li className="flex flex-col gap-2 animate-fadeIn animate-delay-800">
                              <span
                                className={`text-sm font-medium ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-300"
                                }`}
                              >
                                Behavior Flags:
                              </span>
                              <div className="flex flex-wrap gap-2 ml-7">
                                {alert.is_sensitive_route && (
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      theme === "light"
                                        ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                        : "bg-yellow-900/30 text-yellow-300 border border-yellow-500/30"
                                    }`}
                                  >
                                    Sensitive Route
                                  </span>
                                )}
                                {alert.is_bot_like && (
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      theme === "light"
                                        ? "bg-red-100 text-red-700 border border-red-300"
                                        : "bg-red-900/30 text-red-300 border border-red-500/30"
                                    }`}
                                  >
                                    Bot-Like
                                  </span>
                                )}
                                {alert.is_odd_hour && (
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      theme === "light"
                                        ? "bg-orange-100 text-orange-700 border border-orange-300"
                                        : "bg-orange-900/30 text-orange-300 border border-orange-500/30"
                                    }`}
                                  >
                                    Odd Hour
                                  </span>
                                )}
                                {alert.impossible_travel && (
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      theme === "light"
                                        ? "bg-purple-100 text-purple-700 border border-purple-300"
                                        : "bg-purple-900/30 text-purple-300 border border-purple-500/30"
                                    }`}
                                  >
                                    Impossible Travel
                                  </span>
                                )}
                                {alert.deviates_from_baseline && (
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      theme === "light"
                                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                                        : "bg-blue-900/30 text-blue-300 border border-blue-500/30"
                                    }`}
                                  >
                                    Baseline Deviation
                                  </span>
                                )}
                              </div>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommended Action */}
              {alert.recommended_action && (
                <div className="animate-fadeIn animate-delay-300">
                  <div className="flex items-center gap-2 mb-3">
                    <svg
                      className={`h-5 w-5 ${
                        theme === "light" ? "text-gray-600" : "text-gray-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h4
                      className={`font-semibold ${
                        theme === "light" ? "text-gray-900" : "text-white"
                      }`}
                    >
                      Recommended{" "}
                      <span
                        className={
                          theme === "light" ? "text-gray-600" : "text-gray-500"
                        }
                      >
                        Action
                      </span>
                    </h4>
                  </div>
                  <div
                    className={`${
                      theme === "light"
                        ? "bg-gray-50 border-gray-200"
                        : "bg-[#0f1119]/80 border-[#2a2d4a]/50"
                    } border rounded-lg p-4 ml-7`}
                  >

                    <pre className={`text-sm whitespace-pre-wrap ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}>
                      {alert.recommended_action}
                    </pre>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column - Suggested Actions & Activity Log */}
            <div className="space-y-6">

              {/* Activity Log */}
              <div
                className={`${
                  theme === "light"
                    ? "bg-gray-50 border-gray-200"
                    : "bg-[#1e2139] border-[#2a2d4a]/50"
                } border rounded-lg p-5 animate-slideInRight animate-delay-100 transition-smooth hover-lift`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className={`font-semibold ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    Related Activity
                  </h4>
                  <ChevronDown
                    className={`h-4 w-4 ${
                      theme === "light" ? "text-gray-600" : "text-gray-500"
                    }`}
                  />
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {relatedAlerts.length > 0 ? (
                    relatedAlerts.map(
                      (relatedAlert: RelatedAlert, index: number) => (
                        <div key={relatedAlert.id}>
                          {index > 0 && (
                            <div
                              className={`h-px ${
                                theme === "light"
                                  ? "bg-gray-200"
                                  : "bg-[#2a2d4a]/50"
                              } mb-4`}
                            ></div>
                          )}
                          <div
                            className="animate-fadeIn"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div
                              className={`text-xs ${
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-500"
                              } mb-1`}
                            >
                              {relatedAlert.time}
                            </div>
                            <div
                              className={`text-sm ${
                                theme === "light"
                                  ? "text-gray-900"
                                  : "text-gray-300"
                              } font-medium mb-1`}
                            >
                              {relatedAlert.title}
                            </div>
                            <div
                              className={`text-sm ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {relatedAlert.ip ? (
                                <>
                                  Activity from IP{" "}
                                  <span
                                    className={`font-mono font-semibold ${
                                      theme === "light"
                                        ? "text-gray-900"
                                        : "text-gray-300"
                                    }`}
                                  >
                                    {relatedAlert.ip}
                                  </span>
                                  {relatedAlert.details?.rate &&
                                    relatedAlert.details.rate !== "N/A" && (
                                      <>
                                        {" "}
                                        at{" "}
                                        <span
                                          className={`font-semibold ${
                                            theme === "light"
                                              ? "text-gray-900"
                                              : "text-gray-300"
                                          }`}
                                        >
                                          {relatedAlert.details.rate}
                                        </span>
                                      </>
                                    )}
                                </>
                              ) : (
                                relatedAlert.description
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div
                      className={`text-sm ${
                        theme === "light" ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      No related activity found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
