// components/StudentVisa.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    GraduationCap, Search, User, Calendar, Clock, Phone,
    Mail, MapPin, BookOpen, Building2, FileText, Save,
    Loader, AlertCircle, CheckCircle, Edit3, ChevronRight,
    RefreshCw, Users, MessageSquare, TrendingUp, Target,
    Award, BarChart, Book, Send, DollarSign, CreditCard,
    ChevronDown, ArrowRight, Check, Filter, Download,
    PieChart, Activity, AlertTriangle, TrendingDown,
    Clock as ClockIcon, UserCheck, Calendar as CalendarIcon,
    Percent, School, Library, Bookmark, Flag, Briefcase,
    Plane, Home, Heart, Shield, Star, Trophy, Globe,
    University, FileCheck, ClipboardList, UserPlus, X,
    Banknote, Stethoscope, History, FileCheck as VerifyIcon,
    
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const RED = '#E53935';
const RED_DARK = '#B71C1C';
const RED_SOFT = '#FFF5F5';
const RED_MID = '#FFCDD2';

const StudentVisa = ({ user, selectedLeadId, onBack }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    visaType: 'student_visa',
    appliedDate: '',
    visaOffice: '',
    applicationId: '',
    biometricsDate: '',
    interviewDate: '',
    decisionDate: '',
    decision: 'pending',
    financialDocuments: {
      bankStatement: false,
      itrDocuments: false,
      sponsorshipLetter: false,
      loanSanction: false,
      amountShown: '',
      notes: ''
    },
    passportDetails: {
      passportNumber: '',
      issueDate: '',
      expiryDate: '',
      placeOfIssue: ''
    },
    previousVisaHistory: [],
    medicalExam: {
      completed: false,
      examDate: '',
      hospitalName: '',
      reportStatus: '',
      notes: ''
    },
    additionalInfo: {
      ieltsScore: '',
      ieltsType: '',
      gapExplanation: '',
      backlogs: '',
      travelHistory: ''
    }
  });

  useEffect(() => {
    fetchVisaLeads();
  }, []);

  useEffect(() => {
    if (selectedLeadId && leads.length > 0) {
      const lead = leads.find(l => l._id === selectedLeadId);
      if (lead) selectLead(lead);
    }
  }, [selectedLeadId, leads]);

  const fetchVisaLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/leads?status=visa_process&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Also fetch leads with student visa type
      const allRes = await axios.get(`${API_URL}/leads?limit=500`,
        { headers: { Authorization: `Bearer ${token}` } });
      
      const visaLeads = (res.data.leads || []).concat(
        (allRes.data.leads || []).filter(l => 
          l.visa?.visaType === 'student_visa' && 
          l.status !== 'visa_process'
        )
      );
      
      const uniqueLeads = Array.from(new Map(visaLeads.map(l => [l._id, l])).values());
      setLeads(uniqueLeads);
    } catch (error) {
      console.error('Error fetching visa leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setEditing(false);
    setSaved(false);
    const visa = lead.visa || {};
    setFormData({
      visaType: visa.visaType || 'student_visa',
      appliedDate: visa.appliedDate?.split('T')[0] || '',
      visaOffice: visa.visaOffice || '',
      applicationId: visa.applicationId || '',
      biometricsDate: visa.biometricsDate?.split('T')[0] || '',
      interviewDate: visa.interviewDate?.split('T')[0] || '',
      decisionDate: visa.decisionDate?.split('T')[0] || '',
      decision: visa.decision || 'pending',
      financialDocuments: {
        bankStatement: visa.financialDocuments?.bankStatement || false,
        itrDocuments: visa.financialDocuments?.itrDocuments || false,
        sponsorshipLetter: visa.financialDocuments?.sponsorshipLetter || false,
        loanSanction: visa.financialDocuments?.loanSanction || false,
        amountShown: visa.financialDocuments?.amountShown || '',
        notes: visa.financialDocuments?.notes || ''
      },
      passportDetails: {
        passportNumber: visa.passportDetails?.passportNumber || '',
        issueDate: visa.passportDetails?.issueDate?.split('T')[0] || '',
        expiryDate: visa.passportDetails?.expiryDate?.split('T')[0] || '',
        placeOfIssue: visa.passportDetails?.placeOfIssue || ''
      },
      previousVisaHistory: visa.previousVisaHistory || [],
      medicalExam: {
        completed: visa.medicalExam?.completed || false,
        examDate: visa.medicalExam?.examDate?.split('T')[0] || '',
        hospitalName: visa.medicalExam?.hospitalName || '',
        reportStatus: visa.medicalExam?.reportStatus || '',
        notes: visa.medicalExam?.notes || ''
      },
      additionalInfo: {
        ieltsScore: visa.additionalInfo?.ieltsScore || '',
        ieltsType: visa.additionalInfo?.ieltsType || '',
        gapExplanation: visa.additionalInfo?.gapExplanation || '',
        backlogs: visa.additionalInfo?.backlogs || '',
        travelHistory: visa.additionalInfo?.travelHistory || ''
      }
    });
  };

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(v => v.trim())
    }));
  };

  const handleSave = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { visa: formData },
        { headers: { Authorization: `Bearer ${token}` } });
      
      setSaved(true);
      setEditing(false);
      
      const updated = { ...selectedLead, visa: formData };
      setLeads(prev => prev.map(l => l._id === selectedLead._id ? updated : l));
      setSelectedLead(updated);
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving visa data:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveVisa = async () => {
    if (!selectedLead) return;
    
    if (!window.confirm(`Are you sure you want to approve the student visa for ${selectedLead.name}?`)) return;
    
    setApproving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update visa decision to approved
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { 
          visa: { 
            ...formData,
            decision: 'approved',
            decisionDate: new Date().toISOString().split('T')[0]
          },
          status: 'visa_granted'
        },
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Add communication record
      await axios.post(`${API_URL}/leads/${selectedLead._id}/communications`,
        {
          type: 'other',
          summary: `Student Visa APPROVED! Visa granted on ${new Date().toLocaleDateString()}`,
          followUpNeeded: false
        },
        { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`✅ Student Visa APPROVED for ${selectedLead.name}!`);
      
      // Refresh data
      fetchVisaLeads();
      setSelectedLead(null);
    } catch (error) {
      console.error('Error approving visa:', error);
      alert('Failed to approve visa. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectVisa = async () => {
    if (!selectedLead) return;
    
    const reason = prompt('Please enter reason for visa rejection:');
    if (!reason) return;
    
    if (!window.confirm(`Are you sure you want to REJECT the student visa for ${selectedLead.name}?`)) return;
    
    setApproving(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { 
          visa: { 
            ...formData,
            decision: 'rejected',
            decisionDate: new Date().toISOString().split('T')[0]
          },
          status: 'lost'
        },
        { headers: { Authorization: `Bearer ${token}` } });
      
      await axios.post(`${API_URL}/leads/${selectedLead._id}/communications`,
        {
          type: 'other',
          summary: `Student Visa REJECTED. Reason: ${reason}`,
          followUpNeeded: false
        },
        { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`❌ Student Visa REJECTED for ${selectedLead.name}`);
      
      fetchVisaLeads();
      setSelectedLead(null);
    } catch (error) {
      console.error('Error rejecting visa:', error);
      alert('Failed to reject visa. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(search.toLowerCase()) ||
                          lead.email?.toLowerCase().includes(search.toLowerCase()) ||
                          lead.visa?.applicationId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.visa?.decision === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    pending: leads.filter(l => l.visa?.decision === 'pending').length,
    approved: leads.filter(l => l.visa?.decision === 'approved').length,
    rejected: leads.filter(l => l.visa?.decision === 'rejected').length
  };

  const VisaCard = ({ lead, isSelected, onClick }) => {
    const visa = lead.visa || {};
    const decisionColor = visa.decision === 'approved' ? '#10B981' : visa.decision === 'rejected' ? '#EF4444' : '#F59E0B';
    const decisionBg = visa.decision === 'approved' ? '#ECFDF5' : visa.decision === 'rejected' ? '#FEF2F2' : '#FFFBEB';
    
    return (
      <button onClick={onClick}
        className="w-full text-left p-4 transition-all border-b hover:bg-gray-50"
        style={{ 
          borderColor: '#F0F0F0', 
          background: isSelected ? RED_SOFT : 'white',
          borderLeft: isSelected ? `3px solid ${RED}` : '3px solid transparent'
        }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
            {lead.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
              {visa.applicationId && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0"
                  style={{ background: RED_SOFT, color: RED }}>
                  {visa.applicationId.slice(0, 10)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{lead.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium`}
                style={{ background: decisionBg, color: decisionColor }}>
                {visa.decision === 'approved' ? '✅ Approved' : visa.decision === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
              </span>
              {visa.appliedDate && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <CalendarIcon className="w-2.5 h-2.5" />
                  Applied: {new Date(visa.appliedDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: isSelected ? RED : '#D1D5DB' }} />
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Visa Management</h1>
                <p className="text-sm text-gray-500">Manage student visa applications, track biometrics, interviews, and approvals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-4 flex-shrink-0">
        <div className="rounded-xl p-4 border" style={{ background: RED_SOFT, borderColor: `${RED}20` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold mt-1" style={{ color: RED }}>{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${RED}15`, color: RED }}>
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: '#FFFBEB', borderColor: '#F59E0B20' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#F59E0B' }}>{stats.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#F59E0B15', color: '#F59E0B' }}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: '#ECFDF5', borderColor: '#10B98120' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#10B981' }}>{stats.approved}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#10B98115', color: '#10B981' }}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: '#FEF2F2', borderColor: '#EF444420' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#EF4444' }}>{stats.rejected}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#EF444415', color: '#EF4444' }}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden shadow-lg border" style={{ borderColor: '#F0F0F0' }}>

        {/* Left Panel - Visa List */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r" style={{ borderColor: '#F5F5F5' }}>
          <div className="flex-shrink-0 p-4" style={{ background: `linear-gradient(135deg,${RED_DARK} 0%,${RED} 100%)` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Student Visas</p>
                <p className="text-red-200 text-xs">{filteredLeads.length} applications</p>
              </div>
            </div>
            
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-300" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, application ID..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none text-white placeholder-red-200"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)' }}
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-white/15 text-white border border-white/30"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="w-5 h-5 animate-spin" style={{ color: RED }} />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                <GraduationCap className="w-12 h-12 mb-3" style={{ color: RED_MID }} />
                <p className="text-sm font-semibold text-gray-400">No student visa applications</p>
                <p className="text-xs text-gray-300 mt-1">Move applications from Application stage to start visa process</p>
              </div>
            ) : (
              filteredLeads.map(lead => (
                <VisaCard
                  key={lead._id}
                  lead={lead}
                  isSelected={selectedLead?._id === lead._id}
                  onClick={() => selectLead(lead)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Visa Details */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: '#FAFAFA' }}>
          {!selectedLead ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5" style={{ background: RED_SOFT }}>
                <GraduationCap className="w-12 h-12" style={{ color: RED_MID }} />
              </div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">Select a student visa application</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Click any application from the list to view and manage student visa details, track biometrics, interviews, and approve visas.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
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
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />{selectedLead.email}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />{selectedLead.phone}
                        </span>
                        {selectedLead.application?.universityName && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <University className="w-3 h-3" />{selectedLead.application.universityName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {saved && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5" />Saved!
                      </span>
                    )}
                    {!editing && formData.decision === 'pending' && user?.role !== 'visitor' && (
                      <>
                        <button onClick={() => setEditing(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                          style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
                          <Edit3 className="w-3.5 h-3.5" />Edit Details
                        </button>
                        <button onClick={handleApproveVisa} disabled={approving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition-all disabled:opacity-50">
                          {approving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve Visa
                        </button>
                        <button onClick={handleRejectVisa} disabled={approving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg transition-all disabled:opacity-50">
                          <X className="w-3.5 h-3.5" />
                          Reject Visa
                        </button>
                      </>
                    )}
                    {editing && (
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(false)}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50">
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                          style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
                          {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0 bg-white border-b px-6 py-3" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visa Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold`}
                    style={{ 
                      background: formData.decision === 'approved' ? '#ECFDF5' : formData.decision === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                      color: formData.decision === 'approved' ? '#10B981' : formData.decision === 'rejected' ? '#EF4444' : '#F59E0B'
                    }}>
                    {formData.decision === 'approved' ? '✅ APPROVED' : formData.decision === 'rejected' ? '❌ REJECTED' : '⏳ PENDING REVIEW'}
                  </span>
                  {formData.decisionDate && (
                    <span className="text-xs text-gray-400">Decision Date: {new Date(formData.decisionDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-5">
                  
                  {/* Application Details */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Application Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Application ID</label>
                        {editing ? (
                          <input type="text" value={formData.applicationId} onChange={(e) => handleChange(null, 'applicationId', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm">{formData.applicationId || 'Not assigned'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Visa Office</label>
                        {editing ? (
                          <input type="text" value={formData.visaOffice} onChange={(e) => handleChange(null, 'visaOffice', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.visaOffice || 'Not specified'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Applied Date</label>
                        {editing ? (
                          <input type="date" value={formData.appliedDate} onChange={(e) => handleChange(null, 'appliedDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.appliedDate ? new Date(formData.appliedDate).toLocaleDateString() : 'Not set'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Biometrics Date</label>
                        {editing ? (
                          <input type="date" value={formData.biometricsDate} onChange={(e) => handleChange(null, 'biometricsDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.biometricsDate ? new Date(formData.biometricsDate).toLocaleDateString() : 'Not scheduled'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Interview Date</label>
                        {editing ? (
                          <input type="date" value={formData.interviewDate} onChange={(e) => handleChange(null, 'interviewDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.interviewDate ? new Date(formData.interviewDate).toLocaleDateString() : 'Not scheduled'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Passport Details */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Passport Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Passport Number</label>
                        {editing ? (
                          <input type="text" value={formData.passportDetails.passportNumber} onChange={(e) => handleChange('passportDetails', 'passportNumber', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900 font-mono">{formData.passportDetails.passportNumber || 'Not provided'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Place of Issue</label>
                        {editing ? (
                          <input type="text" value={formData.passportDetails.placeOfIssue} onChange={(e) => handleChange('passportDetails', 'placeOfIssue', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.passportDetails.placeOfIssue || 'Not specified'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Issue Date</label>
                        {editing ? (
                          <input type="date" value={formData.passportDetails.issueDate} onChange={(e) => handleChange('passportDetails', 'issueDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.passportDetails.issueDate ? new Date(formData.passportDetails.issueDate).toLocaleDateString() : 'Not set'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Date</label>
                        {editing ? (
                          <input type="date" value={formData.passportDetails.expiryDate} onChange={(e) => handleChange('passportDetails', 'expiryDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.passportDetails.expiryDate ? new Date(formData.passportDetails.expiryDate).toLocaleDateString() : 'Not set'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Documents */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Financial Documents</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={formData.financialDocuments.bankStatement} onChange={(e) => handleChange('financialDocuments', 'bankStatement', e.target.checked)} disabled={!editing}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Bank Statement</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={formData.financialDocuments.itrDocuments} onChange={(e) => handleChange('financialDocuments', 'itrDocuments', e.target.checked)} disabled={!editing}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">ITR Documents</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={formData.financialDocuments.sponsorshipLetter} onChange={(e) => handleChange('financialDocuments', 'sponsorshipLetter', e.target.checked)} disabled={!editing}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Sponsorship Letter</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={formData.financialDocuments.loanSanction} onChange={(e) => handleChange('financialDocuments', 'loanSanction', e.target.checked)} disabled={!editing}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                          <span className="text-sm text-gray-700">Loan Sanction Letter</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Amount Shown ($)</label>
                          {editing ? (
                            <input type="number" value={formData.financialDocuments.amountShown} onChange={(e) => handleChange('financialDocuments', 'amountShown', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                          ) : (
                            <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">${formData.financialDocuments.amountShown || '0'}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Exam */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Medical Examination</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.medicalExam.completed} onChange={(e) => handleChange('medicalExam', 'completed', e.target.checked)} disabled={!editing}
                          className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                        <span className="text-sm text-gray-700">Medical Exam Completed</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Exam Date</label>
                          {editing ? (
                            <input type="date" value={formData.medicalExam.examDate} onChange={(e) => handleChange('medicalExam', 'examDate', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                          ) : (
                            <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.medicalExam.examDate ? new Date(formData.medicalExam.examDate).toLocaleDateString() : 'Not scheduled'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Hospital Name</label>
                          {editing ? (
                            <input type="text" value={formData.medicalExam.hospitalName} onChange={(e) => handleChange('medicalExam', 'hospitalName', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                          ) : (
                            <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.medicalExam.hospitalName || 'Not specified'}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                      
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Additional Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">IELTS Score</label>
                        {editing ? (
                          <input type="text" value={formData.additionalInfo.ieltsScore} onChange={(e) => handleChange('additionalInfo', 'ieltsScore', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.additionalInfo.ieltsScore || 'Not provided'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">IELTS Type</label>
                        {editing ? (
                          <select value={formData.additionalInfo.ieltsType} onChange={(e) => handleChange('additionalInfo', 'ieltsType', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="">Select</option>
                            <option value="academic">Academic</option>
                            <option value="general">General Training</option>
                          </select>
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.additionalInfo.ieltsType || 'Not specified'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Number of Backlogs</label>
                        {editing ? (
                          <input type="text" value={formData.additionalInfo.backlogs} onChange={(e) => handleChange('additionalInfo', 'backlogs', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.additionalInfo.backlogs || 'None'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Gap Explanation</label>
                        {editing ? (
                          <input type="text" value={formData.additionalInfo.gapExplanation} onChange={(e) => handleChange('additionalInfo', 'gapExplanation', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">{formData.additionalInfo.gapExplanation || 'No gap'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visa Summary */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardList className="w-4 h-4 text-red-600" />
                      <h3 className="text-sm font-bold text-gray-800">Visa Application Summary</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Student Name</p>
                        <p className="font-medium text-gray-900">{selectedLead.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Application ID</p>
                        <p className="font-medium font-mono text-gray-900">{formData.applicationId || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Visa Status</p>
                        <p className="font-medium" style={{ color: formData.decision === 'approved' ? '#10B981' : formData.decision === 'rejected' ? '#EF4444' : '#F59E0B' }}>
                          {formData.decision === 'approved' ? 'Approved' : formData.decision === 'rejected' ? 'Rejected' : 'Pending'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">University</p>
                        <p className="font-medium text-gray-900">{selectedLead.application?.universityName || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentVisa;