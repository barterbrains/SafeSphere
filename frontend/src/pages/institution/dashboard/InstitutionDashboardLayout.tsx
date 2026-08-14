import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview",          path: "/institution/dashboard/overview",    icon: "dashboard" },
  { label: "Heatmap",           path: "/institution/dashboard/heatmap",     icon: "map" },
  { label: "Alerts",            path: "/institution/dashboard/alerts",      icon: "notifications_active" },
  { label: "Complaints Raised", path: "/institution/dashboard/complaints",  icon: "inbox" },
  { label: "Profile",           path: "/institution/dashboard/profile",     icon: "apartment" },
  { label: "Settings",          path: "/institution/dashboard/settings",    icon: "tune" },
];

export default function InstitutionDashboardLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const orgName =
    (profile as any)?.organization ??
    (profile?.name?.replace(" (Demo)", "") ?? "Institution");

  return (
    <div className="flex h-screen bg-[#080b14] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-[#0d1117] border-r border-white/[0.06]">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <span className="material-symbols-outlined text-[18px] text-indigo-200">shield</span>
            </div>
            <div>
              <p className="text-[15px] font-bold tracking-tight text-white leading-tight">SafeSphere</p>
              <p className="text-[10px] font-semibold tracking-widest text-indigo-400 uppercase">Institution Portal</p>
            </div>
          </div>
          <div className="mt-3 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <p className="text-[11px] text-slate-400 leading-none mb-0.5">Signed in as</p>
            <p className="text-[13px] font-semibold text-white truncate">{orgName}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer border-none text-[13px] font-medium ${
                  active
                    ? "bg-indigo-600/20 text-indigo-300 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.25)]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05] bg-transparent"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[19px] flex-shrink-0"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 pt-3 border-t border-white/[0.06] flex flex-col gap-1">
          <button
            onClick={() => signOut().then(() => navigate("/institution/login"))}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/[0.08] transition-all cursor-pointer border-none bg-transparent text-[13px] font-medium"
          >
            <span className="material-symbols-outlined text-[19px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
