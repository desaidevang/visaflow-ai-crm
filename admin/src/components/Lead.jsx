// components/Lead.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, X, CheckCircle, Clock,
  AlertCircle, Phone, Mail, MapPin, Calendar, DollarSign,
  FileText, MessageCircle, Upload, Download, Star,
  TrendingUp, UserPlus, Briefcase, GraduationCap, Plane,
  Building, BookOpen, Users2, School, Heart, ThumbsUp,
  Award, Target, Zap, Shield, MoreVertical, ArrowUpRight,
  ArrowDownRight, BarChart, PieChart, Settings, HelpCircle,
  FolderKanban, GitBranch, Library, UserCheck, Home,
  Ticket, FolderTree, LogIn, MessageSquare, CreditCard,
  FileCheck, ClipboardList, UserCircle, PhoneCall, Video,
  Clock as ClockIcon, Calendar as CalendarIcon, CheckSquare,
  AlertTriangle, Info, RefreshCw, Loader
} from 'lucide-react';
import axios from 'axios';
import BasicInfoTab from './BasicInfoTab'
const API_URL =  'http://localhost:5000/api';

const Lead = ({ user }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, edit, add
  const [filters, setFilters] = useState({
    status: '',
    profile: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    destination: '',
    profile: 'student',
    message: '',
    status: 'new',
    counselling: {},
    coaching: {},
    documentation: { documentsReceived: [], documentsPending: [] },
    visa: {},
    application: {},
    financial: { serviceFee: 0, paidAmount: 0, payments: [] },
    notes: [],
    communications: []
  });
const [counsellors, setCounsellors] = useState([]);

// Add function to fetch counsellors:
const fetchCounsellors = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/counsellors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCounsellors(response.data);
  } catch (error) {
    console.error('Error fetching counsellors:', error);
  }
};

  // Fetch leads with filters
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.profile) params.append('profile', filters.profile);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      
      const response = await axios.get(`${API_URL}/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data.leads);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leads/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
     fetchCounsellors(); // Add this line
  }, [filters]);

  // Handle lead creation
  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/leads/submit`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeads();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  // Handle lead update
  // Handle lead update - Save ALL changes including counselling
// Handle lead update - Save ALL changes at once
// Handle lead update - Save only changed fields
// Handle lead update - Save ALL changes including basic info
const handleUpdateLead = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Prepare update data - Include ALL fields
    const updateData = {};
    
    // Include basic info fields
    if (formData.name !== undefined) updateData.name = formData.name;
    if (formData.email !== undefined) updateData.email = formData.email;
    if (formData.phone !== undefined) updateData.phone = formData.phone;
    if (formData.country !== undefined) updateData.country = formData.country;
    if (formData.destination !== undefined) updateData.destination = formData.destination;
    if (formData.profile !== undefined) updateData.profile = formData.profile;
    if (formData.message !== undefined) updateData.message = formData.message;
    if (formData.status !== undefined) updateData.status = formData.status;
    
    // Include counselling if it has values
    if (formData.counselling && Object.keys(formData.counselling).length > 0) {
      const hasValues = Object.values(formData.counselling).some(v => v && v !== '');
      if (hasValues) {
        updateData.counselling = formData.counselling;
      }
    }
    
    // Include coaching if it has values
    if (formData.coaching && Object.keys(formData.coaching).length > 0) {
      const hasValues = Object.values(formData.coaching).some(v => v && v !== '' && v !== 'None');
      if (hasValues) {
        updateData.coaching = formData.coaching;
      }
    }
    
    // Include visa if it has values
    if (formData.visa && Object.keys(formData.visa).length > 0) {
      const hasValues = Object.values(formData.visa).some(v => v && v !== '' && v !== 'pending');
      if (hasValues) {
        updateData.visa = formData.visa;
      }
    }
    
    console.log('Sending update data:', updateData);
    
    // Send all updates in one request
    await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`, 
      updateData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    fetchLeads();
    setShowModal(false);
    setModalMode('view');
    
  } catch (error) {
    console.error('Error updating lead:', error);
    alert('Failed to save changes. Please try again.');
  }
};
  // Handle delete lead
  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle counselling update
  const handleCounsellingUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/counselling`, 
        formData.counselling,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating counselling:', error);
    }
  };

  // Handle coaching update
  const handleCoachingUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/coaching`, 
        formData.coaching,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating coaching:', error);
    }
  };

  // Handle visa update
  const handleVisaUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/visa`, 
        formData.visa,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating visa:', error);
    }
  };

  // Handle add communication
  const handleAddCommunication = async (communication) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/leads/${selectedLead._id}/communications`, 
        communication,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
      const updatedLead = await axios.get(`${API_URL}/leads/${selectedLead._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedLead(updatedLead.data);
    } catch (error) {
      console.error('Error adding communication:', error);
    }
  };

  // Handle add payment
  const handleAddPayment = async (payment) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/leads/${selectedLead._id}/payments`, 
        payment,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeads();
      const updatedLead = await axios.get(`${API_URL}/leads/${selectedLead._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedLead(updatedLead.data);
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      country: '',
      destination: '',
      profile: 'student',
      message: '',
      status: 'new',
      counselling: {},
      coaching: {},
      documentation: { documentsReceived: [], documentsPending: [] },
      visa: {},
      application: {},
      financial: { serviceFee: 0, paidAmount: 0, payments: [] },
      notes: [],
      communications: []
    });
  };

  const openModal = (lead = null, mode = 'view') => {
    if (lead) {
      setSelectedLead(lead);
      setFormData(lead);
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-indigo-100 text-indigo-700',
      counselling: 'bg-purple-100 text-purple-700',
      coaching: 'bg-green-100 text-green-700',
      documentation: 'bg-yellow-100 text-yellow-700',
      visa_process: 'bg-orange-100 text-orange-700',
      interview: 'bg-pink-100 text-pink-700',
      application_submitted: 'bg-cyan-100 text-cyan-700',
      offer_received: 'bg-teal-100 text-teal-700',
      visa_granted: 'bg-emerald-100 text-emerald-700',
      travel_arranged: 'bg-sky-100 text-sky-700',
      converted: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700',
      on_hold: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getProfileIcon = (profile) => {
    const icons = {
      student: GraduationCap,
      professional: Briefcase,
      business: Building,
      tourist: Plane
    };
    return icons[profile] || Users;
  };
// Inside Lead component, add these handlers
const handleInputChange = useCallback((field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
}, []);

const handleCounsellingChange = useCallback((field, value) => {
  setFormData(prev => ({
    ...prev,
    counselling: { ...prev.counselling, [field]: value }
  }));
}, []);
  // Status options for dropdown
  // Move statusOptions outside component
const statusOptions = [
  { value: 'new', label: 'New Lead' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'counselling', label: 'Counselling' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'visa_process', label: 'Visa Process' },
  { value: 'interview', label: 'Interview' },
  { value: 'application_submitted', label: 'Application Submitted' },
  { value: 'offer_received', label: 'Offer Received' },
  { value: 'visa_granted', label: 'Visa Granted' },
  { value: 'travel_arranged', label: 'Travel Arranged' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
  { value: 'on_hold', label: 'On Hold' }
];

  // Lead Card Component
  const LeadCard = ({ lead }) => {
    const ProfileIcon = getProfileIcon(lead.profile);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center text-white font-bold">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{lead.name}</h3>
                <p className="text-xs text-gray-500">{lead.email}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => openModal(lead, 'view')}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <Eye className="w-4 h-4 text-gray-500" />
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => handleDeleteLead(lead._id)}
                  className="p-1 hover:bg-red-100 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{lead.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{lead.country} → {lead.destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <ProfileIcon className="w-3 h-3 text-gray-500" />
              <span className="text-xs capitalize text-gray-600">{lead.profile}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
              {statusOptions.find(s => s.value === lead.status)?.label || lead.status}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(lead.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {user?.role !== 'visitor' && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <select
                value={lead.status}
                onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                className="w-full text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };



  const CounsellingTab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Counsellor Name</label>
        {modalMode === 'view' ? (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {formData.counselling?.counsellor || '-'}
          </p>
        ) : (
          <select
            value={formData.counselling?.counsellor || ''}
            onChange={(e) => setFormData({
              ...formData, 
              counselling: {...formData.counselling, counsellor: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">Select Counsellor</option>
            {counsellors.map(counsellor => (
              <option key={counsellor._id} value={counsellor.name}>
                {counsellor.name} {counsellor.specialization?.length > 0 ? `(${counsellor.specialization.join(', ')})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Counselling Date</label>
        {modalMode === 'view' ? (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {formData.counselling?.counsellingDate ? new Date(formData.counselling.counsellingDate).toLocaleDateString() : '-'}
          </p>
        ) : (
          <input
            type="date"
            value={formData.counselling?.counsellingDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({
              ...formData, 
              counselling: {...formData.counselling, counsellingDate: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interested Course</label>
        {modalMode === 'view' ? (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formData.counselling?.interestedCourse || '-'}</p>
        ) : (
          <input
            type="text"
            value={formData.counselling?.interestedCourse || ''}
            onChange={(e) => setFormData({
              ...formData, 
              counselling: {...formData.counselling, interestedCourse: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred University</label>
        {modalMode === 'view' ? (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formData.counselling?.preferredUniversity || '-'}</p>
        ) : (
          <input
            type="text"
            value={formData.counselling?.preferredUniversity || ''}
            onChange={(e) => setFormData({
              ...formData, 
              counselling: {...formData.counselling, preferredUniversity: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        )}
      </div>
      
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        {modalMode === 'view' ? (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap">{formData.counselling?.notes || '-'}</p>
        ) : (
          <textarea
            value={formData.counselling?.notes || ''}
            onChange={(e) => setFormData({
              ...formData, 
              counselling: {...formData.counselling, notes: e.target.value}
            })}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
        {modalMode === 'view' ? (
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
            {formData.counselling?.followUpDate ? new Date(formData.counselling.followUpDate).toLocaleDateString() : '-'}
          </p>
        ) : (
          <input
            type="date"
            value={formData.counselling?.followUpDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({
              ...formData, 
              counselling: {...formData.counselling, followUpDate: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        )}
      </div>
    </div>
  </div>
);

  const CoachingTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coaching Type</label>
          <select
            value={formData.coaching?.coachingType || 'None'}
            onChange={(e) => setFormData({
              ...formData, 
              coaching: {...formData.coaching, coachingType: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          >
            <option value="None">None</option>
            <option value="IELTS">IELTS</option>
            <option value="PTE">PTE</option>
            <option value="TOEFL">TOEFL</option>
            <option value="GRE">GRE</option>
            <option value="GMAT">GMAT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enrolled Date</label>
          <input
            type="date"
            value={formData.coaching?.enrolledDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({
              ...formData, 
              coaching: {...formData.coaching, enrolledDate: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Score</label>
          <input
            type="number"
            value={formData.coaching?.currentScore || ''}
            onChange={(e) => setFormData({
              ...formData, 
              coaching: {...formData.coaching, currentScore: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Score</label>
          <input
            type="number"
            value={formData.coaching?.targetScore || ''}
            onChange={(e) => setFormData({
              ...formData, 
              coaching: {...formData.coaching, targetScore: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Coaching Center</label>
          <input
            type="text"
            value={formData.coaching?.coachingCenter || ''}
            onChange={(e) => setFormData({
              ...formData, 
              coaching: {...formData.coaching, coachingCenter: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.coaching?.progress || ''}
            onChange={(e) => setFormData({
              ...formData, 
              coaching: {...formData.coaching, progress: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
      </div>
    </div>
  );

  const VisaTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
          <input
            type="text"
            value={formData.visa?.visaType || ''}
            onChange={(e) => setFormData({
              ...formData, 
              visa: {...formData.visa, visaType: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application ID</label>
          <input
            type="text"
            value={formData.visa?.applicationId || ''}
            onChange={(e) => setFormData({
              ...formData, 
              visa: {...formData.visa, applicationId: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
          <input
            type="date"
            value={formData.visa?.appliedDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({
              ...formData, 
              visa: {...formData.visa, appliedDate: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Biometrics Date</label>
          <input
            type="date"
            value={formData.visa?.biometricsDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({
              ...formData, 
              visa: {...formData.visa, biometricsDate: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
          <input
            type="text"
            value={formData.visa?.passportDetails?.passportNumber || ''}
            onChange={(e) => setFormData({
              ...formData, 
              visa: {
                ...formData.visa, 
                passportDetails: {...formData.visa?.passportDetails, passportNumber: e.target.value}
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry</label>
          <input
            type="date"
            value={formData.visa?.passportDetails?.expiryDate?.split('T')[0] || ''}
            onChange={(e) => setFormData({
              ...formData, 
              visa: {
                ...formData.visa, 
                passportDetails: {...formData.visa?.passportDetails, expiryDate: e.target.value}
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Visa Decision</label>
          <select
            value={formData.visa?.decision || 'pending'}
            onChange={(e) => setFormData({
              ...formData, 
              visa: {...formData.visa, decision: e.target.value}
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            disabled={modalMode === 'view'}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="refused">Refused</option>
          </select>
        </div>
      </div>
    </div>
  );

  const CommunicationsTab = () => (
    <div className="space-y-4">
      {modalMode !== 'view' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Add New Communication</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Summary"
              id="commSummary"
              className="px-3 py-2 border rounded-lg"
            />
            <select id="commType" className="px-3 py-2 border rounded-lg">
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="meeting">Meeting</option>
            </select>
            <div className="col-span-2">
              <button
                onClick={() => {
                  const summary = document.getElementById('commSummary').value;
                  const type = document.getElementById('commType').value;
                  if (summary) {
                    handleAddCommunication({ summary, type, followUpNeeded: false });
                    document.getElementById('commSummary').value = '';
                  }
                }}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Add Communication
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Communication History</h4>
        {selectedLead?.communications?.map((comm, idx) => (
          <div key={idx} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase">{comm.type}</span>
              <span className="text-xs text-gray-400">{new Date(comm.date).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-700">{comm.summary}</p>
            {comm.followUpNeeded && (
              <p className="text-xs text-orange-600 mt-2">Follow-up: {new Date(comm.followUpDate).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const PaymentsTab = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Service Fee</p>
            <p className="text-xl font-bold text-gray-800">${formData.financial?.serviceFee || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Paid Amount</p>
            <p className="text-xl font-bold text-green-600">${formData.financial?.paidAmount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-xl font-bold text-orange-600">
              ${(formData.financial?.serviceFee || 0) - (formData.financial?.paidAmount || 0)}
            </p>
          </div>
        </div>
      </div>
      
      {modalMode !== 'view' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Add Payment</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Amount"
              id="paymentAmount"
              className="px-3 py-2 border rounded-lg"
            />
            <select id="paymentMethod" className="px-3 py-2 border rounded-lg">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
            <input
              type="text"
              placeholder="Receipt Number"
              id="receiptNumber"
              className="col-span-2 px-3 py-2 border rounded-lg"
            />
            <div className="col-span-2">
              <button
                onClick={() => {
                  const amount = parseFloat(document.getElementById('paymentAmount').value);
                  const method = document.getElementById('paymentMethod').value;
                  const receiptNumber = document.getElementById('receiptNumber').value;
                  if (amount) {
                    handleAddPayment({ amount, method, receiptNumber });
                    document.getElementById('paymentAmount').value = '';
                    document.getElementById('receiptNumber').value = '';
                  }
                }}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Payment History</h4>
        {selectedLead?.financial?.payments?.map((payment, idx) => (
          <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">${payment.amount}</p>
              <p className="text-xs text-gray-500">{payment.method}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
              <p className="text-xs text-gray-400">Receipt: {payment.receiptNumber}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalLeads}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">${stats.revenue?.totalServiceFee || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">${stats.revenue?.totalPaid || 0}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-600">${stats.revenue?.pendingAmount || 0}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            Lead Management
          </h2>
          {user?.role !== 'visitor' && (
            <button
              onClick={() => openModal(null, 'add')}
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add New Lead
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            value={filters.profile}
            onChange={(e) => setFilters({...filters, profile: e.target.value, page: 1})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="">All Profiles</option>
            <option value="student">Student</option>
            <option value="professional">Professional</option>
            <option value="business">Business</option>
            <option value="tourist">Tourist</option>
          </select>
          
          <button
            onClick={() => setFilters({status: '', profile: '', search: '', page: 1, limit: 10})}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {leads.map((lead) => (
              <LeadCard key={lead._id} lead={lead} />
            ))}
          </div>
          
          {leads.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leads found</p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={filters.page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1">
                Page {filters.page} of {totalPages}
              </span>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={filters.page === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b">
  <h3 className="text-xl font-semibold text-gray-800">
    {modalMode === 'add' ? 'Add New Lead' : modalMode === 'edit' ? 'Edit Lead' : 'Lead Details'}
  </h3>
  <div className="flex gap-2">
    {modalMode === 'view' && user?.role !== 'visitor' && (
      <button
        onClick={() => setModalMode('edit')}
        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
    )}
    <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
      <X className="w-5 h-5" />
    </button>
  </div>
</div>
            
            {modalMode !== 'add' && (
              <div className="border-b px-5">
                <div className="flex gap-2 overflow-x-auto">
                  {['basic', 'counselling', 'coaching', 'visa', 'communications', 'payments'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 capitalize transition ${
                        activeTab === tab 
                          ? 'border-b-2 border-red-500 text-red-600 font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-5">
           {modalMode === 'add' && (
  <BasicInfoTab 
    formData={formData} 
    setFormData={setFormData} 
    modalMode={modalMode} 
  />
)}
{modalMode !== 'add' && activeTab === 'basic' && (
  <BasicInfoTab 
    formData={formData} 
    setFormData={setFormData} 
    modalMode={modalMode} 
  />
)}
              {modalMode !== 'add' && activeTab === 'counselling' && <CounsellingTab />}
              {modalMode !== 'add' && activeTab === 'coaching' && <CoachingTab />}
              {modalMode !== 'add' && activeTab === 'visa' && <VisaTab />}
              {modalMode !== 'add' && activeTab === 'communications' && <CommunicationsTab />}
              {modalMode !== 'add' && activeTab === 'payments' && <PaymentsTab />}
            </div>
            
            <div className="flex justify-end gap-3 p-5 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              {modalMode === 'add' && (
                <button
                  onClick={handleCreateLead}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Create Lead
                </button>
              )}
              {modalMode === 'edit' && (
                <button
                  onClick={handleUpdateLead}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lead;