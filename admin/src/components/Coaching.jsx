// components/Coaching.jsx - Updated with Move to Application button
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GraduationCap, Search, User, Calendar, Clock, Phone,
  Mail, MapPin, BookOpen, Building2, FileText, Save,
  Loader, AlertCircle, CheckCircle, Edit3, ChevronRight,
  RefreshCw, Users, MessageSquare, TrendingUp, Target,
  Award, BarChart, Book, Brain, Zap, Star, Trophy,
  ChevronDown, ArrowRight, Check, Filter, Download,
  PieChart, Activity, AlertTriangle, TrendingDown,
  Clock as ClockIcon, UserCheck, Calendar as CalendarIcon,
  Percent, School, Library, Bookmark, Flag, Send
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const RED = '#E53935';
const RED_DARK = '#B71C1C';
const RED_SOFT = '#FFF5F5';
const RED_MID = '#FFCDD2';

// Coaching types with their score ranges
const COACHING_TYPES = [
  { value: 'IELTS', label: 'IELTS', minScore: 0, maxScore: 9, format: 'Band' },
  { value: 'PTE', label: 'PTE', minScore: 10, maxScore: 90, format: 'Score' },
  { value: 'TOEFL', label: 'TOEFL', minScore: 0, maxScore: 120, format: 'Score' },
  { value: 'GRE', label: 'GRE', minScore: 260, maxScore: 340, format: 'Score' },
  { value: 'GMAT', label: 'GMAT', minScore: 200, maxScore: 800, format: 'Score' },
  { value: 'None', label: 'Not Enrolled', minScore: 0, maxScore: 0, format: '' }
];

// Progress levels
const PROGRESS_LEVELS = [
  { value: 0, label: 'Not Started', color: '#9CA3AF' },
  { value: 25, label: 'Beginner', color: '#F59E0B' },
  { value: 50, label: 'Intermediate', color: '#10B981' },
  { value: 75, label: 'Advanced', color: '#3B82F6' },
  { value: 100, label: 'Ready for Exam', color: '#8B5CF6' }
];

// Helper functions
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set';
const getProgressColor = (progress) => {
  if (progress < 25) return '#9CA3AF';
  if (progress < 50) return '#F59E0B';
  if (progress < 75) return '#10B981';
  if (progress < 100) return '#3B82F6';
  return '#8B5CF6';
};

const getProgressLabel = (progress) => {
  if (progress < 25) return 'Not Started';
  if (progress < 50) return 'Beginner';
  if (progress < 75) return 'Intermediate';
  if (progress < 100) return 'Advanced';
  return 'Ready for Exam';
};

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

// Student Card Component
const StudentCard = ({ lead, isSelected, onClick }) => {
  const coaching = lead.coaching || {};
  const progress = coaching.progress || 0;
  const progressColor = getProgressColor(progress);
  const progressLabel = getProgressLabel(progress);
  
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
            {coaching.coachingType && coaching.coachingType !== 'None' && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0"
                style={{ background: RED_SOFT, color: RED }}>
                {coaching.coachingType}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{lead.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full transition-all" 
                style={{ width: `${progress}%`, background: progressColor }} />
            </div>
            <span className="text-xs font-medium" style={{ color: progressColor }}>
              {progress}%
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400">
              {coaching.currentScore ? `${coaching.currentScore} → ${coaching.targetScore || '?'}` : 'No scores yet'}
            </span>
            {coaching.enrolledDate && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <CalendarIcon className="w-2.5 h-2.5" />
                {fmtDate(coaching.enrolledDate)}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: isSelected ? RED : '#D1D5DB' }} />
      </div>
    </button>
  );
};

// Score Input Component
const ScoreInput = ({ type, value, onChange, label, disabled }) => {
  const config = COACHING_TYPES.find(t => t.value === type);
  if (!config || type === 'None') return null;
  
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label} ({config.format})
      </label>
      <input
        type="number"
        step={type === 'IELTS' ? 0.5 : 1}
        min={config.minScore}
        max={config.maxScore}
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500"
        style={{ borderColor: '#E5E7EB', focusRing: RED }}
      />
    </div>
  );
};

