"use client";

import React, { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { Card, StatWidget } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/ui/Badge";
import { Modal, ConfirmationModal } from "@/components/ui/Modal";
import { apiClient } from "@/lib/api-client";
import { dataStore } from "@/lib/data-store";
import { User, Facility, Ambulance, SystemAuditLog, UserRole } from "@/types";
import { MOCK_USERS } from "@/lib/mock-data";
import {
  ShieldCheck,
  Users,
  Building2,
  Ambulance as AmbulanceIcon,
  FileCheck,
  Activity,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Lock,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "facilities" | "ambulances" | "audit" | "stats">("users");
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reset demo store confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [facs, ambs] = await Promise.all([
        apiClient.getFacilities(),
        apiClient.getActiveAmbulances(),
      ]);
      setFacilities(facs);
      setAmbulances(ambs);
      setAuditLogs(dataStore.getAuditLogs());
    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResetData = () => {
    dataStore.resetDemoData();
    setShowResetModal(false);
    loadAdminData();
  };

  const handleToggleUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    dataStore.logAudit({
      action: "ADMIN_UPDATE_USER_ROLE",
      entityType: "User",
      entityId: userId,
      userId: "usr-admin-01",
      userName: "System Administrator",
      userRole: "admin",
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      metadata: { newRole },
    });
    setAuditLogs(dataStore.getAuditLogs());
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <PageShell
        title="State Administration & System Oversight"
        description="Protected administrator operations: user credential governance, facility registry accreditation, ambulance fleet configuration, and system audit trails"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setShowResetModal(true)}
            >
              Reset Demo Telemetry
            </Button>
          </div>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Administration" },
        ]}
      >
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#D9E0E7] pb-3">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "users"
                ? "bg-[#163A5F] text-white shadow-xs"
                : "bg-white text-[#172B3A] border border-[#D9E0E7] hover:bg-slate-50"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Authorized Personnel Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveTab("facilities")}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "facilities"
                ? "bg-[#163A5F] text-white shadow-xs"
                : "bg-white text-[#172B3A] border border-[#D9E0E7] hover:bg-slate-50"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Accredited Facilities ({facilities.length})
          </button>

          <button
            onClick={() => setActiveTab("ambulances")}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "ambulances"
                ? "bg-[#163A5F] text-white shadow-xs"
                : "bg-white text-[#172B3A] border border-[#D9E0E7] hover:bg-slate-50"
            }`}
          >
            <AmbulanceIcon className="w-3.5 h-3.5" />
            108 Fleet Configuration ({ambulances.length})
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors ${
              activeTab === "audit"
                ? "bg-[#163A5F] text-white shadow-xs"
                : "bg-white text-[#172B3A] border border-[#D9E0E7] hover:bg-slate-50"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Security Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* TAB CONTENT: USERS */}
        {activeTab === "users" && (
          <Card
            title="Authorized Health Personnel & Role Assignments"
            subtitle="Strict role-based operational permissions enforced on all platform modules"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full gov-table">
                <thead>
                  <tr>
                    <th>User & Designation</th>
                    <th>Government Email</th>
                    <th>Assigned Role</th>
                    <th>Facility Association</th>
                    <th>Last Active</th>
                    <th className="text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="font-bold text-xs text-[#163A5F]">{u.name}</div>
                        <div className="text-[11px] text-[#5B6875]">{u.designation}</div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-[#172B3A]">{u.email}</span>
                      </td>
                      <td>
                        <RoleBadge role={u.role} />
                      </td>
                      <td>
                        <div className="text-xs text-[#172B3A]">{u.facilityName || "State Headquarters"}</div>
                      </td>
                      <td>
                        <div className="text-[11px] text-[#5B6875]">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleTimeString("en-IN") : "Recent"}
                        </div>
                      </td>
                      <td className="text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleToggleUserRole(u.id, e.target.value as UserRole)}
                          className="text-xs p-1.5 border border-[#D9E0E7] rounded bg-white text-[#172B3A] font-medium"
                        >
                          <option value="hospital">Hospital / Doctor</option>
                          <option value="dispatcher">108 Dispatcher</option>
                          <option value="admin">System Administrator</option>
                          <option value="asha">ASHA Community Worker</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB CONTENT: FACILITIES */}
        {activeTab === "facilities" && (
          <Card
            title="Accredited Facility Registry"
            subtitle="State government registry of certified obstetric referral units"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full gov-table">
                <thead>
                  <tr>
                    <th>Facility Name</th>
                    <th>MoHFW Identifier</th>
                    <th>Level</th>
                    <th>District</th>
                    <th>Emergency Nodal Officer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((fac) => (
                    <tr key={fac.id}>
                      <td>
                        <div className="font-bold text-xs text-[#163A5F]">{fac.name}</div>
                        <div className="text-[11px] text-[#5B6875]">{fac.address}</div>
                      </td>
                      <td>
                        <span className="font-mono text-xs font-semibold text-[#163A5F]">
                          {fac.verifiedIdentifier}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-[#172B3A]">{fac.level.replace(/_/g, " ")}</span>
                      </td>
                      <td>
                        <span className="text-xs text-[#172B3A]">{fac.district}</span>
                      </td>
                      <td>
                        <div className="text-xs font-medium text-[#172B3A]">{fac.nodalOfficerName}</div>
                        <div className="text-[11px] text-[#5B6875]">{fac.contactPhone}</div>
                      </td>
                      <td>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                          Accredited
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB CONTENT: AMBULANCES */}
        {activeTab === "ambulances" && (
          <Card
            title="108 Emergency Fleet Configuration"
            subtitle="Authorized vehicles, emergency life-support apparatus, and driver registration"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full gov-table">
                <thead>
                  <tr>
                    <th>Vehicle Registration</th>
                    <th>Ambulance Type</th>
                    <th>Driver & Contact</th>
                    <th>Paramedic / EMT</th>
                    <th>Base Station</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ambulances.map((amb) => (
                    <tr key={amb.id}>
                      <td>
                        <span className="font-bold text-xs font-mono text-[#163A5F]">
                          {amb.registrationNumber}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#1D4ED8]">
                          {amb.type}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs font-medium text-[#172B3A]">{amb.driverName}</div>
                        <div className="text-[11px] text-[#5B6875]">{amb.driverPhone}</div>
                      </td>
                      <td>
                        <span className="text-xs text-[#172B3A]">{amb.paramedicName}</span>
                      </td>
                      <td>
                        <span className="text-xs text-[#5B6875]">{amb.baseStation}</span>
                      </td>
                      <td>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            amb.status === "AVAILABLE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {amb.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB CONTENT: AUDIT LOGS */}
        {activeTab === "audit" && (
          <Card
            title="Immutable System Audit Logs"
            subtitle="Cryptographically verified government operational log for compliance and legal accountability"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full gov-table">
                <thead>
                  <tr>
                    <th>Log ID & Action</th>
                    <th>Entity Type & ID</th>
                    <th>Authenticated Officer</th>
                    <th>Network Source</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="font-bold text-xs font-mono text-[#163A5F]">
                          {log.action}
                        </div>
                        <div className="text-[10px] text-[#5B6875] font-mono">{log.id}</div>
                      </td>
                      <td>
                        <div className="text-xs font-medium text-[#172B3A]">
                          {log.entityType}: <span className="font-mono">{log.entityId}</span>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs font-semibold text-[#172B3A]">{log.userName}</div>
                        <div className="text-[10px] text-[#5B6875] capitalize">{log.userRole}</div>
                      </td>
                      <td>
                        <span className="text-[11px] font-mono text-[#5B6875]">{log.ipAddress}</span>
                      </td>
                      <td>
                        <div className="text-[11px] text-[#172B3A]">
                          {new Date(log.timestamp).toLocaleTimeString("en-IN")}
                        </div>
                        <div className="text-[10px] text-[#5B6875]">
                          {new Date(log.timestamp).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Reset Confirmation Dialog */}
        <ConfirmationModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetData}
          title="Reset Local Telemetry & Referral Cache?"
          message="This will restore all referrals, ambulances, and readiness metrics back to initial drill demonstration values. Any edits made during this session will be cleared."
          confirmText="Yes, Reset Demonstration State"
          confirmVariant="danger"
        />
      </PageShell>
    </RoleGuard>
  );
}
