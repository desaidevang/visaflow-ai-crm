import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GraduationCap, Search, User, Calendar, Clock, Phone,
  Mail, MapPin, BookOpen, Building2, FileText, Save,
  Loader, AlertCircle, CheckCircle, Edit3, ChevronRight,
  RefreshCw, Users, MessageSquare, AlertTriangle,
  ChevronDown, ArrowRight, Check
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const RED      = '#E53935';
const RED_DARK = '#B71C1C';
const RED_SOFT = '#FFF5F5';
const RED_MID  = '#FFCDD2';

/* ─── pipeline stages ─────────────────────────────── */
const STAGES = [
  { value: 'new',                   label: 'New',           short: 'New' },
  { value: 'contacted',             label: 'Contacted',     short: 'Contacted' },
  { value: 'counselling',           label: 'Counselling',   short: 'Counselling' },
  { value: 'coaching',              label: 'Coaching',      short: 'Coaching' },
  { value: 'documentation',         label: 'Documentation', short: 'Docs' },
  { value: 'visa_process',          label: 'Visa Process',  short: 'Visa' },
  { value: 'interview',             label: 'Interview',     short: 'Interview' },
  { value: 'application_submitted', label: 'App Submitted', short: 'Applied' },
  { value: 'offer_received',        label: 'Offer Received',short: 'Offer' },
  { value: 'visa_granted',          label: 'Visa Granted',  short: 'Granted' },
  { value: 'travel_arranged',       label: 'Travel',        short: 'Travel' },
  { value: 'converted',             label: 'Converted',     short: 'Done' },
];

const TERMINAL = [
  { value: 'lost',    label: 'Lost' },
  { value: 'on_hold', label: 'On Hold' },
];

const stageIndex = (s) => STAGES.findIndex(x => x.value === s);

/* ─── helpers ─────────────────────────────────────── */
const fmtDate   = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const isOverdue = (d) => d && new Date(d) < new Date();

/* ─── tiny UI atoms ───────────────────────────────── */
const StatChip = ({ icon, label, value, color, bg }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
    style={{ background: bg, border: `1px solid ${color}33` }}>
    <div style={{ color }}>{icon}</div>
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-xl font-bold leading-none" style={{ color }}>{value}</p>
    </div>
  </div>
);

const ContactItem = ({ icon, text }) => (
  <span className="flex items-center gap-1 text-xs text-gray-400">{icon}{text}</span>
);

