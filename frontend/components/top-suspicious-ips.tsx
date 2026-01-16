"use client";

import { Shield } from "lucide-react";

interface SuspiciousIP {
  ip: string;
  count: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

interface TopSuspiciousIPsProps {
  isDarkMode: boolean;
  suspiciousIPs: SuspiciousIP[];
}

export function TopSuspiciousIPs({
  isDarkMode,
  suspiciousIPs,
}: TopSuspiciousIPsProps) {
  return (
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
        {suspiciousIPs.length > 0 ? (
          suspiciousIPs.map((item, index) => (
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
  );
}

