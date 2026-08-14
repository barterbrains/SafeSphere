import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowLeft, Clock } from 'lucide-react';
import { apiFetch } from '../utils';
import ListRow from '../components/ui/ListRow';

const RECENT = [
  { id: 'loc-1', address: 'Connaught Place, New Delhi', zone: 'Central Delhi' },
  { id: 'loc-3', address: 'Rajouri Garden, New Delhi', zone: 'West Delhi' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/routes/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch { /* silent */ } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (dest: any) =>
    navigate(`/routes?destinationId=${dest.id}&destAddress=${encodeURIComponent(dest.address)}`);

  return (
    <div style={{ background: '#0B0F14', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Sticky header */}
      <div style={{
        background: '#0B0F14', padding: '20px 16px', position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid #1E2733',
      }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Go Back"
              style={{ background: '#131A24', border: '1px solid #1E2733', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F1F5F9', margin: 0 }}>Where to?</h1>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} color={focused ? '#10B981' : '#475569'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', transition: 'color 0.15s' }} />
            <input
              autoFocus
              type="text"
              placeholder="Search destination in Delhi NCR..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: '100%', padding: '12px 14px 12px 44px', boxSizing: 'border-box',
                background: '#131A24',
                border: `1.5px solid ${focused ? '#10B981' : '#1E2733'}`,
                borderRadius: 10, color: '#F1F5F9', fontSize: '0.92rem',
                fontFamily: 'inherit', outline: 'none',
                boxShadow: focused ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 540, margin: '0 auto', padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div className="spinner" style={{ borderTopColor: '#10B981', borderColor: '#1E2733', width: 28, height: 28 }} />
          </div>
        ) : results.length > 0 ? (
          <div>
            <p style={{ color: '#334155', fontSize: '0.7rem', fontWeight: 700, paddingLeft: 2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Search Results
            </p>
            <div style={{ background: '#111827', border: '1px solid #1E2733', borderRadius: 12, overflow: 'hidden' }}>
              {results.map((r, i) => (
                <div key={r.id} style={{ borderBottom: i < results.length - 1 ? '1px solid #1E2733' : 'none' }}>
                  <ListRow
                    icon={<MapPin size={16} />}
                    iconBg="rgba(16,185,129,0.12)"
                    iconColor="#10B981"
                    title={r.address}
                    subtitle={r.zone}
                    onClick={() => handleSelect(r)}
                    showArrow
                  />
                </div>
              ))}
            </div>
          </div>
        ) : query ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#131A24', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <MapPin size={24} color="#334155" />
            </div>
            <p style={{ color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>No results found</p>
            <p style={{ color: '#334155', fontSize: '0.85rem' }}>Try a different area in Delhi NCR.</p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#334155', fontSize: '0.7rem', fontWeight: 700, paddingLeft: 2, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Recent Searches
            </p>
            <div style={{ background: '#111827', border: '1px solid #1E2733', borderRadius: 12, overflow: 'hidden' }}>
              {RECENT.map((r, i) => (
                <div key={r.id} style={{ borderBottom: i < RECENT.length - 1 ? '1px solid #1E2733' : 'none' }}>
                  <ListRow
                    icon={<Clock size={16} />}
                    iconBg="#1A2332"
                    iconColor="#475569"
                    title={r.address}
                    subtitle={r.zone}
                    onClick={() => handleSelect(r)}
                    showArrow
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
