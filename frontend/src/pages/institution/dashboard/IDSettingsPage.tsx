/**
 * IDSettingsPage.tsx
 * Institution Dashboard › Settings
 * No Supabase reads — all settings are local state in demo mode.
 * Real mode: settings stored in an institution_settings table (does not exist yet — stub).
 */
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

interface NotifSettings { emailSOS: boolean; emailComplaints: boolean; emailWeeklyReport: boolean; smsAlerts: boolean; }
interface AdminRole { id: string; name: string; email: string; role: "admin" | "viewer" | "moderator"; }
type RetentionPeriod = "30d" | "90d" | "180d" | "1y";

const DEMO_ROLES: AdminRole[] = [
  { id:"r1", name:"Dr. Rajesh Sharma",  email:"admin@gtbit.edu.in",     role:"admin"     },
  { id:"r2", name:"Prof. Meena Joshi",  email:"meena@gtbit.edu.in",     role:"moderator" },
  { id:"r3", name:"Sanjay Kapoor",      email:"sanjay.k@gtbit.edu.in",  role:"viewer"    },
];

const ROLE_META: Record<string, { text: string; bg: string; border: string }> = {
  admin:     { text:"text-indigo-300", bg:"bg-indigo-500/10", border:"border-indigo-500/20" },
  moderator: { text:"text-amber-300",  bg:"bg-amber-500/10",  border:"border-amber-500/20"  },
  viewer:    { text:"text-slate-400",  bg:"bg-slate-500/10",  border:"border-slate-500/20"  },
};

function Toggle({ value, onChange, label, sub }: { value: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[13px] text-white font-medium">{label}</p>
        {sub && <p className="text-[12px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer border-none flex-shrink-0 ${value ? "bg-indigo-600" : "bg-white/10"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export default function IDSettingsPage() {
  const { isDemo } = useAuth();
  const [notif, setNotif] = useState<NotifSettings>({ emailSOS: true, emailComplaints: true, emailWeeklyReport: true, smsAlerts: false });
  const [roles, setRoles] = useState<AdminRole[]>(isDemo ? DEMO_ROLES : []);
  const [retention, setRetention] = useState<RetentionPeriod>("90d");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateNotif(key: keyof NotifSettings) {
    return (v: boolean) => setNotif((n) => ({ ...n, [key]: v }));
  }

  const RETENTION_OPTIONS: { value: RetentionPeriod; label: string }[] = [
    { value:"30d",  label:"30 days"   },
    { value:"90d",  label:"90 days"   },
    { value:"180d", label:"6 months"  },
    { value:"1y",   label:"1 year"    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 pt-8 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-white">Settings</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Institution-level notifications, roles, and data preferences
            {isDemo && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold tracking-wider">DEMO</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-[12px] text-green-400 font-semibold">Saved ✓</span>}
          <button onClick={handleSave} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-colors border-none">
            Save All
          </button>
        </div>
      </div>

      <div className="px-8 pb-10 flex flex-col gap-5">
        {/* Notifications */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6">
          <h2 className="text-[14px] font-semibold text-white mb-1">Notifications</h2>
          <p className="text-[12px] text-slate-500 mb-4">Control when and how your institution receives alerts.</p>
          <div className="divide-y divide-white/[0.06]">
            <Toggle value={notif.emailSOS}          onChange={updateNotif("emailSOS")}          label="Email on SOS Alert"       sub="Send email to admin when a user triggers an SOS" />
            <Toggle value={notif.emailComplaints}   onChange={updateNotif("emailComplaints")}   label="Email on New Complaint"   sub="Notify when a new complaint is filed" />
            <Toggle value={notif.emailWeeklyReport} onChange={updateNotif("emailWeeklyReport")} label="Weekly Safety Report"     sub="Receive a weekly summary of incidents and trends" />
            <Toggle value={notif.smsAlerts}         onChange={updateNotif("smsAlerts")}         label="SMS for Critical Alerts"  sub="SMS the admin on critical-severity incidents" />
          </div>
        </div>

        {/* Admin Roles */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-white">Admin Roles</h2>
              <p className="text-[12px] text-slate-500 mt-0.5">Manage who has access to this dashboard.</p>
            </div>
            <button className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 cursor-pointer hover:bg-indigo-600/30 transition-colors">
              + Invite
            </button>
          </div>
          {roles.length === 0 ? (
            <p className="text-[13px] text-slate-500 py-4 text-center">No admin roles configured</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {roles.map((r) => {
                const meta = ROLE_META[r.role];
                return (
                  <div key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[13px] text-white font-medium">{r.name}</p>
                      <p className="text-[12px] text-slate-500">{r.email}</p>
                    </div>
                    <select
                      value={r.role}
                      onChange={(e) => setRoles((prev) => prev.map((x) => x.id === r.id ? { ...x, role: e.target.value as any } : x))}
                      className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg border ${meta.text} ${meta.bg} ${meta.border} bg-transparent cursor-pointer outline-none`}
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Data Retention */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6">
          <h2 className="text-[14px] font-semibold text-white mb-1">Data Retention</h2>
          <p className="text-[12px] text-slate-500 mb-5">Set how long incident and alert data is kept before automatic deletion.</p>
          <div className="flex gap-3 flex-wrap">
            {RETENTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRetention(opt.value)}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer border ${
                  retention === opt.value
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.3)]"
                    : "text-slate-400 bg-white/[0.04] border-white/[0.08] hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-slate-500 mt-4">
            Currently set to <span className="text-indigo-300 font-semibold">{RETENTION_OPTIONS.find((o) => o.value === retention)?.label}</span>
          </p>
        </div>

        {!isDemo && (
          <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[12px]">
            <b>Schema note:</b> Settings are not persisted until an <code>institution_settings</code> table is provisioned. Changes here are local to this session.
          </div>
        )}
      </div>
    </div>
  );
}