const InfoPill = ({ icon, label, value, alert }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
    style={{ background: alert ? '#FEF2F2' : RED_SOFT, borderColor: alert ? '#FECACA' : RED_MID, color: alert ? '#B91C1C' : RED }}>
    {icon}
    <span className="text-gray-400">{label}:</span>
    <span className="font-semibold">{value || 'Not set'}</span>
    {alert && <AlertCircle className="w-3 h-3" />}
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>{icon}</div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const FormField = ({ label, icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
      <span style={{ color: RED }}>{icon}</span>{label}
    </label>
    {children}
  </div>
);

const ReadValue = ({ value, placeholder, alert, alertText }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm min-h-[38px]"
    style={{ background: '#F9FAFB', color: '#111827' }}>
    {value
      ? <>{value}{alert && <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-1"
          style={{ background: '#FEE2E2', color: '#DC2626' }}>{alertText}</span>}</>
      : <span className="text-gray-300">{placeholder}</span>}
  </div>
);

const LeadRow = ({ lead, isSelected, onClick }) => {
  const overdue        = isOverdue(lead.counselling?.followUpDate);
  const hasCounselling = lead.counselling?.counsellor || lead.counselling?.counsellingDate;
  return (
    <button onClick={onClick}
      className="w-full text-left px-4 py-3.5 transition-all border-b"
      style={{ borderColor: '#F5F5F5', background: isSelected ? RED_SOFT : 'white',
               borderLeft: isSelected ? `3px solid ${RED}` : '3px solid transparent' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: isSelected ? `linear-gradient(135deg,${RED_DARK},${RED})` : RED_MID,
                   color: isSelected ? 'white' : RED }}>
          {lead.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
            {overdue && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 ml-1" title="Follow-up overdue" />}
          </div>
          <p className="text-xs text-gray-400 truncate">{lead.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <MapPin className="w-2.5 h-2.5" />{lead.destination}
            </span>
            {hasCounselling
              ? <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: RED_SOFT, color: RED }}>
                  {lead.counselling.counsellor || 'Active'}
                </span>
              : <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#FFFBEB', color: '#D97706' }}>
                  Needs setup
                </span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: isSelected ? RED : '#D1D5DB' }} />
      </div>
    </button>
  );
};

/* ─── Pipeline bar ────────────────────────────────── */
const PipelineBar = ({ currentStatus, onStatusChange, updating }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const curIdx = stageIndex(currentStatus);
  const isTerminal = TERMINAL.some(t => t.value === currentStatus);

  // show a sliding window of stages around current
  const windowSize  = 6;
  const start       = Math.max(0, Math.min(curIdx - 2, STAGES.length - windowSize));
  const visibleStages = STAGES.slice(start, start + windowSize);

  return (
    <div className="flex-shrink-0 bg-white border-b px-6 py-3" style={{ borderColor: '#F0F0F0' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pipeline Stage</p>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(p => !p)}
            disabled={updating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-gray-50"
            style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
          >
            {updating ? <Loader className="w-3 h-3 animate-spin" /> : null}
            Move to…
            <ChevronDown className="w-3 h-3" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border z-50 min-w-[180px] py-1 overflow-hidden"
              style={{ borderColor: '#F0F0F0' }}>
              <p className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b"
                style={{ borderColor: '#F5F5F5' }}>Active stages</p>
              {STAGES.map(s => (
                <button key={s.value}
                  onClick={() => { onStatusChange(s.value); setShowDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm transition-all hover:bg-red-50 flex items-center justify-between"
                  style={{ color: s.value === currentStatus ? RED : '#374151',
                           fontWeight: s.value === currentStatus ? 700 : 400 }}>
                  {s.label}
                  {s.value === currentStatus && <Check className="w-3.5 h-3.5" style={{ color: RED }} />}
                </button>
              ))}
              <p className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-b"
                style={{ borderColor: '#F5F5F5' }}>Close</p>
              {TERMINAL.map(s => (
                <button key={s.value}
                  onClick={() => { onStatusChange(s.value); setShowDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm transition-all flex items-center justify-between"
                  style={{ color: s.value === currentStatus ? '#DC2626' : '#6B7280',
                           fontWeight: s.value === currentStatus ? 700 : 400 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  {s.label}
                  {s.value === currentStatus && <Check className="w-3.5 h-3.5 text-red-500" />}
                </button>
              ))}
            </div>
          )}
          {showDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          )}
        </div>
      </div>

      {/* Visual progress strip */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {visibleStages.map((stage, i) => {
          const sIdx    = stageIndex(stage.value);
          const isDone  = !isTerminal && sIdx < curIdx;
          const isCur   = stage.value === currentStatus;
          const isFuture= sIdx > curIdx;
          return (
            <React.Fragment key={stage.value}>
              <button
                onClick={() => onStatusChange(stage.value)}
                disabled={updating}
                title={stage.label}
                className="flex flex-col items-center gap-1 flex-shrink-0 transition-all hover:opacity-80 disabled:cursor-not-allowed"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: isCur ? RED : isDone ? '#D1FAE5' : '#F3F4F6',
                    color:      isCur ? 'white' : isDone ? '#065F46' : '#9CA3AF',
                    border:     isCur ? `2px solid ${RED_DARK}` : isDone ? '2px solid #6EE7B7' : '2px solid #E5E7EB',
                    boxShadow:  isCur ? `0 0 0 3px ${RED_MID}` : 'none',
                  }}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : sIdx + 1}
                </div>
                <span className="text-xs font-medium whitespace-nowrap"
                  style={{ color: isCur ? RED : isDone ? '#059669' : '#9CA3AF' }}>
                  {stage.short}
                </span>
              </button>
              {i < visibleStages.length - 1 && (
                <div className="h-0.5 flex-1 rounded-full min-w-[16px]"
                  style={{ background: isDone && stageIndex(visibleStages[i + 1].value) <= curIdx ? '#6EE7B7' : '#F3F4F6' }} />
              )}
            </React.Fragment>
          );
        })}

        {/* terminal status badges */}
        {isTerminal && (
          <div className="ml-2 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: '#FEF2F2', color: '#B91C1C', border: '1.5px solid #FECACA' }}>
            {TERMINAL.find(t => t.value === currentStatus)?.label}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── main component ─────────────────────────────── */
const CounsellingPage = ({ user }) => {
  const [leads, setLeads]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [counsellors, setCounsellors]   = useState([]);
  const [editing, setEditing]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [formData, setFormData]         = useState(emptyForm());

  function emptyForm() {
    return { counsellor: '', counsellingDate: '', interestedCourse: '', preferredUniversity: '', notes: '', followUpDate: '' };
  }

  useEffect(() => { fetchLeads(); fetchCounsellors(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/leads?status=counselling&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } });
      setLeads(res.data.leads || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCounsellors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/users/counsellors`,
        { headers: { Authorization: `Bearer ${token}` } });
      setCounsellors(res.data || []);
    } catch {}
  };

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setEditing(false);
    setSaved(false);
    setFormData({ ...emptyForm(), ...(lead.counselling || {}) });
  };

  const handleChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));

  const handleSave = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { counselling: { ...formData } },
        { headers: { Authorization: `Bearer ${token}` } });
      setSaved(true); setEditing(false);
      const updated = { ...selectedLead, counselling: { ...formData } };
      setLeads(p => p.map(l => l._id === selectedLead._id ? updated : l));
      setSelectedLead(updated);
      setTimeout(() => setSaved(false), 3000);
    } catch { alert('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ ...emptyForm(), ...(selectedLead?.counselling || {}) });
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedLead || newStatus === selectedLead.status) return;
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } });
      const updated = { ...selectedLead, status: newStatus };
      setSelectedLead(updated);
      // if the lead moved OUT of counselling, remove from list
      if (newStatus !== 'counselling') {
        setLeads(p => p.filter(l => l._id !== selectedLead._id));
        setSelectedLead(null); // clear panel
      } else {
        setLeads(p => p.map(l => l._id === selectedLead._id ? updated : l));
      }
    } catch { alert('Failed to update status. Please try again.'); }
    finally { setUpdatingStatus(false); }
  };

  const filtered = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search));

  const overdueFollowUp = isOverdue(formData.followUpDate);
  const needsSetup      = leads.filter(l => !l.counselling?.counsellor).length;
  const overdueCount    = leads.filter(l => isOverdue(l.counselling?.followUpDate)).length;

  /* controlled field components */
  const fStyle = { border: '1.5px solid #E5E7EB', borderRadius: 10 };
  const fFocus = { borderColor: RED, boxShadow: `0 0 0 3px ${RED_SOFT}` };
  const fClass = 'w-full px-3 py-2 rounded-xl text-sm outline-none bg-white text-gray-900 transition-all';

  const FInput = ({ type = 'text', value, onChange, placeholder, alert }) => {
    const [f, setF] = useState(false);
    return <input type={type} className={fClass} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ ...fStyle, ...(f ? fFocus : {}), ...(alert ? { borderColor: '#F87171' } : {}) }} />;
  };

  const FSelect = ({ value, onChange, children }) => {
    const [f, setF] = useState(false);
    return <select className={fClass} value={value} onChange={e => onChange(e.target.value)}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ ...fStyle, ...(f ? fFocus : {}) }}>{children}</select>;
  };

  const FTextarea = ({ value, onChange, placeholder }) => {
    const [f, setF] = useState(false);
    return <textarea rows={5} className={fClass} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ ...fStyle, ...(f ? fFocus : {}), resize: 'vertical' }} />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]"
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* stats bar */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <StatChip icon={<Users className="w-4 h-4" />} label="In Counselling" value={leads.length} color={RED} bg={RED_SOFT} />
        <StatChip icon={<AlertTriangle className="w-4 h-4" />} label="Needs Setup" value={needsSetup} color="#D97706" bg="#FFFBEB" />
        <StatChip icon={<Clock className="w-4 h-4" />} label="Overdue Follow-ups" value={overdueCount} color="#DC2626" bg="#FEF2F2" />
        <div className="ml-auto">
          <button onClick={fetchLeads}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-sm"
            style={{ background: RED_SOFT, color: RED }}>
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </button>
        </div>
      </div>

      {/* two-panel */}
      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden shadow-lg border" style={{ borderColor: '#F0F0F0' }}>

        {/* LEFT */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r" style={{ borderColor: '#F5F5F5' }}>
          <div className="flex-shrink-0 p-4"
            style={{ background: `linear-gradient(135deg,${RED_DARK} 0%,${RED} 100%)` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">In Counselling</p>
                <p className="text-red-200 text-xs">{filtered.length} leads</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-300 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, phone…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="w-5 h-5 animate-spin" style={{ color: RED }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                <GraduationCap className="w-12 h-12 mb-3" style={{ color: RED_MID }} />
                <p className="text-sm font-semibold text-gray-400">No counselling leads</p>
                <p className="text-xs text-gray-300 mt-1">Move a lead to "Counselling" status from the Leads page</p>
              </div>
            ) : (
              filtered.map(lead => (
                <LeadRow key={lead._id} lead={lead}
                  isSelected={selectedLead?._id === lead._id}
                  onClick={() => selectLead(lead)} />
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: '#FAFAFA' }}>
          {!selectedLead ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5" style={{ background: RED_SOFT }}>
                <GraduationCap className="w-12 h-12" style={{ color: RED_MID }} />
              </div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">Select a lead</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Click any lead from the pipeline to view their details, update counselling info, or move them to the next stage.
              </p>
            </div>
          ) : (
            <>
              {/* lead header */}
              <div className="flex-shrink-0 bg-white border-b px-6 py-4" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
                      {selectedLead.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-gray-900">{selectedLead.name}</h2>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <ContactItem icon={<Mail className="w-3 h-3" />} text={selectedLead.email} />
                        <ContactItem icon={<Phone className="w-3 h-3" />} text={selectedLead.phone} />
                        <ContactItem icon={<MapPin className="w-3 h-3" />}
                          text={`${selectedLead.country} → ${selectedLead.destination}`} />
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                          style={{ background: RED_SOFT, color: RED }}>{selectedLead.profile}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {saved && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                        <CheckCircle className="w-3.5 h-3.5" />Saved!
                      </span>
                    )}
                    {!editing && user?.role !== 'visitor' && (
                      <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg"
                        style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
                        <Edit3 className="w-3.5 h-3.5" />Edit Details
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <InfoPill icon={<User className="w-3 h-3" />} label="Counsellor" value={formData.counsellor} />
                  <InfoPill icon={<Calendar className="w-3 h-3" />} label="Session"
                    value={formData.counsellingDate ? fmtDate(formData.counsellingDate) : null} />
                  <InfoPill icon={<Clock className="w-3 h-3" />} label="Follow-up"
                    value={formData.followUpDate ? fmtDate(formData.followUpDate) : null}
                    alert={overdueFollowUp} />
                  <InfoPill icon={<BookOpen className="w-3 h-3" />} label="Course" value={formData.interestedCourse} />
                </div>
              </div>

              {/* ── PIPELINE BAR ── */}
              <PipelineBar
                currentStatus={selectedLead.status}
                onStatusChange={handleStatusChange}
                updating={updatingStatus}
              />

              {/* status change notice */}
              {updatingStatus && (
                <div className="flex-shrink-0 flex items-center gap-2 px-6 py-2 text-sm font-medium"
                  style={{ background: RED_SOFT, color: RED }}>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Updating pipeline stage…
                </div>
              )}

              {/* form body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto space-y-5">

                  {overdueFollowUp && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold"
                      style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' }}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      Follow-up date is overdue — please reschedule.
                    </div>
                  )}

                  <SectionCard title="Counselling Details" icon={<GraduationCap className="w-4 h-4" />}>
                    <div className="grid grid-cols-2 gap-4">

                      <FormField label="Counsellor" icon={<User className="w-3.5 h-3.5" />}>
                        {editing
                          ? counsellors.length > 0
                            ? <FSelect value={formData.counsellor} onChange={v => handleChange('counsellor', v)}>
                                <option value="">Select counsellor…</option>
                                {counsellors.map(c => (
                                  <option key={c._id} value={c.name}>
                                    {c.name}{c.specialization?.length ? ` · ${c.specialization.join(', ')}` : ''}
                                  </option>
                                ))}
                              </FSelect>
                            : <FInput value={formData.counsellor} onChange={v => handleChange('counsellor', v)} placeholder="Counsellor name" />
                          : <ReadValue value={formData.counsellor} placeholder="Not assigned" />}
                      </FormField>

                      <FormField label="Session Date" icon={<Calendar className="w-3.5 h-3.5" />}>
                        {editing
                          ? <FInput type="date" value={formData.counsellingDate?.split('T')[0] || ''} onChange={v => handleChange('counsellingDate', v)} />
                          : <ReadValue value={formData.counsellingDate ? fmtDate(formData.counsellingDate) : null} placeholder="Not scheduled" />}
                      </FormField>

                      <FormField label="Interested Course" icon={<BookOpen className="w-3.5 h-3.5" />}>
                        {editing
                          ? <FInput value={formData.interestedCourse} onChange={v => handleChange('interestedCourse', v)} placeholder="e.g. MBA, Computer Science" />
                          : <ReadValue value={formData.interestedCourse} placeholder="Not specified" />}
                      </FormField>

                      <FormField label="Preferred University" icon={<Building2 className="w-3.5 h-3.5" />}>
                        {editing
                          ? <FInput value={formData.preferredUniversity} onChange={v => handleChange('preferredUniversity', v)} placeholder="e.g. Univ. of Toronto" />
                          : <ReadValue value={formData.preferredUniversity} placeholder="Not specified" />}
                      </FormField>

                      <FormField label="Follow-up Date" icon={<Clock className="w-3.5 h-3.5" />}>
                        {editing
                          ? <FInput type="date" value={formData.followUpDate?.split('T')[0] || ''} onChange={v => handleChange('followUpDate', v)} alert={overdueFollowUp} />
                          : <ReadValue value={formData.followUpDate ? fmtDate(formData.followUpDate) : null} placeholder="Not scheduled" alert={overdueFollowUp} alertText="Overdue" />}
                      </FormField>
                    </div>

                    <div className="mt-4">
                      <FormField label="Session Notes" icon={<FileText className="w-3.5 h-3.5" />}>
                        {editing
                          ? <FTextarea value={formData.notes} onChange={v => handleChange('notes', v)} placeholder="Key discussion points, student goals, next steps…" />
                          : <div className="px-3 py-2.5 rounded-xl text-sm min-h-[90px] whitespace-pre-wrap leading-relaxed"
                              style={{ background: '#F9FAFB', color: '#111827' }}>
                              {formData.notes || <span className="text-gray-300">No notes yet.</span>}
                            </div>}
                      </FormField>
                    </div>
                  </SectionCard>

                  {selectedLead?.notes?.length > 0 && (
                    <SectionCard title="Activity Log" icon={<MessageSquare className="w-4 h-4" />}>
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        {[...selectedLead.notes].reverse().slice(0, 10).map((n, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: n.noteType === 'important' ? RED : '#E5E7EB' }} />
                            <div>
                              <p className="text-sm text-gray-700">{n.note}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {n.createdBy?.name && <span className="font-semibold">{n.createdBy.name} · </span>}
                                {fmtDate(n.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                </div>
              </div>

              {/* save bar */}
              {editing && (
                <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 bg-white border-t" style={{ borderColor: '#F0F0F0' }}>
                  <button onClick={handleCancel}
                    className="px-5 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                    style={{ borderColor: '#E5E7EB', color: '#6B7280' }}>
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounsellingPage;