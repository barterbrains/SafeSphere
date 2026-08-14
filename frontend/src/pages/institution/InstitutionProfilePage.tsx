import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { InstitutionNav } from './InstitutionNav';

export default function InstitutionProfilePage() {
  const navigate = useNavigate();
  const { user, profile: authProfile, signOut, isDemo, refreshProfile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'settings'>('profile');
  const [loadingRealData, setLoadingRealData] = useState(!isDemo);

  // ── Profile state ──────
  const [profile, setProfile] = useState({
    name:             isDemo ? 'Aarav Sharma'                        : (authProfile?.name || ''),
    email:            isDemo ? 'aarav.sharma@example.com'            : (user?.email || ''),
    phone:            isDemo ? '+91 98101 23456'                     : (authProfile?.phone || ''),
    bloodType:        isDemo ? 'O+ Positive'                         : (authProfile?.blood_type || ''),
    allergies:        isDemo ? 'Penicillin, Peanuts'                 : (authProfile?.allergies || ''),
    medicalConditions:isDemo ? 'Asthma (Carries Inhaler)'            : (authProfile?.medical_conditions || ''),
    homeAddress:      isDemo ? 'C-42, Hauz Khas Enclave, New Delhi'  : (authProfile?.home_address || ''),
    workSafeZone:     isDemo ? 'Barakhamba Road, Connaught Place, New Delhi' : (authProfile?.work_safe_zone || ''),
    collegeSafeZone:  isDemo ? 'GTBIT Campus, Rajouri Garden, New Delhi'     : '',
    memberTier:       isDemo ? 'SafeSphere Pro Guardian'             : 'Verified Member',
    verifiedPhone:    isDemo ? true : !!authProfile?.phone,
    verifiedEmail:    isDemo ? true : !!user?.email,
  });

  // ── Trusted contacts state ───
  const [contacts, setContacts] = useState<any[]>(
    isDemo ? [
      { id: 'c-1', name: 'Rohan Sharma',   phone: '+91 98111 88990', relationship: 'Brother',  permission: 'Always (24/7 Live)',      status: 'Accepted' },
      { id: 'c-2', name: 'Dr. Meera Sharma', phone: '+91 98200 11223', relationship: 'Mother', permission: 'SOS Only',               status: 'Accepted' },
      { id: 'c-3', name: 'Ananya Verma',   phone: '+91 97170 33445', relationship: 'Roommate', permission: 'Active Journeys Only',   status: 'Pending'  },
    ] : []
  );

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Friend');
  const [newContactPerm, setNewContactPerm] = useState('SOS Only');
  const [showAddContact, setShowAddContact] = useState(false);

  // ── Journey & alert history ──
  const [pastJourneys, setPastJourneys] = useState<any[]>(
    isDemo ? [
      { id: 'j-1', route: 'Connaught Place ➔ Hauz Khas',   date: 'Today, 2:15 PM',      safeScore: 94, duration: '28 mins', status: 'Completed Safely'          },
      { id: 'j-2', route: 'Rajouri Garden ➔ India Gate',    date: 'Yesterday, 8:40 PM',  safeScore: 88, duration: '34 mins', status: 'Completed Safely'          },
      { id: 'j-3', route: 'Saket CityWalk ➔ Hauz Khas',    date: '12 Aug, 10:10 PM',    safeScore: 82, duration: '18 mins', status: 'Rerouted (Low Lighting)'   },
    ] : []
  );

  const [alertHistory, setAlertHistory] = useState<any[]>(
    isDemo ? [
      { id: 'sos-1', type: 'Off-Route Alert Triggered', date: '04 Aug, 11:20 PM', location: 'Near Ring Road Flyover', resolvedBy: 'User Check-in (Safe)',   status: 'Resolved' },
      { id: 'sos-2', type: 'Test SOS Broadcast',        date: '15 Jul, 04:00 PM', location: 'GTBIT Campus',          resolvedBy: 'System Diagnostic Test', status: 'Passed'   },
    ] : []
  );

  // ── Real data query from Supabase for logged-in user ───────────────────────
  useEffect(() => {
    if (isDemo || !user?.id) {
      setLoadingRealData(false);
      return;
    }

    const currentUserId = user.id;
    const currentUserEmail = user.email || '';

    async function loadUserData() {
      setLoadingRealData(true);
      try {
        // 1. Fetch Profile
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId)
          .maybeSingle();

        if (profileRow) {
          setProfile({
            name: profileRow.name || currentUserEmail.split('@')[0] || 'User',
            email: currentUserEmail,
            phone: profileRow.phone || '',
            bloodType: profileRow.blood_type || '',
            allergies: profileRow.allergies || '',
            medicalConditions: profileRow.medical_conditions || '',
            homeAddress: profileRow.home_address || '',
            workSafeZone: profileRow.work_safe_zone || '',
            collegeSafeZone: '',
            memberTier: 'Verified Member',
            verifiedPhone: !!profileRow.phone,
            verifiedEmail: !!currentUserEmail,
          });
        }

        // 2. Fetch Trusted Contacts
        const { data: contactsData } = await supabase
          .from('trusted_contacts')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (contactsData) {
          setContacts(contactsData.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone || c.contact || '',
            relationship: c.relationship || 'Guardian',
            permission: c.permission || 'SOS Only',
            status: c.status || (c.enabled ? 'Accepted' : 'Pending'),
          })));
        }

        // 3. Fetch Journeys
        const { data: journeysData } = await supabase
          .from('journeys')
          .select('*')
          .eq('user_id', currentUserId)
          .order('started_at', { ascending: false })
          .limit(5);

        if (journeysData) {
          setPastJourneys(journeysData.map(j => ({
            id: j.id,
            route: j.route_summary || `${j.origin_name || 'Origin'} ➔ ${j.destination_name || 'Destination'}`,
            date: new Date(j.started_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            safeScore: Math.round(Number(j.current_safe_score || 85)),
            duration: j.duration_mins ? `${j.duration_mins} mins` : 'Completed',
            status: j.status === 'completed' ? 'Completed Safely' : j.status,
          })));
        }

        // 4. Fetch SOS Alert History
        const { data: sosData } = await supabase
          .from('sos_incidents')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (sosData) {
          setAlertHistory(sosData.map(a => ({
            id: a.id,
            type: a.type || 'Emergency SOS Broadcast',
            date: new Date(a.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            location: a.location_name || 'Delhi NCR Region',
            resolvedBy: a.resolved_by || 'Dispatched',
            status: a.status,
          })));
        }
      } catch (err) {
        console.error('Error fetching Supabase user profile data:', err);
      } finally {
        setLoadingRealData(false);
      }
    }

    loadUserData();
  }, [isDemo, user?.id]);

  // ── Settings ───────────────────────────────────────────────────────────────
  const [autoSosMinutes, setAutoSosMinutes] = useState('5');
  const [autoSosSafeScoreDrop, setAutoSosSafeScoreDrop] = useState(true);
  const [safeScoreThreshold, setSafeScoreThreshold] = useState('60');
  const [defaultRouteMode, setDefaultRouteMode] = useState('Safest');
  const [checkInFrequency, setCheckInFrequency] = useState('Every 15 mins');

  // Privacy & Granularity
  const [locationGranularity, setLocationGranularity] = useState('Exact Precision GPS');
  const [autoExpireSharing, setAutoExpireSharing] = useState('Immediately on Journey End');
  const [whoCanSeeHistory, setWhoCanSeeHistory] = useState('Only Me');
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState('30 Days (Auto-Purge)');

  // Notifications
  const [notifySosPush, setNotifySosPush] = useState(true);
  const [notifySosSms, setNotifySosSms] = useState(true);
  const [notifyCheckInReminders, setNotifyCheckInReminders] = useState(true);
  const [notifySafeScoreDrop, setNotifySafeScoreDrop] = useState(true);

  // Security & App
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [appUnits, setAppUnits] = useState('Kilometers (km)');
  const [appLanguage, setAppLanguage] = useState('English (India)');

  // State for Add Contact error & saving
  const [contactError, setContactError] = useState('');
  const [addingContact, setAddingContact] = useState(false);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      setContactError('Name and phone number are required.');
      return;
    }

    setContactError('');
    setAddingContact(true);

    if (!isDemo && user?.id) {
      try {
        // Guarantee that a profile row exists for foreign key constraint
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            name: profile.name || user.email?.split('@')[0] || 'User',
            role: 'consumer',
          }, { onConflict: 'id' });

        const payload = {
          user_id: user.id,
          name: newContactName.trim(),
          phone: newContactPhone.trim(),
          contact: newContactPhone.trim(),
          relationship: newContactRel,
          permission: newContactPerm,
          status: 'Accepted',
          enabled: true,
        };

        const { data, error } = await supabase
          .from('trusted_contacts')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('[SafeSphere] Supabase Add Contact Error:', error);
          setContactError(error.message || 'Failed to save contact in database.');
          setAddingContact(false);
          return;
        }

        const newContactItem = {
          id: data?.id || `c-${Date.now()}`,
          name: data?.name || newContactName.trim(),
          phone: data?.phone || data?.contact || newContactPhone.trim(),
          relationship: data?.relationship || newContactRel,
          permission: data?.permission || newContactPerm,
          status: data?.status || 'Accepted',
        };

        setContacts(prev => [newContactItem, ...prev]);
        setShowAddContact(false);
        setNewContactName('');
        setNewContactPhone('');
      } catch (err: any) {
        console.error('[SafeSphere] Exception adding contact:', err);
        setContactError(err?.message || 'Unexpected error adding contact.');
      } finally {
        setAddingContact(false);
      }
    } else {
      // Demo Mode or Offline
      const newContactItem = {
        id: `c-${Date.now()}`,
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relationship: newContactRel,
        permission: newContactPerm,
        status: 'Accepted',
      };
      setContacts(prev => [newContactItem, ...prev]);
      setShowAddContact(false);
      setNewContactName('');
      setNewContactPhone('');
      setAddingContact(false);
    }
  };

  const handleRemoveContact = async (id: string) => {
    // Optimistically remove from state
    setContacts(prev => prev.filter(c => c.id !== id));
    if (!isDemo && user?.id) {
      const { error } = await supabase.from('trusted_contacts').delete().eq('id', id).eq('user_id', user.id);
      if (error) {
        console.error('[SafeSphere] Error removing contact:', error);
      }
    }
  };

  const handleExportData = () => {
    const exportBlob = new Blob([JSON.stringify({ profile, contacts, pastJourneys, alertHistory }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safesphere-user-data-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="flex h-screen overflow-hidden text-[15px] font-['Inter',sans-serif] bg-[#0a0a12] text-[#e2e2e2]">
      <InstitutionNav />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-10 relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              User Profile &amp; Settings
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified_user</span> {isDemo ? 'Demo Mode' : 'Verified Account'}
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage your personal identity, emergency medical info, trusted contacts, and safety preferences.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sub-tab switcher */}
            <div className="bg-[#111522] p-1 rounded-xl border border-white/10 flex">
              <button
                onClick={() => setActiveSubTab('profile')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  activeSubTab === 'profile'
                    ? 'bg-gradient-to-r from-[#4f46e5] to-[#4338ca] text-white shadow'
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                Profile &amp; Contacts
              </button>
              <button
                onClick={() => setActiveSubTab('settings')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  activeSubTab === 'settings'
                    ? 'bg-gradient-to-r from-[#4f46e5] to-[#4338ca] text-white shadow'
                    : 'bg-transparent text-slate-400 hover:text-white'
                }`}
              >
                Safety Settings &amp; Privacy
              </button>
            </div>

            <button
              onClick={() => { signOut().then(() => navigate('/login')); }}
              className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SUB-TAB 1: USER PROFILE & CONTACTS
           ═══════════════════════════════════════════════════════════ */}
        {activeSubTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            
            {/* Left Col: Identity, Medical & Safe Zones (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Identity Card */}
              <div className="rounded-2xl bg-[#111522]/80 backdrop-blur-2xl border border-white/10 p-6 flex flex-col items-center text-center shadow-xl">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#4f46e5] to-[#3730a3] border-2 border-indigo-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                    <span className="material-symbols-outlined text-4xl text-white">person</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white">{profile.name || 'User'}</h2>
                <p className="text-indigo-400 text-xs font-semibold mt-0.5">{profile.memberTier}</p>
                <p className="text-slate-400 text-xs mt-1">{profile.email} {profile.phone ? `· ${profile.phone}` : ''}</p>

                <div className="w-full border-t border-white/10 my-5" />

                {/* Emergency Medical Info */}
                <div className="w-full text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">medical_services</span> Emergency Medical Details
                    </span>
                    <span className="text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded font-semibold">
                      SOS Only
                    </span>
                  </div>

                  {(!profile.bloodType && !profile.allergies && !profile.medicalConditions) ? (
                    <div className="p-4 bg-black/30 border border-dashed border-white/10 rounded-xl text-center flex flex-col items-center gap-1.5">
                      <span className="text-xs text-slate-400">Not provided yet</span>
                      <p className="text-[11px] text-slate-500">Helps responders deliver proper care during an emergency.</p>
                      <button
                        onClick={() => navigate('/onboarding')}
                        className="mt-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-transparent border-none cursor-pointer underline"
                      >
                        Add Medical Info →
                      </button>
                    </div>
                  ) : (
                    <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Blood Group:</span>
                        <span className="font-bold text-white">{profile.bloodType || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Allergies:</span>
                        <span className="font-semibold text-slate-200">{profile.allergies || 'None listed'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Conditions:</span>
                        <span className="font-semibold text-slate-200">{profile.medicalConditions || 'None listed'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Frequent Safe Zones */}
                <div className="w-full text-left mt-5">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">home_pin</span> Recognized Safe Zones
                  </span>

                  {(!profile.homeAddress && !profile.workSafeZone) ? (
                    <div className="p-4 bg-black/30 border border-dashed border-white/10 rounded-xl text-center flex flex-col items-center gap-1.5 text-xs">
                      <span className="text-slate-400">No safe zones configured</span>
                      <p className="text-[11px] text-slate-500">Helps the engine identify when you are in known-safe areas.</p>
                      <button
                        onClick={() => navigate('/onboarding')}
                        className="mt-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-transparent border-none cursor-pointer underline"
                      >
                        Set Home/Work Zones →
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 text-xs">
                      {profile.homeAddress && (
                        <div className="p-3 bg-black/30 border border-white/5 rounded-xl">
                          <span className="text-[11px] font-bold text-slate-400 uppercase block">Home Perimeter</span>
                          <span className="text-slate-200 font-medium">{profile.homeAddress}</span>
                        </div>
                      )}
                      {profile.workSafeZone && (
                        <div className="p-3 bg-black/30 border border-white/5 rounded-xl">
                          <span className="text-[11px] font-bold text-slate-400 uppercase block">Work / Campus Hub</span>
                          <span className="text-slate-200 font-medium">{profile.workSafeZone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Right Col: Trusted Contacts & Journey Log (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Trusted Contacts Management */}
              <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-400">group</span>
                      Trusted Contacts Network
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Contacts receive automatic live telemetry and instant SOS emergency coordinates.</p>
                  </div>
                  <button
                    onClick={() => setShowAddContact(!showAddContact)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border-none shadow"
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    Add Contact
                  </button>
                </div>

                {/* Add Contact Modal / Inline Form */}
                {showAddContact && (
                  <form onSubmit={handleAddContact} className="mb-5 p-4 rounded-xl bg-black/40 border border-indigo-500/30 flex flex-col gap-3">
                    <span className="text-xs font-bold text-indigo-300">Add New Trusted Guardian</span>

                    {contactError && (
                      <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold">
                        {contactError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Contact Name (e.g. Priya Sharma)"
                        value={newContactName}
                        onChange={e => setNewContactName(e.target.value)}
                        className="bg-[#111522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number (+91 ...)"
                        value={newContactPhone}
                        onChange={e => setNewContactPhone(e.target.value)}
                        className="bg-[#111522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                        required
                      />
                      <select
                        value={newContactRel}
                        onChange={e => setNewContactRel(e.target.value)}
                        className="bg-[#111522] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                      >
                        <option value="Parent / Family">Parent / Family</option>
                        <option value="Spouse / Partner">Spouse / Partner</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend / Colleague">Friend / Colleague</option>
                      </select>
                      <select
                        value={newContactPerm}
                        onChange={e => setNewContactPerm(e.target.value)}
                        className="bg-[#111522] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
                      >
                        <option value="SOS Only">SOS Broadcast Only</option>
                        <option value="Active Journeys Only">During Active Journeys Only</option>
                        <option value="Always (24/7 Live)">Always (24/7 Live Location)</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => { setShowAddContact(false); setContactError(''); }}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingContact}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border-none cursor-pointer flex items-center gap-1.5"
                      >
                        {addingContact ? 'Saving Guardian...' : 'Save Guardian'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Contacts List */}
                <div className="flex flex-col gap-3">
                  {contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center gap-3 border border-dashed border-white/10 rounded-xl">
                      <span className="material-symbols-outlined text-3xl text-slate-600">group_add</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-400">No trusted contacts added yet</p>
                        <p className="text-xs text-slate-600 mt-1">Add guardians who will receive your real-time coordinates during an emergency.</p>
                      </div>
                      <button
                        onClick={() => setShowAddContact(true)}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 border-none bg-transparent cursor-pointer underline underline-offset-2"
                      >
                        Add your first contact →
                      </button>
                    </div>
                  ) : (
                    contacts.map(c => (
                      <div key={c.id} className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
                            {c.name ? c.name[0] : 'G'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{c.name}</span>
                              <span className="text-[11px] text-slate-400">({c.relationship})</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {c.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{c.phone} · Permission: <span className="text-indigo-300 font-semibold">{c.permission}</span></p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveContact(c.id)}
                          className="text-slate-500 hover:text-red-400 p-2 transition-colors cursor-pointer border-none bg-transparent"
                          title="Remove Contact"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Past Journeys Log & Alert History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Past Journeys */}
                <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-400 text-base">route</span>
                    Recent Protected Journeys
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {pastJourneys.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center gap-2 border border-dashed border-white/10 rounded-xl">
                        <span className="material-symbols-outlined text-2xl text-slate-600">route</span>
                        <p className="text-xs text-slate-500">No journeys yet — your safest walk starts here.</p>
                      </div>
                    ) : pastJourneys.map(j => (
                      <div key={j.id} className="p-3 bg-black/30 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-white">{j.route}</p>
                          <p className="text-slate-400 text-[11px]">{j.date} · {j.duration}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-indigo-400 font-extrabold">{j.safeScore}/100</span>
                          <p className="text-[10px] text-emerald-400 font-semibold">{j.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOS & Incident History */}
                <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-xl">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-base">notifications_active</span>
                    Alert &amp; SOS Event History
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {alertHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center gap-2 border border-dashed border-white/10 rounded-xl">
                        <span className="material-symbols-outlined text-2xl text-slate-600">notifications_off</span>
                        <p className="text-xs text-slate-500">No alerts triggered. Stay safe!</p>
                      </div>
                    ) : alertHistory.map(a => (
                      <div key={a.id} className="p-3 bg-black/30 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-red-300">{a.type}</p>
                          <p className="text-slate-400 text-[11px]">{a.date} · {a.location}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold">{a.status}</span>
                          <p className="text-[10px] text-slate-500">{a.resolvedBy}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SUB-TAB 2: SAFETY PREFERENCES, PRIVACY & SYSTEM SETTINGS
           ═══════════════════════════════════════════════════════════ */}
        {activeSubTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            
            {/* Box 1: Auto-SOS Triggers & Route Engine Defaults */}
            <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-400">emergency</span>
                  Auto-SOS &amp; Proactive Triggers
                </h3>
                <p className="text-xs text-slate-400 mt-1">Automatic emergency dispatch mechanisms when non-responsiveness or threat is detected.</p>
              </div>

              {/* Inactivity Auto-SOS */}
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-white block">Missed Check-in Auto-SOS</label>
                  <p className="text-[11px] text-slate-400">Trigger SOS if no response to prompt within selected window.</p>
                </div>
                <select
                  value={autoSosMinutes}
                  onChange={e => setAutoSosMinutes(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="3">After 3 minutes</option>
                  <option value="5">After 5 minutes (Recommended)</option>
                  <option value="10">After 10 minutes</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              {/* SafeScore Drop Trigger */}
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-white block">SafeScore Drop Alarm</label>
                  <p className="text-[11px] text-slate-400">Alert guardians if real-time route score plunges below threshold.</p>
                </div>
                <select
                  value={safeScoreThreshold}
                  onChange={e => setSafeScoreThreshold(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="50">Below 50 (High Risk)</option>
                  <option value="60">Below 60 (Moderate Risk)</option>
                  <option value="70">Below 70 (Caution)</option>
                </select>
              </div>

              {/* Default Routing Mode */}
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-white block">Default Routing Preference</label>
                  <p className="text-[11px] text-slate-400">Prioritize maximum lighting and security corridors by default.</p>
                </div>
                <select
                  value={defaultRouteMode}
                  onChange={e => setDefaultRouteMode(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="Safest">Safest (Maximum SafeScore)</option>
                  <option value="Balanced">Balanced (Safe + Efficient)</option>
                  <option value="Fastest">Fastest (Direct Path)</option>
                </select>
              </div>

              {/* Check-in Frequency */}
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-white block">Journey Check-In Prompt</label>
                  <p className="text-[11px] text-slate-400">Frequency of ambient wellness and safety confirmation prompts.</p>
                </div>
                <select
                  value={checkInFrequency}
                  onChange={e => setCheckInFrequency(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="Every 10 mins">Every 10 minutes</option>
                  <option value="Every 15 mins">Every 15 minutes</option>
                  <option value="Every 30 mins">Every 30 minutes</option>
                  <option value="Only on deviation">Only upon route deviation</option>
                </select>
              </div>
            </div>

            {/* Box 2: Privacy & Location Sharing Granularity */}
            <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400">shield_lock</span>
                  Privacy &amp; Telemetry Granularity
                </h3>
                <p className="text-xs text-slate-400 mt-1">Granular controls over who sees your location and automatic data purging.</p>
              </div>

              {/* Location Sharing Precision */}
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-white block">Location Sharing Precision</label>
                  <p className="text-[11px] text-slate-400">Exact GPS coordinates vs approximate neighborhood sector.</p>
                </div>
                <select
                  value={locationGranularity}
                  onChange={e => setLocationGranularity(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="Exact Precision GPS">Exact Precision GPS</option>
                  <option value="General Area (300m)">General Area (300m buffer)</option>
                  <option value="Off except SOS">Off (Broadcast only on SOS)</option>
                </select>
              </div>

              {/* Auto-Expiry for Live Sharing */}
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-white block">Auto-Expiry of Live Stream</label>
                  <p className="text-[11px] text-slate-400">Automatic termination of guardian tracking feed.</p>
                </div>
                <select
                  value={autoExpireSharing}
                  onChange={e => setAutoExpireSharing(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="Immediately on Journey End">Immediately on Journey End</option>
                  <option value="15 mins after arrival">15 mins after arrival</option>
                  <option value="Manual Stop Only">Manual Stop Only</option>
                </select>
              </div>

              {/* SafeScore History Visibility */}
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-white block">SafeScore History Visibility</label>
                  <p className="text-[11px] text-slate-400">Who can inspect your past journeys and score breakdown.</p>
                </div>
                <select
                  value={whoCanSeeHistory}
                  onChange={e => setWhoCanSeeHistory(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="Only Me">Only Me (Private)</option>
                  <option value="Trusted Contacts">All Trusted Contacts</option>
                  <option value="Emergency Personnel Only">Emergency Personnel Only</option>
                </select>
              </div>

              {/* Data Retention & Purge */}
              <div className="flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-white block">Data Retention Policy</label>
                  <p className="text-[11px] text-slate-400">Automatic cryptographic purging of historical GPS logs.</p>
                </div>
                <select
                  value={dataRetentionPeriod}
                  onChange={e => setDataRetentionPeriod(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="30 Days (Auto-Purge)">30 Days (Standard Auto-Purge)</option>
                  <option value="7 Days">7 Days (Strict Privacy)</option>
                  <option value="24 Hours">24 Hours (Ephemeral)</option>
                  <option value="Never Store">Never Store on Server</option>
                </select>
              </div>
            </div>

            {/* Box 3: Notification Channels */}
            <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400">notifications</span>
                  Notifications &amp; Multi-Channel Alerts
                </h3>
                <p className="text-xs text-slate-400 mt-1">SMS alerts ensure reliable emergency delivery even when mobile data is weak.</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Push Notifications</span>
                  <span className="text-[11px] text-slate-400 block">Immediate in-app push for ambient safety events.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifySosPush}
                  onChange={e => setNotifySosPush(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Emergency SMS Gateway</span>
                  <span className="text-[11px] text-slate-400 block">Cellular SMS dispatch to trusted contacts with coordinates.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifySosSms}
                  onChange={e => setNotifySosSms(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">SafeScore Drop &amp; Threat Alerts</span>
                  <span className="text-[11px] text-slate-400 block">Vibrate and ring when entering low-lighting or risk corridors.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifySafeScoreDrop}
                  onChange={e => setNotifySafeScoreDrop(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Box 4: Security, Devices & Account Management */}
            <div className="bg-[#111522]/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400">lock_reset</span>
                  Security &amp; Account Controls
                </h3>
                <p className="text-xs text-slate-400 mt-1">Manage active sessions, two-factor authentication, and data export.</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Two-Factor Authentication (2FA)</span>
                  <span className="text-[11px] text-slate-400 block">Require biometric or SMS verification for clearance changes.</span>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorAuth}
                  onChange={e => setTwoFactorAuth(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Units &amp; Regional Formatting</span>
                  <span className="text-[11px] text-slate-400 block">Distance and speed measurements.</span>
                </div>
                <select
                  value={appUnits}
                  onChange={e => setAppUnits(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="Kilometers (km)">Kilometers (km)</option>
                  <option value="Miles (mi)">Miles (mi)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <button
                  onClick={handleExportData}
                  className="bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export My Data (JSON)
                </button>

                <button
                  onClick={() => alert('Account deletion requested. SafeSphere will cryptographically purge all telemetry within 24 hours.')}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
