/**
 * IDComplaintsPage.tsx
 * Institution Dashboard › Complaints Raised
 * Data pattern: isDemo ? MOCK_COMPLAINTS : supabase.from("complaints").eq("institution_id", id)
 * Real table: complaints — DOES NOT EXIST YET ❌
 *   Real mode returns empty state + a banner explaining the table is not created.
 *   When table is created, uncomment the real query.
 *   Expected schema: complaints(id, institution_id, user_id, subject, description, status, created_at)
 */
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

type ComplaintStatus = "open" | "in_review" | "resolved";

interface Complaint {
  id: string;
  userName: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
}

const DEMO_COMPLAINTS: Complaint[] = [
  { id:"c1",  userName:"Ananya Gupta",  subject:"Street lights non-functional near Gate 2",   description:"Street lights on the access road to GTBIT Gate 2 have been out for 2 weeks.", status:"in_review", createdAt:"2026-08-13T10:30:00Z" },
  { id:"c2",  userName:"Rohan Mehta",   subject:"Unsafe footpath on Nangloi main road",         description:"The footpath is broken and frequently dark after 8 PM.",                      status:"open",      createdAt:"2026-08-14T08:10:00Z" },
  { id:"c3",  userName:"Divya Sharma",  subject:"Auto-rickshaw overcharging students",          description:"Auto drivers near the campus are overcharging and being rude.",               status:"resolved",  createdAt:"2026-08-12T15:45:00Z" },
  { id:"c4",  userName:"Priya Kaur",    subject:"Inadequate security at Sec-9 Metro exit",      description:"Lone female students feel unsafe at the metro exit post 9 PM.",               status:"in_review", createdAt:"2026-08-11T19:00:00Z" },
  { id:"c5",  userName:"Neeraj Bhatia", subject:"Stray dogs near Uttam Nagar West",             description:"Pack of stray dogs regularly seen near the west gate area.",                  status:"resolved",  createdAt:"2026-08-10T07:20:00Z" },
  { id:"c6",  userName:"Sneha Verma",   subject:"Harassment at Dwarka Sec-10 bus stop",         description:"Reported ongoing harassment of female commuters at Sec-10 bus stop.",         status:"open",      createdAt:"2026-08-14T11:55:00Z" },
  { id:"c7",  userName:"Amit Rawat",    subject:"Missing CCTV footage request",                 description:"Requesting institution to escalate missing CCTV footage from Tagore Garden.", status:"open",      createdAt:"2026-08-13T22:00:00Z" },
  { id:"c8",  userName:"Kavya Singh",   subject:"Route safety score seems incorrect",           description:"The app shows Vikaspuri X-Block as safe but there have been incidents.",      status:"resolved",  createdAt:"2026-08-09T14:30:00Z" },
];

const STATUS_META: Record<ComplaintStatus, { label: string; text: string; bg: string; border: string }> = {
  open:      { label:"Open",      text:"text-amber-400",  bg:"bg-amber-500/10",  border:"border-amber-500/20"  },
  in_review: { label:"In Review", text:"text-blue-400",   bg:"bg-blue-500/10",   border:"border-blue-500/20"   },
  resolved:  { label:"Resolved",  text:"text-green-400",  bg:"bg-green-500/10",  border:"border-green-500/20"  },
};

function fmt(ts: string) {
  try { return new Date(ts).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }); }
  catch { return ts; }
}

export default function IDComplaintsPage() {
  const { isDemo } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ComplaintStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 380));
        setComplaints(DEMO_COMPLAINTS);
      } else {
        // complaints table does not exist yet — stub returns empty
        // When ready, replace with:
        // const { data } = await supabase.from("complaints")
        //   .select("id, user_id, subject, description, status, created_at")
        //   .eq("institution_id", institutionId)
        //   .order("created_at", { ascending: false });
        // setComplaints(data?.map(...) ?? []);
        setComplaints([]);
      }
      setLoading(false);
    }
    load();
  }, [isDemo]);

  const visible = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);
  const counts: Record<string, number> = {
    all:       complaints.length,
    open:      complaints.filter((c) => c.status === "open").length,
    in_review: complaints.filter((c) => c.status === "in_review").length,
    resolved:  complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 pt-8 pb-0">
        <h1 className="text-[22px] font-bold tracking-tight text-white">Complaints Raised</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Complaints submitted by your institution users
          {isDemo && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold tracking-wider">DEMO</span>}
        </p>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {(["all", "open", "in_review", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer border ${
                filter === f
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
                  : "text-slate-400 bg-white/[0.04] border-white/[0.08] hover:text-white"
              }`}
            >
              {f === "all" ? "All" : STATUS_META[f]?.label} ({counts[f] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 py-6">
        {/* Real-mode stub notice */}
        {!isDemo && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[12px]">
            <b>Schema note:</b> The <code>complaints</code> table has not been created in the database yet. Real-mode data will appear once the table is provisioned.
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-600" style={{ fontVariationSettings:"'FILL' 1" }}>inbox</span>
            <p className="text-slate-500 text-[13px] mt-3">No complaints in this category</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map((c) => {
              const meta = STATUS_META[c.status];
              const isOpen = expanded === c.id;
              return (
                <div key={c.id} className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    className="w-full flex items-start gap-4 px-5 py-4 text-left cursor-pointer bg-transparent border-none hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-semibold text-white truncate">{c.subject}</span>
                      </div>
                      <p className="text-[12px] text-slate-400">
                        {c.userName} · {fmt(c.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${meta.text} ${meta.bg} ${meta.border}`}>
                        {meta.label}
                      </span>
                      <span className="material-symbols-outlined text-[18px] text-slate-500">
                        {isOpen ? "expand_less" : "expand_more"}
                      </span>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 border-t border-white/[0.06]">
                      <p className="text-[13px] text-slate-300 mt-3 leading-relaxed">{c.description}</p>
                      <div className="flex gap-2 mt-4">
                        {c.status !== "in_review" && (
                          <button className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors">
                            Mark In Review
                          </button>
                        )}
                        {c.status !== "resolved" && (
                          <button className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-colors">
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
