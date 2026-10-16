"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (role === "asha") {
          router.replace("/dashboard/asha");
        } else if (role === "dispatcher") {
          router.replace("/ambulances");
        } else if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, role, router]);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#163A5F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#5B6875] font-medium tracking-wide">
          Connecting to MAIRA Operational Gateway...
        </p>
      </div>
    </div>
  );
}
