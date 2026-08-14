/**
 * IDAlertsPage.tsx
 * Institution Dashboard › Alerts
 * Data pattern: isDemo ? MOCK_ALERTS : supabase.from("institutional_incidents").eq("institution_id", id)
 * Real table: institutional_incidents (institution_id EXISTS ✅)
 * Note: user name is not available (institutional_incidents has no user_id column yet)
 */
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

type AlertStatus = "active" | "resolved";

interface Alert {
  id: string;
  userName: string;
  type: string;
  location: string;
  timestamp: string;
  status: AlertStatus;
  severity: "low" | "medium" | "high" | "critical";
}

const DEMO_ALERTS: Alert[] = [
  { id:"al1", userName:"Ananya Gupta",   type:"Emergency SOS",       location:"GTBIT Gate 2",            timestamp:"2026-08-14T18:22:00Z", status:"active",   severity:"critical" },
  { id:"al2", userName:"Rohan Mehta",    type:"Unsafe Route Report", location:"Nangloi Chowk",           timestamp:"2026-08-14T18:08:00Z", status:"active",   severity:"high"     },
  { id:"al3", userName:"Divya Sharma",   type:"Emergency SOS",       location:"Uttam Nagar West Metro",  timestamp:"2026-08-14T17:30:00Z", status:"resolved", severity:"critical" },
  { id:"al4", userName:"Priya Kaur",     type:"Harassment Report",   location:"Sec-9 Metro Station",     timestamp:"2026-08-14T17:01:00Z", status:"resolved", severity:"high"     },
  { id:"al5", userName:"Neeraj Bhatia",  type:"Poor Lighting",       location:"Janakpuri C-Block",       timestamp:"2026-08-14T16:45:00Z", status:"resolved", severity:"medium"   },
  { id:"al6", userName:"Sneha Verma",    type:"Emergency SOS",       location:"Dwarka Sec-10",           timestamp:"2026-08-14T15:12:00Z", status:"resolved", severity:"critical" },
  { id:"al7", userName:"Amit Rawat",     type:"Suspicious Person",   location:"Tagore Garden",           timestamp:"2026-08-14T14:55:00Z", status:"resolved", severity:"medium"   },
  { id:"al8", userName:"Kavya Singh",    type:"Unsafe Route Report", location:"Vikaspuri X-Block",       timestamp:"2026-08-14T13:30:00Z", status:"resolved", severity:"low"      },
];

const SEVERITY_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text:"text-red-400",    bg:"bg-red-500/10",    border:"border-red-500/20"    },
  high:     { text:"text-orange-400", bg:"bg-orange-500/10", border:"border-orange-500/20" },
  medium:   { text:"text-yellow-400", bg:"bg-yellow-500/10", border:"border-yellow-500/20" },
  low:      { text:"text-green-400",  bg:"bg-green-500/10",  border:"border-green-500/20"  },
};

function fmt(ts: string) {
  try { return new Date(ts).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }); }
  catch { return ts; }
}

export default function IDAlertsPage() {
  const { profile, isDemo } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | AlertStatus>("all");

  const institutionId = profile?.id ?? null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 350));
        setAlerts(DEMO_ALERTS);
      } else if (institutionId) {
        try {
          const { data } = await supabase
            .from("institutional_incidents")
            .select("id, type, severity, status, location, created_at")
            .eq("institution_id", institutionId)
            .order("created_at", { ascending: false });
          if (data) {
            const mapped: Alert[] = data.map((d: any) => ({
              id: d.id,
              userName: "—",
              type: d.type ?? "Incident",
              location: d.location?.address ?? "Unknown location",
              timestamp: d.created_at,
              status: d.status === "open" ? "active" : "resolved",
              severity: d.severity ?? "medium",
            }));
            setAlerts(mapped);
          }
        } catch { setAlerts([]); }
      }
      setLoading(false);
    }
    load();
  }, [isDemo, institutionId]);

  const visible = filter === "all" ? alerts : alerts.filter((a) => a.status === filter);
  const activeCount = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 pt-8 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-white">Alerts</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">
              SOS and safety alerts raised by your institution users
              {isDemo && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold tracking-wider">DEMO</span>}
            </p>
          </div>
          {activeCount > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[13px] font-semibold text-red-400">{activeCount} active</span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-5">
          {(["all", "active", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all cursor-pointer border ${
                filter === f
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
                  : "text-slate-400 bg-white/[0.04] border-white/[0.08] hover:text-white"
              }`}
            >
              {f === "all" ? `All (${alerts.length})` : f === "active" ? `Active (${activeCount})` : `Resolved (${alerts.length - activeCount})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 py-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-600" style={{ fontVariationSettings:"'FILL' 1" }}>notifications_off</span>
            <p className="text-slate-500 text-[13px] mt-3">No {filter !== "all" ? filter : ""} alerts</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 bg-white/[0.03] border-b border-white/[0.07] text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
              <span>User</span><span>Type</span><span>Location</span><span>Time</span><span>Status</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {visible.map((alert) => {
                const sev = SEVERITY_COLOR[alert.severity];
                return (
                  <div key={alert.id} className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors">
                    <span className="text-[13px] text-white font-medium truncate">{alert.userName}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${sev.bg}`} style={{ background: alert.severity === "critical" ? "#ef4444" : alert.severity === "high" ? "#f97316" : alert.severity === "medium" ? "#eab308" : "#22c55e" }} />
                      <span className="text-[13px] text-slate-200 truncate">{alert.type}</span>
                    </div>
                    <span className="text-[12px] text-slate-400 truncate">{alert.location}</span>
                    <span className="text-[12px] text-slate-500">{fmt(alert.timestamp)}</span>
                    <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      alert.status === "active"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}>
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
