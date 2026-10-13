"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { UserRole } from "@/types";
import {
  Shield,
  Eye,
  EyeOff,
  Cross,
  AlertCircle,
  Building2,
  Ambulance,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isDemoMode } = useAuth();

  const [email, setEmail] = useState("doctor@dwh.gov.in");
  const [password, setPassword] = useState("GovernmentPass@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("hospital");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password, selectedRole);
    setIsLoading(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Authentication failed. Check credentials.");
    }
  };

  const handleSelectDemoProfile = (
    role: UserRole,
    demoEmail: string
  ) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword("GovernmentPass@2026");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col justify-between">
      {/* Top Government Official Strip */}
      <div className="bg-[#163A5F] text-white py-2 px-4 sm:px-8 border-b border-[#0F2742] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider">GOVERNMENT OF INDIA / STATE HEALTH MISSION</span>
          <span className="text-white/40 hidden sm:inline">&bull;</span>
          <span className="text-white/70 hidden sm:inline">Emergency Obstetric & Neonatal Referral Portal</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>Restricted Official Access</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#D9E0E7] rounded-lg shadow-sm overflow-hidden">
          {/* Card Header with Wordmark */}
          <div className="p-6 sm:p-8 bg-[#F8FAFC] border-b border-[#E5EAF0] text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#163A5F] text-white shadow-xs mb-3">
              <Cross className="w-7 h-7 text-emerald-400 rotate-45" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#163A5F]">
              MAIRA
            </h1>
            <p className="text-xs font-semibold text-[#1D4ED8] uppercase tracking-wider mt-0.5">
              Maternal & Infant Referral Assistance
            </p>
            <p className="text-xs text-[#5B6875] mt-2 max-w-xs mx-auto">
              Secure Operations Portal for Hospitals, Obstetricians & 108 Emergency Ambulance Dispatch
            </p>
          </div>

          {/* Demo Mode Role Quick Selectors */}
          {isDemoMode && (
            <div className="px-6 pt-5 pb-1 bg-amber-50/50 border-b border-amber-200/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A15C00]">
                  Evaluation & Drill Credentials:
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                  Select Role
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pb-3">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectDemoProfile("hospital", "doctor@dwh.gov.in")
                  }
                  className={`p-2 text-left rounded border transition-all text-xs ${
                    selectedRole === "hospital"
                      ? "border-[#1D4ED8] bg-blue-50 text-[#1D4ED8] font-semibold"
                      : "border-[#D9E0E7] bg-white text-[#5B6875] hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {selectedRole === "hospital" && (
                      <Check className="w-3 h-3 text-[#1D4ED8]" />
                    )}
                  </div>
                  <div className="mt-1 font-medium leading-tight">Hospital / Doctor</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSelectDemoProfile("dispatcher", "dispatch@erc108.gov.in")
                  }
                  className={`p-2 text-left rounded border transition-all text-xs ${
                    selectedRole === "dispatcher"
                      ? "border-[#1D4ED8] bg-blue-50 text-[#1D4ED8] font-semibold"
                      : "border-[#D9E0E7] bg-white text-[#5B6875] hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Ambulance className="w-3.5 h-3.5 shrink-0" />
                    {selectedRole === "dispatcher" && (
                      <Check className="w-3 h-3 text-[#1D4ED8]" />
                    )}
                  </div>
                  <div className="mt-1 font-medium leading-tight">108 Dispatcher</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSelectDemoProfile("admin", "admin@nrhm.gov.in")
                  }
                  className={`p-2 text-left rounded border transition-all text-xs ${
                    selectedRole === "admin"
                      ? "border-[#1D4ED8] bg-blue-50 text-[#1D4ED8] font-semibold"
                      : "border-[#D9E0E7] bg-white text-[#5B6875] hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    {selectedRole === "admin" && (
                      <Check className="w-3 h-3 text-[#1D4ED8]" />
                    )}
                  </div>
                  <div className="mt-1 font-medium leading-tight">Administrator</div>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-[#B42318] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#172B3A] mb-1 uppercase tracking-wider"
              >
                Government Email / NIC ID
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@dwh.gov.in"
                className="w-full px-3 py-2 text-sm border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#172B3A] uppercase tracking-wider"
                >
                  Security Password
                </label>
                <span className="text-[11px] text-[#5B6875]">Min 6 chars</span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#5B6875] hover:text-[#172B3A]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="navy"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Authorize & Open Portal
              </Button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-[#5B6875] leading-relaxed">
                By entering this portal you acknowledge compliance with government data protection standards. All session events are recorded for audit.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 px-4 text-center text-xs text-[#5B6875] border-t border-[#D9E0E7] bg-white">
        MAIRA Operational Portal &bull; Maternal & Infant Referral Assistance &bull; Version 2.4.0 (Gov Operational Release)
      </footer>
    </div>
  );
}
