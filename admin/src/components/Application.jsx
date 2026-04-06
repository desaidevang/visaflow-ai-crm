// components/Application.jsx
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
  University, FileCheck, ClipboardList, UserPlus, X
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const RED = '#E53935';
const RED_DARK = '#B71C1C';
const RED_SOFT = '#FFF5F5';
const RED_MID = '#FFCDD2';

// Visa type options with their target components
const VISA_TYPES = [
  { 
    value: 'student_visa', 
    label: 'Student Visa', 
    icon: GraduationCap, 
    color: '#3B82F6', 
    bg: '#EFF6FF',
    description: 'For students pursuing education abroad',
    targetStatus: 'student_visa'
  },
  { 
    value: 'dependent_visa', 
    label: 'Dependent Visa', 
    icon: Heart, 
    color: '#EC4899', 
    bg: '#FDF2F8',
    description: 'For family members of primary visa holder',
    targetStatus: 'dependent_visa'
  },
  { 
    value: 'work_visa', 
    label: 'Work Visa', 
    icon: Briefcase, 
    color: '#10B981', 
    bg: '#ECFDF5',
    description: 'For employment opportunities abroad',
    targetStatus: 'work_visa'
  },
  { 
    value: 'visitor_visa', 
    label: 'Visitor Visa', 
    icon: Plane, 
    color: '#F59E0B', 
    bg: '#FFFBEB',
    description: 'For tourism and short visits',
    targetStatus: 'visitor_visa'
  },
  { 
    value: 'business_visa', 
    label: 'Business Visa', 
    icon: Building2, 
    color: '#8B5CF6', 
    bg: '#F5F3FF',
    description: 'For business trips and meetings',
    targetStatus: 'business_visa'
  },
  { 
    value: 'family_visa', 
    label: 'Family Visa', 
    icon: Home, 
    color: '#EF4444', 
    bg: '#FEF2F2',
    description: 'For family reunification',
    targetStatus: 'family_visa'
  }
];

// Application status options
const APPLICATION_STATUS = [
  { value: 'draft', label: 'Draft', color: '#9CA3AF' },
  { value: 'submitted', label: 'Submitted', color: '#3B82F6' },
  { value: 'under_review', label: 'Under Review', color: '#F59E0B' },
  { value: 'offer_received', label: 'Offer Received', color: '#10B981' },
  { value: 'offer_accepted', label: 'Offer Accepted', color: '#8B5CF6' },
  { value: 'visa_applied', label: 'Visa Applied', color: '#EC4899' },
  { value: 'visa_granted', label: 'Visa Granted', color: '#059669' },
  { value: 'rejected', label: 'Rejected', color: '#EF4444' }
];

// Helper functions
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set';

