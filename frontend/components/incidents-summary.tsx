"use client";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";

interface IncidentsSummaryProps {
  isDarkMode: boolean;
  stats: {
    total: number;
    severity: { high: number; medium: number; low: number };
    agents: {
      trafficMonitor: number;
      logAnalyzer: number;
      behaviorAnalyzer: number;
    };
    recent: { last24h: number; last7d: number };
  };
}

export function IncidentsSummary({ isDarkMode, stats }: IncidentsSummaryProps) {
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
    high: { label: "High", color: "#dc2626" },
    medium: { label: "Medium", color: "#d97706" },
    low: { label: "Low", color: "#3b82f6" },
  };

  const agentChartConfig = {
    trafficMonitor: { label: "Traffic Monitor", color: "#3b82f6" },
    logAnalyzer: { label: "Log Analyzer", color: "#8b5cf6" },
    behaviorAnalyzer: { label: "Behavior Analyzer", color: "#06b6d4" },
  };

  return (
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
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <Bar
              dataKey="value"
              fill={isDarkMode ? "#3b82f6" : "#2563eb"}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
