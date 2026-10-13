"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Referral } from "@/types";

interface OperationalChartProps {
  referrals: Referral[];
}

export function OperationalChart({ referrals }: OperationalChartProps) {
  if (!referrals || referrals.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-[#D9E0E7] rounded bg-[#F8FAFC] text-xs text-[#5B6875]">
        No referral activity data available for graph aggregation.
      </div>
    );
  }

  // Count by status
  const statusCounts = referrals.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = [
    { name: "New", count: statusCounts["NEW"] || 0, fill: "#1D4ED8" },
    { name: "Review", count: statusCounts["NEEDS_REVIEW"] || 0, fill: "#A15C00" },
    { name: "Accepted", count: statusCounts["ACCEPTED"] || 0, fill: "#18794E" },
    { name: "In Transit", count: (statusCounts["AMBULANCE_ASSIGNED"] || 0) + (statusCounts["PATIENT_ONBOARD"] || 0), fill: "#0284C7" },
    { name: "Arrived", count: statusCounts["ARRIVED"] || 0, fill: "#0D9488" },
    { name: "Completed", count: statusCounts["COMPLETED"] || 0, fill: "#475569" },
    { name: "Declined", count: statusCounts["DECLINED"] || 0, fill: "#B42318" },
  ];

  // Count by urgency
  const urgencyCounts = referrals.reduce((acc, r) => {
    acc[r.urgency] = (acc[r.urgency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: "Critical", value: urgencyCounts["CRITICAL"] || 0, color: "#B42318" },
    { name: "High", value: urgencyCounts["HIGH"] || 0, color: "#A15C00" },
    { name: "Normal", value: urgencyCounts["NORMAL"] || 0, color: "#163A5F" },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Status Bar Chart */}
      <div className="lg:col-span-2 bg-white border border-[#D9E0E7] rounded-md p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#163A5F] mb-4">
          Current Referral Workflows by Stage
        </h4>
        <div className="h-60 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F4F8" vertical={false} />
              <XAxis dataKey="name" stroke="#5B6875" fontSize={11} tickLine={false} />
              <YAxis stroke="#5B6875" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#D9E0E7",
                  fontSize: "12px",
                  borderRadius: "4px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#1D4ED8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Urgency Triage Pie Chart */}
      <div className="bg-white border border-[#D9E0E7] rounded-md p-4 flex flex-col">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#163A5F] mb-4">
          Clinical Triage Urgency Distribution
        </h4>
        <div className="h-60 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#D9E0E7",
                  fontSize: "12px",
                  borderRadius: "4px",
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-[#172B3A]">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
