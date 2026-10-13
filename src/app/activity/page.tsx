"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiClient } from "@/lib/api-client";
import { ActivityEvent } from "@/types";
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  PhoneCall,
  Bell,
  ArrowRight,
  RefreshCw,
  GitPullRequest,
} from "lucide-react";

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadActivity = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getActivity();
      setActivities(data);
    } catch (err) {
      console.error("Error loading activity", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
    const handleUpdate = () => {
      loadActivity();
    };
    window.addEventListener("maira_store_updated", handleUpdate);
    return () => window.removeEventListener("maira_store_updated", handleUpdate);
  }, []);

  useEffect(() => {
    let result = [...activities];
    if (channelFilter === "SMS") {
      result = result.filter((a) => a.dispatchChannels.smsDelivered);
    } else if (channelFilter === "IVR") {
      result = result.filter((a) => a.dispatchChannels.ivrTriggered);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.actorName.toLowerCase().includes(q) ||
          (a.referralId && a.referralId.toLowerCase().includes(q))
      );
    }
    setFilteredActivities(result);
  }, [activities, channelFilter, searchTerm]);

  return (
    <PageShell
      title="Notifications & Operational Activity"
      description="System-wide audit trail of obstetric referrals, telemetry updates, and multi-channel notification dispatches"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadActivity}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      }
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Activity & Notifications" },
      ]}
    >
      {/* Filters Bar */}
      <div className="bg-white border border-[#D9E0E7] rounded-md p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#5B6875] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Referral ID, Actor Name, or event description..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
          />
        </div>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-[#D9E0E7] rounded bg-white text-[#172B3A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
        >
          <option value="ALL">All Notification Channels</option>
          <option value="SMS">Confirmed SMS Dispatched</option>
          <option value="IVR">Automated IVR Call Placed</option>
        </select>
      </div>

      {/* Activity Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full gov-table">
            <thead>
              <tr>
                <th>Event Type & Title</th>
                <th>Relevant Referral ID</th>
                <th>Authorized Actor</th>
                <th>Recorded Description</th>
                <th>Dispatch Channels (In-App / SMS / IVR)</th>
                <th>Timestamp</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td>
                    <div className="font-bold text-xs text-[#163A5F]">
                      {act.title}
                    </div>
                    <div className="text-[10px] text-[#5B6875] mt-0.5 font-mono">
                      {act.eventType}
                    </div>
                  </td>

                  <td>
                    {act.referralId ? (
                      <Link
                        href={`/referrals/${act.referralId}`}
                        className="font-bold text-xs text-[#1D4ED8] hover:underline"
                      >
                        {act.referralId}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-[#5B6875]">System Level</span>
                    )}
                  </td>

                  <td>
                    <div className="text-xs font-semibold text-[#172B3A]">
                      {act.actorName}
                    </div>
                    <div className="text-[10px] text-[#5B6875] capitalize">
                      {act.actorRole}
                    </div>
                  </td>

                  <td className="max-w-md">
                    <p className="text-xs text-[#5B6875] leading-relaxed">
                      {act.description}
                    </p>
                  </td>

                  <td>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${
                          act.dispatchChannels.inApp
                            ? "bg-slate-100 text-slate-800"
                            : "bg-slate-50 text-slate-400"
                        }`}
                        title="In-App System Notification"
                      >
                        <Bell className="w-2.5 h-2.5" />
                        In-App
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${
                          act.dispatchChannels.smsDelivered
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-400"
                        }`}
                        title={
                          act.dispatchChannels.smsDelivered
                            ? "Confirmed Government SMS Gateway Delivery"
                            : "SMS Not Required"
                        }
                      >
                        <MessageSquare className="w-2.5 h-2.5" />
                        SMS {act.dispatchChannels.smsDelivered ? "Sent" : "Off"}
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${
                          act.dispatchChannels.ivrTriggered
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-400"
                        }`}
                        title={
                          act.dispatchChannels.ivrTriggered
                            ? "IVR Voice Call Alert Dispatched"
                            : "IVR Standby"
                        }
                      >
                        <PhoneCall className="w-2.5 h-2.5" />
                        IVR {act.dispatchChannels.ivrTriggered ? "Dialed" : "Off"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="text-[11px] text-[#172B3A] font-medium whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleTimeString("en-IN")}
                    </div>
                    <div className="text-[10px] text-[#5B6875] whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleDateString("en-IN")}
                    </div>
                  </td>

                  <td className="text-right">
                    {act.referralId && (
                      <Link href={`/referrals/${act.referralId}`}>
                        <Button variant="secondary" size="sm">
                          Inspect Case
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}
