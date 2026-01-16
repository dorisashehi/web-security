"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

interface AlertsTrendProps {
  isDarkMode: boolean;
  trendData: Array<{
    month: string;
    monthKey: string;
    count: number;
    date: Date;
  }>;
}

export function AlertsTrend({ isDarkMode, trendData }: AlertsTrendProps) {
  return (
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
      {trendData.length > 0 ? (
        <ChartContainer
          config={{
            alerts: {
              label: "Alerts",
              color: isDarkMode ? "#3b82f6" : "#2563eb",
            },
          }}
          className="h-[200px] w-full"
        >
          <AreaChart data={trendData}>
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
  );
}

