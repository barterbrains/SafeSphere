/**
 * IDProfilePage.tsx
 * Institution Dashboard › Institution Profile
 * Data pattern: isDemo ? MOCK_PROFILE : supabase.from("institutions").select("*").eq("id", institutionId)
 * Real table: institutions (id, name, type, created_at) ✅ EXISTS
 * Note: contact, address columns don't exist yet — shown as stubs in real mode
 */
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";

interface InstitutionProfile {
  name: string;
  type: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  address: string;
  city: string;
  institutionId: string;
  memberCount: number;
  registeredDate: string;
}

const DEMO_PROFILE: InstitutionProfile = {
  name:            "Guru Tegh Bahadur Institute of Technology",
  type:            "Educational Institution",
  adminName:       "Dr. Rajesh Sharma",
  adminEmail:      "admin@gtbit.edu.in",
  adminPhone:      "+91 11 2559 7700",
  address:         "Block A, Rajouri Garden Extension, New Delhi",
  city:            "New Delhi — 110064",
  institutionId:   "GTBIT-2024-INST",
  memberCount:     342,
  registeredDate:  "January 2024",
};

interface FieldProps { label: string; value: string; editable?: boolean; onChange?: (v: string) => void; editing?: boolean; }

function Field({ label, value, editable, onChange, editing }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      {editing && editable && onChange ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/[0.06] border border-indigo-500/30 rounded-lg px-3 py-2 text-[14px] text-white outline-none focus:border-indigo-400 transition-colors"
        />
      ) : (
        <p className="text-[14px] text-white">{value || "—"}</p>
      )}
    </div>
  );
}

export default function IDProfilePage() {
  const { profile, isDemo } = useAuth();
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<InstitutionProfile>(
    isDemo ? DEMO_PROFILE : {
      name: profile?.name ?? "",
      type: "",
      adminName: "",
      adminEmail: "",
      adminPhone: "",
      address: "",
      city: "",
      institutionId: profile?.id ?? "",
      memberCount: 0,
      registeredDate: "—",
    }
  );
  const [saved, setSaved] = useState(false);

  function upd(key: keyof InstitutionProfile) {
    return (v: string) => setData((d) => ({ ...d, [key]: v }));
  }

  function handleSave() {
    // In real mode: await supabase.from("institutions").update({name, type, ...}).eq("id", institutionId)
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-white">Institution Profile</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">
              Your organisation details and administrative contact
              {isDemo && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold tracking-wider">DEMO</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {saved && (
              <span className="text-[12px] text-green-400 font-semibold self-center">Saved ✓</span>
            )}
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-slate-400 bg-white/[0.05] border border-white/[0.08] cursor-pointer hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-colors border-none">Save Changes</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl text-[12px] font-semibold text-indigo-300 bg-indigo-600/20 border border-indigo-500/30 cursor-pointer hover:bg-indigo-600/30 transition-colors">Edit Profile</button>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 pb-10 flex flex-col gap-5">
        {/* Institution identity */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-2xl text-indigo-200" style={{ fontVariationSettings:"'FILL' 1" }}>apartment</span>
            </div>
            <div>
              <p className="text-[16px] font-bold text-white">{data.name}</p>
              <p className="text-[13px] text-slate-400">{data.type}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Institution Name" value={data.name} editable editing={editing} onChange={upd("name")} />
            <Field label="Type" value={data.type} editable editing={editing} onChange={upd("type")} />
            <Field label="Institution ID" value={data.institutionId} />
            <Field label="Registered Since" value={data.registeredDate} />
            <Field label="Total Members" value={String(data.memberCount)} />
          </div>
        </div>

        {/* Admin contact */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6">
          <h2 className="text-[14px] font-semibold text-white mb-5">Administrator Contact</h2>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Admin Name" value={data.adminName} editable editing={editing} onChange={upd("adminName")} />
            <Field label="Email" value={data.adminEmail} editable editing={editing} onChange={upd("adminEmail")} />
            <Field label="Phone" value={data.adminPhone} editable editing={editing} onChange={upd("adminPhone")} />
          </div>
        </div>

        {/* Address */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6">
          <h2 className="text-[14px] font-semibold text-white mb-5">Registered Address</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <Field label="Street / Area" value={data.address} editable editing={editing} onChange={upd("address")} />
            </div>
            <Field label="City / PIN" value={data.city} editable editing={editing} onChange={upd("city")} />
          </div>
        </div>

        {!isDemo && (
          <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[12px]">
            <b>Schema note:</b> Contact and address fields are not yet persisted in the <code>institutions</code> table. Edits will be reflected locally until the schema is extended.
          </div>
        )}
      </div>
    </div>
  );
}
