import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({
  children,
  className = "",
  title,
  subtitle,
  action,
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={`bg-white border border-[#D9E0E7] rounded-md shadow-xs ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5EAF0]">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-[#163A5F] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#5B6875] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}

export function StatWidget({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  badgeVariant = "neutral",
  alert = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeVariant?: "default" | "primary" | "success" | "warning" | "critical" | "neutral";
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-white border ${
        alert ? "border-[#FECDCA] bg-[#FFFBFB]" : "border-[#D9E0E7]"
      } rounded-md p-4 shadow-xs`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#5B6875] uppercase tracking-wider">
          {title}
        </span>
        {icon && <span className="text-[#163A5F]">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight ${alert ? "text-[#B42318]" : "text-[#163A5F]"}`}>
          {value}
        </span>
        {badgeText && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              badgeVariant === "critical"
                ? "bg-[#FEF3F2] text-[#B42318]"
                : badgeVariant === "warning"
                ? "bg-[#FEF7EC] text-[#A15C00]"
                : badgeVariant === "success"
                ? "bg-[#EDFBF3] text-[#18794E]"
                : "bg-[#F1F4F8] text-[#5B6875]"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-[#5B6875] mt-1">{subtitle}</p>}
    </div>
  );
}
