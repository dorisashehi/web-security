"use client";

import { Shield, Wifi, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AlertFiltersProps {
  filterAgent: string | null;
  onFilterChange: (agent: string | null) => void;
  isDarkMode: boolean;
  alertsCount: number;
  networkAlertsCount: number;
  logAlertsCount: number;
  userAlertsCount: number;
}

export function AlertFilters({
  filterAgent,
  onFilterChange,
  isDarkMode,
  alertsCount,
  networkAlertsCount,
  logAlertsCount,
  userAlertsCount,
}: AlertFiltersProps) {
  return (
    <div className="flex gap-3">
      <Button
        variant={filterAgent === null ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onFilterChange(null)}
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
          {alertsCount}
        </Badge>
      </Button>
      <Button
        variant={filterAgent === "traffic_monitor" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onFilterChange("traffic_monitor")}
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
        onClick={() => onFilterChange("log_analyzer")}
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
        variant={filterAgent === "behavior_analyzer" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onFilterChange("behavior_analyzer")}
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
  );
}