// Main Coaching Component
const CoachingPage = ({ user }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [movingToApplication, setMovingToApplication] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    coachingType: 'None',
    enrolledDate: '',
    coachingCenter: '',
    currentScore: '',
    targetScore: '',
    batchTiming: '',
    instructor: '',
    progress: 0,
    notes: ''
  });

  useEffect(() => {
    fetchCoachingLeads();
  }, []);

  const fetchCoachingLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch leads with coaching status or coaching data
      const res = await axios.get(`${API_URL}/leads?status=coaching&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Also fetch leads that might have coaching data but different status
      const allRes = await axios.get(`${API_URL}/leads?limit=500`,
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Combine leads that are in coaching status OR have coaching data
      const coachingLeads = (res.data.leads || []).concat(
        (allRes.data.leads || []).filter(l => 
          l.coaching?.coachingType && 
          l.coaching.coachingType !== 'None' &&
          l.status !== 'coaching'
        )
      );
      
      // Remove duplicates
      const uniqueLeads = Array.from(new Map(coachingLeads.map(l => [l._id, l])).values());
      setLeads(uniqueLeads);
    } catch (error) {
      console.error('Error fetching coaching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setEditing(false);
    setSaved(false);
    setFormData({
      coachingType: lead.coaching?.coachingType || 'None',
      enrolledDate: lead.coaching?.enrolledDate?.split('T')[0] || '',
      coachingCenter: lead.coaching?.coachingCenter || '',
      currentScore: lead.coaching?.currentScore || '',
      targetScore: lead.coaching?.targetScore || '',
      batchTiming: lead.coaching?.batchTiming || '',
      instructor: lead.coaching?.instructor || '',
      progress: lead.coaching?.progress || 0,
      notes: lead.coaching?.notes || ''
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { coaching: { ...formData } },
        { headers: { Authorization: `Bearer ${token}` } });
      
      setSaved(true);
      setEditing(false);
      
      const updated = { 
        ...selectedLead, 
        coaching: { ...formData },
        status: formData.coachingType !== 'None' && selectedLead.status === 'counselling' ? 'coaching' : selectedLead.status
      };
      setLeads(prev => prev.map(l => l._id === selectedLead._id ? updated : l));
      setSelectedLead(updated);
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving coaching data:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
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
      setLeads(prev => prev.map(l => l._id === selectedLead._id ? updated : l));
      
      // Show success message
      alert(`Student moved to ${newStatus.replace('_', ' ')} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // New function to handle moving to application
  const handleMoveToApplication = async () => {
    if (!selectedLead) return;
    
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to move ${selectedLead.name} to Application stage?\n\n` +
      `This will:\n` +
      `• Move the student to "Application Submitted" status\n` +
      `• Keep all coaching data for reference\n` +
      `• Allow you to track university applications\n\n` +
      `Continue?`
    );
    
    if (!confirmed) return;
    
    setMovingToApplication(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update status to application_submitted
      await axios.put(`${API_URL}/leads/${selectedLead._id}/status`,
        { status: 'application_submitted' },
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Add a note about moving to application
      await axios.post(`${API_URL}/leads/${selectedLead._id}/communications`,
        {
          type: 'other',
          summary: `Student moved from Coaching to Application stage. Coaching completed with ${formData.progress}% progress. Final scores: ${formData.currentScore || 'N/A'} → ${formData.targetScore || 'N/A'}`,
          followUpNeeded: false
        },
        { headers: { Authorization: `Bearer ${token}` } });
      
      // Remove from coaching list
      setLeads(prev => prev.filter(l => l._id !== selectedLead._id));
      setSelectedLead(null);
      
      alert(`${selectedLead.name} has been moved to Application stage successfully!`);
    } catch (error) {
      console.error('Error moving to application:', error);
      alert('Failed to move student to application. Please try again.');
    } finally {
      setMovingToApplication(false);
    }
  };

  // Filter leads based on search and coaching type
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(search.toLowerCase()) ||
                          lead.email?.toLowerCase().includes(search.toLowerCase()) ||
                          lead.phone?.includes(search);
    const matchesType = filterType === 'all' || lead.coaching?.coachingType === filterType;
    return matchesSearch && matchesType;
  });

  // Statistics
  const stats = {
    total: leads.length,
    enrolled: leads.filter(l => l.coaching?.coachingType && l.coaching.coachingType !== 'None').length,
    notEnrolled: leads.filter(l => !l.coaching?.coachingType || l.coaching.coachingType === 'None').length,
    avgProgress: Math.round(leads.reduce((sum, l) => sum + (l.coaching?.progress || 0), 0) / (leads.length || 1)),
    readyForExam: leads.filter(l => (l.coaching?.progress || 0) >= 75).length,
    needsAttention: leads.filter(l => (l.coaching?.progress || 0) < 25 && l.coaching?.coachingType !== 'None').length,
    byType: COACHING_TYPES.reduce((acc, type) => {
      acc[type.value] = leads.filter(l => l.coaching?.coachingType === type.value).length;
      return acc;
    }, {})
  };

  const coachingTypeInfo = COACHING_TYPES.find(t => t.value === formData.coachingType);
  const currentScoreValid = formData.currentScore && coachingTypeInfo && 
    formData.currentScore >= coachingTypeInfo.minScore && 
    formData.currentScore <= coachingTypeInfo.maxScore;
  const targetScoreValid = formData.targetScore && coachingTypeInfo &&
    formData.targetScore >= coachingTypeInfo.minScore &&
    formData.targetScore <= coachingTypeInfo.maxScore;

  // Check if student is ready for application (progress >= 75)
  const isReadyForApplication = formData.progress >= 75;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4 flex-shrink-0">
        <StatCard icon={<Users className="w-4 h-4" />} label="Total Students" value={stats.total}
          subtext={`${stats.enrolled} enrolled`} color={RED} bg={RED_SOFT} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Avg Progress" value={`${stats.avgProgress}%`}
          subtext={`${stats.readyForExam} ready for exam`} color="#10B981" bg="#ECFDF5" />
        <StatCard icon={<AlertCircle className="w-4 h-4" />} label="Needs Attention" value={stats.needsAttention}
          subtext="Progress below 25%" color="#F59E0B" bg="#FFFBEB" />
        <StatCard icon={<Trophy className="w-4 h-4" />} label="IELTS" value={stats.byType.IELTS || 0}
          subtext={`${stats.byType.PTE || 0} PTE`} color="#8B5CF6" bg="#F5F3FF" />
        <StatCard icon={<Book className="w-4 h-4" />} label="GRE/GMAT" value={(stats.byType.GRE || 0) + (stats.byType.GMAT || 0)}
          subtext={`GRE: ${stats.byType.GRE || 0}, GMAT: ${stats.byType.GMAT || 0}`} color="#EC4899" bg="#FDF2F8" />
        <StatCard icon={<Target className="w-4 h-4" />} label="Ready" value={stats.readyForExam}
          subtext="Progress ≥ 75%" color="#3B82F6" bg="#EFF6FF" />
      </div>

      {/* Main Panel */}
      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden shadow-lg border" style={{ borderColor: '#F0F0F0' }}>

        {/* Left Panel - Student List */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r" style={{ borderColor: '#F5F5F5' }}>
          <div className="flex-shrink-0 p-4" style={{ background: `linear-gradient(135deg,${RED_DARK} 0%,${RED} 100%)` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Coaching Students</p>
                <p className="text-red-200 text-xs">{filteredLeads.length} students</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-300" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none text-white placeholder-red-200"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)' }}
              />
            </div>
            
            {/* Filter Dropdown */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-white/15 text-white border border-white/30"
            >
              <option value="all" className="text-gray-900">All Types</option>
              {COACHING_TYPES.filter(t => t.value !== 'None').map(type => (
                <option key={type.value} value={type.value} className="text-gray-900">{type.label}</option>
              ))}
              <option value="None" className="text-gray-900">Not Enrolled</option>
            </select>
          </div>
          
          {/* Student List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="w-5 h-5 animate-spin" style={{ color: RED }} />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                <GraduationCap className="w-12 h-12 mb-3" style={{ color: RED_MID }} />
                <p className="text-sm font-semibold text-gray-400">No coaching students</p>
                <p className="text-xs text-gray-300 mt-1">Move a lead to "Coaching" status or add coaching details</p>
              </div>
            ) : (
              filteredLeads.map(lead => (
                <StudentCard
                  key={lead._id}
                  lead={lead}
                  isSelected={selectedLead?._id === lead._id}
                  onClick={() => selectLead(lead)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Student Details */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: '#FAFAFA' }}>
          {!selectedLead ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5" style={{ background: RED_SOFT }}>
                <Book className="w-12 h-12" style={{ color: RED_MID }} />
              </div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">Select a student</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Click any student from the list to view their coaching progress, scores, and details.
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
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                          style={{ background: RED_SOFT, color: RED }}>{selectedLead.profile}</span>
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
                        
                        {/* Move to Application Button */}
                        <button
                          onClick={handleMoveToApplication}
                          disabled={movingToApplication || !isReadyForApplication}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            isReadyForApplication 
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          title={!isReadyForApplication ? "Student needs to reach 75% progress before moving to application" : "Move to Application stage"}
                        >
                          {movingToApplication ? (
                            <Loader className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Move to Application
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Warning if not ready for application */}
                {!isReadyForApplication && formData.coachingType !== 'None' && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 border border-yellow-200">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs text-yellow-700">
                      Student needs to reach 75% progress before moving to application stage.
                      Current progress: {formData.progress}%
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Overview Bar */}
              <div className="flex-shrink-0 bg-white border-b px-6 py-4" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Progress</span>
                  <span className="text-sm font-bold" style={{ color: getProgressColor(formData.progress) }}>
                    {formData.progress}% - {getProgressLabel(formData.progress)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${formData.progress}%`, background: getProgressColor(formData.progress) }} />
                </div>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-5">
                  
                  {/* Coaching Type Selection */}
                  <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                        <Target className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">Coaching Program</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Coaching Type</label>
                        {editing ? (
                          <select
                            value={formData.coachingType}
                            onChange={(e) => handleChange('coachingType', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E5E7EB' }}
                          >
                            {COACHING_TYPES.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {COACHING_TYPES.find(t => t.value === formData.coachingType)?.label || 'Not Enrolled'}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Enrolled Date</label>
                        {editing ? (
                          <input
                            type="date"
                            value={formData.enrolledDate}
                            onChange={(e) => handleChange('enrolledDate', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {fmtDate(formData.enrolledDate)}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Coaching Center</label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.coachingCenter}
                            onChange={(e) => handleChange('coachingCenter', e.target.value)}
                            placeholder="e.g., British Council, Kaplan, etc."
                            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{ borderColor: '#E5E7EB' }}
                          />
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                            {formData.coachingCenter || 'Not specified'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scores Section */}
                  {formData.coachingType !== 'None' && (
                    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                          <BarChart className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-800">Scores & Progress</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <ScoreInput
                          type={formData.coachingType}
                          value={formData.currentScore}
                          onChange={(v) => handleChange('currentScore', v)}
                          label="Current Score"
                          disabled={!editing}
                        />
                        <ScoreInput
                          type={formData.coachingType}
                          value={formData.targetScore}
                          onChange={(v) => handleChange('targetScore', v)}
                          label="Target Score"
                          disabled={!editing}
                        />
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Progress (%)</label>
                          {editing ? (
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={formData.progress}
                                onChange={(e) => handleChange('progress', parseInt(e.target.value))}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium min-w-[45px]">{formData.progress}%</span>
                            </div>
                          ) : (
                            <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                              {formData.progress}% - {getProgressLabel(formData.progress)}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Gap to Target</label>
                          <div className="px-3 py-2 rounded-lg bg-gray-50">
                            {formData.currentScore && formData.targetScore ? (
                              <span className={formData.targetScore - formData.currentScore > 0 ? 'text-orange-600' : 'text-green-600'}>
                                {formData.targetScore - formData.currentScore > 0 ? '+' : ''}
                                {(formData.targetScore - formData.currentScore).toFixed(formData.coachingType === 'IELTS' ? 1 : 0)}
                                {' '}{coachingTypeInfo?.format} to target
                              </span>
                            ) : (
                              <span className="text-gray-400">Enter scores to see gap</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {formData.coachingType !== 'None' && (
                    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#F0F0F0' }}>
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: '#F5F5F5' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: RED_SOFT, color: RED }}>
                          <ClockIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-800">Schedule & Notes</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Batch Timing</label>
                          {editing ? (
                            <input
                              type="text"
                              value={formData.batchTiming}
                              onChange={(e) => handleChange('batchTiming', e.target.value)}
                              placeholder="e.g., Morning 9-11 AM"
                              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: '#E5E7EB' }}
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                              {formData.batchTiming || 'Not scheduled'}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Instructor</label>
                          {editing ? (
                            <input
                              type="text"
                              value={formData.instructor}
                              onChange={(e) => handleChange('instructor', e.target.value)}
                              placeholder="Instructor name"
                              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: '#E5E7EB' }}
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900">
                              {formData.instructor || 'Not assigned'}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Notes / Remarks</label>
                          {editing ? (
                            <textarea
                              rows={4}
                              value={formData.notes}
                              onChange={(e) => handleChange('notes', e.target.value)}
                              placeholder="Coaching progress notes, areas of improvement, etc."
                              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 resize-none"
                              style={{ borderColor: '#E5E7EB' }}
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-lg bg-gray-50 text-gray-900 min-h-[80px] whitespace-pre-wrap">
                              {formData.notes || 'No notes added yet.'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 bg-white border-t" style={{ borderColor: '#F0F0F0' }}>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        coachingType: selectedLead.coaching?.coachingType || 'None',
                        enrolledDate: selectedLead.coaching?.enrolledDate?.split('T')[0] || '',
                        coachingCenter: selectedLead.coaching?.coachingCenter || '',
                        currentScore: selectedLead.coaching?.currentScore || '',
                        targetScore: selectedLead.coaching?.targetScore || '',
                        batchTiming: selectedLead.coaching?.batchTiming || '',
                        instructor: selectedLead.coaching?.instructor || '',
                        progress: selectedLead.coaching?.progress || 0,
                        notes: selectedLead.coaching?.notes || ''
                      });
                    }}
                    className="px-5 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                    style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
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

export default CoachingPage;