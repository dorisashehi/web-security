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
import { Badge } from "@/components/ui/badge";
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
    details?: {
      origin: string;
      rate: string;
      location: string;
      tags: string[];
      fullDescription: string;
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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Left side - Info details */}
                  <div
                    className={`${
                      theme === "light"
                        ? "bg-gray-50 border-gray-200"
                        : "bg-[#0f1119]/80 border-[#2a2d4a]/50"
                    } border rounded-lg p-4 transition-smooth hover-lift`}
                  >
                    <ul className="space-y-3">
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
                            {alert.details?.origin?.split(" ")[0] ||
                              alert.ip ||
                              "Unknown"}
                          </span>
                          {alert.details?.origin?.split(" ")[0] || alert.ip ? (
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
                          ) : null}
                        </span>
                      </li>
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
                          {alert.details?.rate &&
                          alert.details.rate !== "N/A" ? (
                            <>
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
                                {alert.details.rate
                                  .split(" ")
                                  .slice(1)
                                  .join(" ")}
                              </span>
                            </>
                          ) : (
                            <span>Unknown</span>
                          )}
                        </span>
                      </li>
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
                            : "Unknown"}
                        </span>
                      </li>
                    </ul>
                    <div className="flex gap-2 mt-4">
                      <Badge
                        className={`${
                          theme === "light"
                            ? "bg-purple-100 text-purple-700 border-purple-300"
                            : "bg-[#3d2d5a] text-purple-300 border-purple-500/30"
                        } transition-smooth hover:scale-105 cursor-pointer`}
                      >
                        Suspicious
                      </Badge>
                      <Badge
                        className={`${
                          theme === "light"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-red-900/50 text-red-300 border-red-500/30"
                        } transition-smooth hover:scale-105 cursor-pointer`}
                      >
                        DDoS Risk
                      </Badge>
                    </div>
                  </div>

                  {/* Right side - Chart */}
                  <div
                    className={`${
                      theme === "light"
                        ? "bg-gray-50 border-gray-200"
                        : "bg-[#0f1119]/80 border-[#2a2d4a]/50"
                    } border rounded-lg p-4 transition-smooth hover-lift`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`text-xs ${
                          theme === "light" ? "text-gray-500" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        RPS
                      </span>
                      <span
                        className={`text-3xl font-bold ${
                          theme === "light" ? "text-gray-900" : "text-white"
                        }`}
                      >
                        350
                      </span>
                    </div>
                    <div className="relative h-32 mb-2">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 400 128"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id={`rpsGradient-${theme}`}
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3b82f6"
                              stopOpacity="0.4"
                            />
                            <stop
                              offset="100%"
                              stopColor="#3b82f6"
                              stopOpacity="0.05"
                            />
                          </linearGradient>
                          {/* Grid lines */}
                          <pattern
                            id={`grid-${theme}`}
                            width="40"
                            height="32"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 40 0 L 0 0 0 32"
                              fill="none"
                              stroke={theme === "light" ? "#d1d5db" : "#2a2d4a"}
                              strokeWidth="0.5"
                              opacity="0.3"
                            />
                          </pattern>
                        </defs>

                        {/* Grid background */}
                        <rect
                          width="400"
                          height="128"
                          fill={`url(#grid-${theme})`}
                        />

                        {/* Horizontal grid lines */}
                        <line
                          x1="0"
                          y1="32"
                          x2="400"
                          y2="32"
                          stroke={theme === "light" ? "#d1d5db" : "#2a2d4a"}
                          strokeWidth="1"
                          opacity="0.3"
                        />
                        <line
                          x1="0"
                          y1="64"
                          x2="400"
                          y2="64"
                          stroke={theme === "light" ? "#d1d5db" : "#2a2d4a"}
                          strokeWidth="1"
                          opacity="0.3"
                        />
                        <line
                          x1="0"
                          y1="96"
                          x2="400"
                          y2="96"
                          stroke={theme === "light" ? "#d1d5db" : "#2a2d4a"}
                          strokeWidth="1"
                          opacity="0.3"
                        />

                        {/* Area fill */}
                        <path
                          d="M 0,100 L 100,95 L 200,85 L 300,40 L 400,15 L 400,128 L 0,128 Z"
                          fill={`url(#rpsGradient-${theme})`}
                        />
                        {/* Line */}
                        <path
                          d="M 0,100 L 100,95 L 200,85 L 300,40 L 400,15"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                        />
                        {/* Endpoint dot */}
                        <circle
                          cx="400"
                          cy="15"
                          r="4"
                          fill="#3b82f6"
                          className="animate-pulse-slow"
                        />
                      </svg>
                    </div>
                    <div
                      className={`flex justify-between text-xs ${
                        theme === "light" ? "text-gray-500" : "text-gray-600"
                      }`}
                    >
                      <span>=1</span>
                      <span>-1 min</span>
                      <span>-0.5 min</span>
                      <span>=0</span>
                    </div>
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
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      {alert.recommended_action}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 animate-fadeIn animate-delay-400">
                <Button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white transition-smooth hover-lift">
                  <Search className="h-4 w-4 mr-2" />
                  Investigate
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 ${
                    theme === "light"
                      ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "bg-transparent border-[#3a3d5a] text-gray-300 hover:bg-[#2a2d4a]"
                  } transition-smooth hover-lift`}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
                <Button className="flex-1 bg-red-700 hover:bg-red-800 text-white transition-smooth hover-lift hover-glow">
                  <Shield className="h-4 w-4 mr-2" />
                  Block IP Address
                </Button>
              </div>
            </div>

            {/* Right Column - Suggested Actions & Activity Log */}
            <div className="space-y-6">
              {/* Suggested Action */}
              <div
                className={`${
                  theme === "light"
                    ? "bg-gray-50 border-gray-200"
                    : "bg-[#1e2139] border-[#2a2d4a]/50"
                } border rounded-lg p-5 animate-slideInRight transition-smooth hover-lift`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`p-1 rounded ${
                      theme === "light" ? "bg-yellow-100" : "bg-yellow-600/20"
                    }`}
                  >
                    <Shield className="h-5 w-5 text-yellow-500" />
                  </div>
                  <h4
                    className={`font-semibold ${
                      theme === "light" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    Suggested Action
                  </h4>
                </div>
                {alert.recommended_action ? (
                  <div
                    className={`${
                      theme === "light"
                        ? "bg-gray-50 border-gray-200"
                        : "bg-[#0f1119]/80 border-[#2a2d4a]/50"
                    } border rounded-lg p-4`}
                  >
                    <p
                      className={`text-sm ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      {alert.recommended_action}
                    </p>
                  </div>
                ) : (
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    No recommended action available
                  </p>
                )}
              </div>

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
                <div className="space-y-4">
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
