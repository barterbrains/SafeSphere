/**
 * IDOverviewPage.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * Institutional Dashboard › Overview
 *
 * DATA BRANCHING PATTERN (applied to all six pages):
 *
 *   isDemo
 *     ? return MOCK_DATA                         // hard-coded, no network
 *     : await supabase.from(table)               // real query by institution_id
 *         .select(columns)
 *         .eq("institution_id", institutionId)
 *
 * REAL-MODE TABLE READINESS:
 *   Table                      institution_id col?  Status
 *   ──────────────────────────────────────────────────────
 *   profiles                   YES (institution_id) ✅ EXISTS
 *   institutional_incidents    YES (institution_id) ✅ EXISTS
 *   institutions               YES (PK = id)        ✅ EXISTS
 *   complaints                 —                    ❌ DOES NOT EXIST
 *                                                      (stub returns [] in real mode)
 *
 *   In real mode:
 *   - "Total Registered Users"  → profiles WHERE institution_id = ?
 *   - "Active Incidents"        → institutional_incidents WHERE institution_id = ? AND status = "open"
 *   - "Total Complaints"        → complaints table STUB (returns 0 until table is created)
 *   - "Safety Index"            → derived: 100 − (critical_incident_ratio * 100)
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────
interface OverviewStats {
  totalUsers: number;
  safetyIndex: number;
  activeIncidents: number;
  totalComplaints: number;
}

interface RecentAlert {
  id: string;
  userName: string;
  type: string;
  location: string;
  timestamp: string;
  status: "active" | "resolved";
}

// ── Demo data (GTBIT Campus) ─────────────────────────────────────────────────
const DEMO_STATS: OverviewStats = {
  totalUsers: 342,
  safetyIndex: 87,
  activeIncidents: 4,
  totalComplaints: 19,
};

const DEMO_ALERTS: RecentAlert[] = [
  { id: "a1", userName: "Ananya Gupta",   type: "Emergency SOS",       location: "GTBIT Gate 2",          timestamp: "2 min ago",  status: "active"   },
  { id: "a2", userName: "Rohan Mehta",    type: "Unsafe Route",        location: "Nangloi Chowk",         timestamp: "14 min ago", status: "active"   },
  { id: "a3", userName: "Priya Kaur",     type: "Harassment Report",   location: "Sec-9 Metro Station",   timestamp: "31 min ago", status: "resolved" },
  { id: "a4", userName: "Divya Sharma",   type: "Emergency SOS",       location: "Uttam Nagar West",      timestamp: "1 hr ago",   status: "resolved" },
  { id: "a5", userName: "Neeraj Bhatia",  type: "Poor Lighting",       location: "Janakpuri C-Block",     timestamp: "2 hrs ago",  status: "resolved" },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function IDOverviewPage() {
  const { profile, isDemo } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [alerts, setAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const institutionId = profile?.id ?? null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      if (isDemo) {
        // ── DEMO PATH: no network calls ──────────────────
        await new Promise((r) => setTimeout(r, 420)); // simulate latency feel
        setStats(DEMO_STATS);
        setAlerts(DEMO_ALERTS);
        setLoading(false);
        return;
      }

      // ── REAL MODE PATH ────────────────────────────────
      if (!institutionId) {
        setError("No institution session found.");
        setLoading(false);
        return;
      }

      try {
        const [usersRes, incidentsRes] = await Promise.all([
          // Count members belonging to this institution
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("institution_id", institutionId),

          // Active institutional incidents
          supabase
            .from("institutional_incidents")
            .select("id, type, severity, status, location, created_at")
            .eq("institution_id", institutionId)
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        const totalUsers = usersRes.count ?? 0;
        const allIncidents = incidentsRes.data ?? [];
        const activeIncidents = allIncidents.filter((i: any) => i.status === "open").length;

        // complaints table DOES NOT EXIST yet → stub
        let totalComplaints = 0;
        // When complaints table is created, replace with:
        // const { count } = await supabase
        //   .from("complaints")
        //   .select("id", { count: "exact", head: true })
        //   .eq("institution_id", institutionId);
        // totalComplaints = count ?? 0;

        const criticalCount = allIncidents.filter((i: any) => i.severity === "critical").length;
        const safetyIndex = allIncidents.length > 0
          ? Math.round(Math.max(0, 100 - (criticalCount / allIncidents.length) * 100))
          : 100;

        setStats({ totalUsers, safetyIndex, activeIncidents, totalComplaints });

        // Map recent institutional_incidents into RecentAlert shape
        const recentAlerts: RecentAlert[] = allIncidents.slice(0, 5).map((i: any) => ({
          id: i.id,
          userName: "—",            // institution_incidents doesn't track user_id yet
          type: i.type ?? "Incident",
          location: i.location?.address ?? "Unknown location",
          timestamp: new Date(i.created_at).toLocaleTimeString(),
          status: i.status === "open" ? "active" : "resolved",
        }));
        setAlerts(recentAlerts);
      } catch (err: any) {
        setError(err.message ?? "Failed to load overview data.");
      }

      setLoading(false);
    }

    load();
  }, [isDemo, institutionId]);

  // ── Stat cards config ────────────────────────────────────────────────────
  const CARDS = [
    {
      label: "Registered Users",
      value: stats?.totalUsers ?? "—",
      icon: "group",
      color: "from-indigo-600/20 to-indigo-900/20",
      border: "border-indigo-500/20",
      iconColor: "text-indigo-400",
      link: null,
    },
    {
      label: "Safety Index",
      value: stats ? `${stats.safetyIndex}%` : "—",
      icon: "verified_user",
      color: "from-emerald-600/20 to-emerald-900/20",
      border: "border-emerald-500/20",
      iconColor: "text-emerald-400",
      link: null,
    },
    {
      label: "Active Incidents",
      value: stats?.activeIncidents ?? "—",
      icon: "warning",
      color: "from-amber-600/20 to-amber-900/20",
      border: "border-amber-500/20",
      iconColor: "text-amber-400",
      link: "/institution/dashboard/alerts",
    },
    {
      label: "Total Complaints",
      value: stats?.totalComplaints ?? "—",
      icon: "inbox",
      color: "from-rose-600/20 to-rose-900/20",
      border: "border-rose-500/20",
      iconColor: "text-rose-400",
      link: "/institution/dashboard/complaints",
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-white">Overview</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">
              Institution-wide summary · scoped to your organisation
              {isDemo && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold tracking-wider">
                  DEMO
                </span>
              )}
            </p>
          </div>
          <div className="text-[12px] text-slate-500">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 flex flex-col gap-6">
        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-[13px]">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.label}
              onClick={() => card.link && navigate(card.link)}
              className={`rounded-2xl bg-gradient-to-br ${card.color} border ${card.border} p-5 flex flex-col gap-3 ${card.link ? "cursor-pointer hover:scale-[1.02] transition-transform" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className={`material-symbols-outlined text-[22px] ${card.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {card.icon}
                </span>
                {card.link && (
                  <span className="material-symbols-outlined text-[15px] text-slate-500">arrow_forward</span>
                )}
              </div>
              <div>
                {loading ? (
                  <div className="h-7 w-16 rounded-lg bg-white/10 animate-pulse" />
                ) : (
                  <p className="text-[26px] font-bold tracking-tight text-white leading-none">{card.value}</p>
                )}
                <p className="text-[12px] text-slate-400 mt-1">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent alerts feed */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Recent Alerts</h2>
            <button
              onClick={() => navigate("/institution/dashboard/alerts")}
              className="text-[12px] text-indigo-400 hover:text-indigo-300 cursor-pointer border-none bg-transparent transition-colors"
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="px-5 py-6 flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500 text-[13px]">No recent alerts</div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {alerts.map((alert) => (
                <div key={alert.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <span
                    className="material-symbols-outlined text-[18px] flex-shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1", color: alert.status === "active" ? "#f59e0b" : "#64748b" }}
                  >
                    {alert.status === "active" ? "warning" : "check_circle"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white truncate">
                      <span className="font-medium">{alert.userName !== "—" ? alert.userName + " · " : ""}</span>
                      {alert.type}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{alert.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[11px] text-slate-500">{alert.timestamp}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        alert.status === "active"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-slate-500/15 text-slate-400"
                      }`}
                    >
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
