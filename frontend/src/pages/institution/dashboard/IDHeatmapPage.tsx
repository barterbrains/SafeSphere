/**
 * IDHeatmapPage.tsx
 * Institution Dashboard › Heatmap
 * Data pattern: isDemo ? MOCK_PINS : supabase.from("institutional_incidents").eq("institution_id", id)
 * Real table: institutional_incidents (institution_id EXISTS ✅)
 */
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

interface IncidentPin {
  id: string;
  lat: number;
  lng: number;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  label: string;
}

// Demo: GTBIT/Janakpuri/Dwarka area, Delhi
const DEMO_PINS: IncidentPin[] = [
  { id:"p1",  lat:28.6277, lng:77.0971, type:"Emergency SOS",     severity:"critical", label:"GTBIT Gate 2"           },
  { id:"p2",  lat:28.6210, lng:77.0855, type:"Unsafe Route",      severity:"high",     label:"Nangloi Chowk"          },
  { id:"p3",  lat:28.6188, lng:77.0761, type:"Poor Lighting",     severity:"medium",   label:"Nangloi Metro"          },
  { id:"p4",  lat:28.6341, lng:77.0812, type:"Harassment",        severity:"high",     label:"Uttam Nagar East"       },
  { id:"p5",  lat:28.6163, lng:77.0635, type:"Emergency SOS",     severity:"critical", label:"Uttam Nagar West Metro" },
  { id:"p6",  lat:28.6295, lng:77.1040, type:"Suspicious Person", severity:"medium",   label:"Tagore Garden"          },
  { id:"p7",  lat:28.6082, lng:77.0733, type:"Poor Lighting",     severity:"low",      label:"Sec-7 Dwarka"           },
  { id:"p8",  lat:28.5921, lng:77.0674, type:"Unsafe Route",      severity:"medium",   label:"Dwarka Sec-9 Metro"     },
  { id:"p9",  lat:28.6021, lng:77.0598, type:"Emergency SOS",     severity:"high",     label:"Dwarka Sec-10"          },
  { id:"p10", lat:28.6391, lng:77.0901, type:"Harassment",        severity:"medium",   label:"Janakpuri C-Block"      },
  { id:"p11", lat:28.6445, lng:77.0823, type:"Poor Lighting",     severity:"low",      label:"Janakpuri B-Pocket"     },
  { id:"p12", lat:28.6510, lng:77.0880, type:"Suspicious Person", severity:"medium",   label:"Janakpuri West Metro"   },
  { id:"p13", lat:28.6312, lng:77.1102, type:"Unsafe Route",      severity:"low",      label:"Subhash Nagar"          },
  { id:"p14", lat:28.6198, lng:77.0900, type:"Emergency SOS",     severity:"critical", label:"Vikaspuri X-Block"      },
  { id:"p15", lat:28.6070, lng:77.0812, type:"Harassment",        severity:"high",     label:"Dwarka Sec-12"          },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  medium:   "#eab308",
  low:      "#22c55e",
};

declare global {
  interface Window { L: any; }
}

export default function IDHeatmapPage() {
  const { profile, isDemo } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [pins, setPins] = useState<IncidentPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const institutionId = profile?.id ?? null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 300));
        setPins(DEMO_PINS);
      } else if (institutionId) {
        try {
          const { data } = await supabase
            .from("institutional_incidents")
            .select("id, type, severity, location")
            .eq("institution_id", institutionId);
          if (data) {
            const mapped: IncidentPin[] = data.map((d: any) => ({
              id: d.id,
              lat: d.location?.lat ?? 0,
              lng: d.location?.lng ?? 0,
              type: d.type ?? "Incident",
              severity: d.severity ?? "medium",
              label: d.location?.address ?? "Unknown",
            })).filter((p: IncidentPin) => p.lat && p.lng);
            setPins(mapped);
          }
        } catch { setPins([]); }
      }
      setLoading(false);
    }
    load();
  }, [isDemo, institutionId]);

  // Load Leaflet and render map
  useEffect(() => {
    if (loading || !mapRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    function initMap() {
      const L = window.L;
      if (!mapRef.current || mapInstanceRef.current) return;
      const center = pins.length > 0 ? [pins[0].lat, pins[0].lng] : [28.6277, 77.0971];
      const map = L.map(mapRef.current, { center, zoom: 13 });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const filtered = filter === "all" ? pins : pins.filter((p) => p.severity === filter);
      filtered.forEach((pin) => {
        const color = SEVERITY_COLOR[pin.severity] ?? "#6366f1";
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}88;"></div>`,
          iconAnchor: [7, 7],
        });
        L.marker([pin.lat, pin.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${pin.type}</b><br>${pin.label}<br><span style="color:${color};font-weight:bold;text-transform:uppercase;font-size:11px">${pin.severity}</span>`);
      });
    }

    if (window.L) {
      initMap();
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, pins, filter]);

  const FILTERS = ["all", "critical", "high", "medium", "low"];

  const counts = FILTERS.slice(1).reduce<Record<string, number>>((acc, sev) => {
    acc[sev] = pins.filter((p) => p.severity === sev).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex-shrink-0">
        <h1 className="text-[22px] font-bold tracking-tight text-white">Incident Heatmap</h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Geographic distribution of incidents across all users under your institution
          {isDemo && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold tracking-wider">DEMO</span>}
        </p>

        {/* Legend + filter */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all cursor-pointer border ${
                filter === f
                  ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                  : "text-slate-400 bg-white/[0.04] border-white/[0.08] hover:text-white"
              }`}
              style={f !== "all" && filter === f ? { color: SEVERITY_COLOR[f] } : {}}
            >
              {f === "all" ? `All (${pins.length})` : `${f} (${counts[f] ?? 0})`}
              {f !== "all" && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full" style={{ background: SEVERITY_COLOR[f] }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 px-8 pb-8 min-h-0">
        {loading ? (
          <div className="w-full h-full min-h-[480px] rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
              <p className="text-slate-400 text-[13px]">Loading incident data…</p>
            </div>
          </div>
        ) : (
          <div
            ref={mapRef}
            className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden border border-white/[0.07]"
            style={{ background: "#0d1117" }}
          />
        )}
      </div>
    </div>
  );
}