// Stat Card Component
const StatCard = ({ icon, label, value, subtext, color, bg }) => (
  <div className="rounded-xl p-4 border" style={{ background: bg, borderColor: `${color}20` }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
    </div>
  </div>
);

// Application Card Component
const ApplicationCard = ({ lead, isSelected, onClick }) => {
  const application = lead.application || {};
  const statusInfo = APPLICATION_STATUS.find(s => s.value === application.status) || APPLICATION_STATUS[0];
  
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
            {application.universityName && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0"
                style={{ background: RED_SOFT, color: RED }}>
                {application.universityName.slice(0, 15)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{lead.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium`}
              style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
            {application.intakeDate && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <CalendarIcon className="w-2.5 h-2.5" />
                {fmtDate(application.intakeDate)}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: isSelected ? RED : '#D1D5DB' }} />
      </div>
    </button>
  );
};

// Visa Type Modal Component
const VisaTypeModal = ({ isOpen, onClose, onConfirm, selectedVisaType, setSelectedVisaType, movingToVisa, leadName }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Move to Visa Process</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Select visa type for <span className="font-semibold text-gray-700">{leadName}</span>
          </p>
        </div>
        
        <div className="p-6 space-y-3">
          {VISA_TYPES.map(visa => (
            <button
              key={visa.value}
              onClick={() => setSelectedVisaType(visa.value)}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                selectedVisaType === visa.value 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: visa.bg, color: visa.color }}>
                  <visa.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{visa.label}</p>
                    {selectedVisaType === visa.value && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{visa.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedVisaType || movingToVisa}
            className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {movingToVisa ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Moving...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Move to Visa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Application Component
const ApplicationPage = ({ user, onNavigateToVisa }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [movingToVisa, setMovingToVisa] = useState(false);
  const [showVisaModal, setShowVisaModal] = useState(false);
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    universityName: '',
    courseName: '',
    intakeDate: '',
    applicationFee: '',
    applicationDate: '',
    status: 'draft',
    offerLetterReceived: false,
    offerLetterDate: '',
    acceptanceDeadline: '',
    scholarship: {
      awarded: false,
      amount: '',
      scholarshipName: ''
    },
    notes: ''
  });

  useEffect(() => {
    fetchApplicationLeads();
  }, []);

  const fetchApplicationLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch leads with application_submitted status or have application data
      const res = await axios.get(`${API_URL}/leads?status=application_submitted&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Also fetch leads that might have application data but different status
      const allRes = await axios.get(`${API_URL}/leads?limit=500`,
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Combine leads that are in application status OR have application data
      const applicationLeads = (res.data.leads || []).concat(
        (allRes.data.leads || []).filter(l => 
          l.application?.universityName && 
          l.status !== 'application_submitted'
        )
      );
      
      // Remove duplicates
      const uniqueLeads = Array.from(new Map(applicationLeads.map(l => [l._id, l])).values());
      setLeads(uniqueLeads);
    } catch (error) {
      console.error('Error fetching application leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setEditing(false);
    setSaved(false);
    setFormData({
      universityName: lead.application?.universityName || '',
      courseName: lead.application?.courseName || '',
      intakeDate: lead.application?.intakeDate?.split('T')[0] || '',
      applicationFee: lead.application?.applicationFee || '',
      applicationDate: lead.application?.applicationDate?.split('T')[0] || '',
      status: lead.application?.status || 'draft',
      offerLetterReceived: lead.application?.offerLetterReceived || false,
      offerLetterDate: lead.application?.offerLetterDate?.split('T')[0] || '',
      acceptanceDeadline: lead.application?.acceptanceDeadline?.split('T')[0] || '',
      scholarship: {
        awarded: lead.application?.scholarship?.awarded || false,
        amount: lead.application?.scholarship?.amount || '',
        scholarshipName: lead.application?.scholarship?.scholarshipName || ''
      },
      notes: lead.application?.notes || ''
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScholarshipChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      scholarship: { ...prev.scholarship, [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { application: { ...formData } },
        { headers: { Authorization: `Bearer ${token}` } });
      
      setSaved(true);
      setEditing(false);
      
      const updated = { 
        ...selectedLead, 
        application: { ...formData }
      };
      setLeads(prev => prev.map(l => l._id === selectedLead._id ? updated : l));
      setSelectedLead(updated);
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving application data:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveToVisa = async () => {
    if (!selectedLead || !selectedVisaType) return;
    
    const visaInfo = VISA_TYPES.find(v => v.value === selectedVisaType);
    
    setMovingToVisa(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update the visa type in the lead's visa object
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { 
          visa: { 
            visaType: selectedVisaType,
            applicationId: selectedLead.application?.applicationId || `APP-${Date.now()}`,
            status: 'pending'
          },
          status: 'visa_process'
        },
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Add communication record
      await axios.post(`${API_URL}/leads/${selectedLead._id}/communications`,
        {
          type: 'other',
          summary: `Moved to ${visaInfo?.label} process. University: ${selectedLead.application?.universityName || 'N/A'}, Course: ${selectedLead.application?.courseName || 'N/A'}`,
          followUpNeeded: true,
          followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Remove from application list
      setLeads(prev => prev.filter(l => l._id !== selectedLead._id));
      setSelectedLead(null);
      setShowVisaModal(false);
      setSelectedVisaType('');
      
      // Show success message with visa type
      alert(`${selectedLead.name} has been moved to ${visaInfo?.label} process successfully!`);
      
      // Optional: Navigate to the specific visa page if callback provided
      if (onNavigateToVisa) {
        onNavigateToVisa(selectedVisaType, selectedLead._id);
      }
    } catch (error) {
      console.error('Error moving to visa:', error);
      alert('Failed to move to visa process. Please try again.');
    } finally {
      setMovingToVisa(false);
    }
  };

  // Filter leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(search.toLowerCase()) ||
                          lead.email?.toLowerCase().includes(search.toLowerCase()) ||
                          lead.phone?.includes(search) ||
                          lead.application?.universityName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.application?.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    total: leads.length,
    byStatus: APPLICATION_STATUS.reduce((acc, status) => {
      acc[status.value] = leads.filter(l => l.application?.status === status.value).length;
      return acc;
    }, {}),
    totalOffers: leads.filter(l => l.application?.offerLetterReceived === true).length,
    withScholarship: leads.filter(l => l.application?.scholarship?.awarded === true).length,
    totalApplicationFee: leads.reduce((sum, l) => sum + (parseFloat(l.application?.applicationFee) || 0), 0)
  };

  const statusInfo = APPLICATION_STATUS.find(s => s.value === formData.status) || APPLICATION_STATUS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 flex-shrink-0">
        <StatCard icon={<Users className="w-4 h-4" />} label="Total Applications" value={stats.total}
          subtext={`${stats.byStatus.submitted || 0} submitted`} color={RED} bg={RED_SOFT} />
        <StatCard icon={<Trophy className="w-4 h-4" />} label="Offers Received" value={stats.totalOffers}
          subtext={`${stats.withScholarship} with scholarship`} color="#10B981" bg="#ECFDF5" />
        <StatCard icon={<DollarSign className="w-4 h-4" />} label="Total Fees" value={`$${stats.totalApplicationFee.toLocaleString()}`}
          subtext="Application fees collected" color="#F59E0B" bg="#FFFBEB" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Under Review" value={stats.byStatus.under_review || 0}
          subtext={`${stats.byStatus.offer_received || 0} with offers`} color="#8B5CF6" bg="#F5F3FF" />
      </div>

      {/* Main Panel */}
      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden shadow-lg border" style={{ borderColor: '#F0F0F0' }}>

        {/* Left Panel - Application List */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r" style={{ borderColor: '#F5F5F5' }}>
          <div className="flex-shrink-0 p-4" style={{ background: `linear-gradient(135deg,${RED_DARK} 0%,${RED} 100%)` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <University className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Applications</p>
                <p className="text-red-200 text-xs">{filteredLeads.length} applications</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-300" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, university..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none text-white placeholder-red-200"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)' }}
              />
            </div>
            
            {/* Filter Dropdown */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-white/15 text-white border border-white/30"
            >
              <option value="all">All Status</option>
              {APPLICATION_STATUS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          {/* Application List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="w-5 h-5 animate-spin" style={{ color: RED }} />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                <University className="w-12 h-12 mb-3" style={{ color: RED_MID }} />
                <p className="text-sm font-semibold text-gray-400">No applications</p>
                <p className="text-xs text-gray-300 mt-1">Move leads from Coaching to start applications</p>
              </div>
            ) : (
              filteredLeads.map(lead => (
                <ApplicationCard
                  key={lead._id}
                  lead={lead}
                  isSelected={selectedLead?._id === lead._id}
                  onClick={() => selectLead(lead)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Application Details */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: '#FAFAFA' }}>
          {!selectedLead ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5" style={{ background: RED_SOFT }}>
                <University className="w-12 h-12" style={{ color: RED_MID }} />
              </div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">Select an application</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Click any application from the list to view details, manage university applications, or move to visa processing.
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
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />{selectedLead.destination}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {saved && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5" />Saved!
                      </span>
                    )}
                    {!editing && user?.role !== 'visitor' && (
                      <>
                        <button onClick={() => setEditing(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                          style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
                          <Edit3 className="w-3.5 h-3.5" />Edit Details
                        </button>
                        
                        {/* Move to Visa Button */}
                        <button
                          onClick={() => setShowVisaModal(true)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Move to Visa
                        </button>
                      </>
                    )}
                    {editing && (
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(false)}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all">
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                          style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
                          {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge Bar */}
              <div className="flex-shrink-0 bg-white border-b px-6 py-3" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Application Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold`}
                    style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                  {formData.offerLetterReceived && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      Offer Received 🎉
                    </span>
                  )}
                  {formData.scholarship?.awarded && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                      Scholarship: ${formData.scholarship.amount}
                    </span>
                  )}
                </div>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-5">
                  
                  {/* University & Course Details */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <University className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">University & Course Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">University Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.universityName}
                            onChange={(e) => handleChange('universityName', e.target.value)}
                            placeholder="e.g., University of Toronto"
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {formData.universityName || 'Not specified'}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Course/Program Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.courseName}
                            onChange={(e) => handleChange('courseName', e.target.value)}
                            placeholder="e.g., Master of Computer Science"
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {formData.courseName || 'Not specified'}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Intake Date</label>
                        {editing ? (
                          <input
                            type="date"
                            value={formData.intakeDate}
                            onChange={(e) => handleChange('intakeDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {fmtDate(formData.intakeDate)}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Application Fee ($)</label>
                        {editing ? (
                          <input
                            type="number"
                            value={formData.applicationFee}
                            onChange={(e) => handleChange('applicationFee', e.target.value)}
                            placeholder="e.g., 100"
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {formData.applicationFee ? `$${formData.applicationFee}` : 'Not paid'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Application Timeline */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Timeline & Status</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Application Date</label>
                        {editing ? (
                          <input
                            type="date"
                            value={formData.applicationDate}
                            onChange={(e) => handleChange('applicationDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {fmtDate(formData.applicationDate)}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Application Status</label>
                        {editing ? (
                          <select
                            value={formData.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{ borderColor: '#E5E7EB' }}
                          >
                            {APPLICATION_STATUS.map(status => (
                              <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50" style={{ color: statusInfo.color }}>
                            {statusInfo.label}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Offer Letter Date</label>
                        {editing ? (
                          <input
                            type="date"
                            value={formData.offerLetterDate}
                            onChange={(e) => handleChange('offerLetterDate', e.target.value)}
                            disabled={!formData.offerLetterReceived}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {fmtDate(formData.offerLetterDate)}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Acceptance Deadline</label>
                        {editing ? (
                          <input
                            type="date"
                            value={formData.acceptanceDeadline}
                            onChange={(e) => handleChange('acceptanceDeadline', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {fmtDate(formData.acceptanceDeadline)}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.offerLetterReceived}
                            onChange={(e) => handleChange('offerLetterReceived', e.target.checked)}
                            disabled={!editing}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Offer Letter Received</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Scholarship Section */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <Award className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Scholarship Information</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.scholarship?.awarded}
                          onChange={(e) => handleScholarshipChange('awarded', e.target.checked)}
                          disabled={!editing}
                          className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Scholarship Awarded</span>
                      </label>
                      
                      {formData.scholarship?.awarded && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Scholarship Name</label>
                            {editing ? (
                              <input
                                type="text"
                                value={formData.scholarship?.scholarshipName}
                                onChange={(e) => handleScholarshipChange('scholarshipName', e.target.value)}
                                placeholder="e.g., Merit Scholarship"
                                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{ borderColor: '#E5E7EB' }}
                              />
                            ) : (
                              <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                                {formData.scholarship?.scholarshipName || 'Not specified'}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Amount ($)</label>
                            {editing ? (
                              <input
                                type="number"
                                value={formData.scholarship?.amount}
                                onChange={(e) => handleScholarshipChange('amount', e.target.value)}
                                placeholder="e.g., 5000"
                                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500"
                                style={{ borderColor: '#E5E7EB' }}
                              />
                            ) : (
                              <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                                {formData.scholarship?.amount ? `$${formData.scholarship.amount}` : 'Not specified'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Additional Notes</h3>
                    </div>
                    
                    {editing ? (
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Add any additional notes about the application, special requirements, or important details..."
                        rows="4"
                        className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                        style={{ borderColor: '#E5E7EB' }}
                      />
                    ) : (
                      <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-700 min-h-[100px] whitespace-pre-wrap">
                        {formData.notes || 'No additional notes added.'}
                      </div>
                    )}
                  </div>

                  {/* Application Summary Card */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardList className="w-4 h-4 text-red-600" />
                      <h3 className="text-sm font-bold text-gray-800">Application Summary</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Student Name</p>
                        <p className="font-medium text-gray-900">{selectedLead.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Target Country</p>
                        <p className="font-medium text-gray-900">{selectedLead.destination || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">University</p>
                        <p className="font-medium text-gray-900">{formData.universityName || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Course</p>
                        <p className="font-medium text-gray-900">{formData.courseName || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Intake</p>
                        <p className="font-medium text-gray-900">{fmtDate(formData.intakeDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="font-medium" style={{ color: statusInfo.color }}>{statusInfo.label}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Visa Type Selection Modal */}
      <VisaTypeModal
        isOpen={showVisaModal}
        onClose={() => {
          setShowVisaModal(false);
          setSelectedVisaType('');
        }}
        onConfirm={handleMoveToVisa}
        selectedVisaType={selectedVisaType}
        setSelectedVisaType={setSelectedVisaType}
        movingToVisa={movingToVisa}
        leadName={selectedLead?.name}
      />
    </div>
  );
};

export default ApplicationPage;