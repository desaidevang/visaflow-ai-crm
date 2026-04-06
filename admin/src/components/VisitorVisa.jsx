// components/VisitorVisa.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plane, Search, User, Calendar, Clock, Phone, Mail, MapPin,
  FileText, Save, Loader, CheckCircle, Edit3, ChevronRight,
  Users, X, Banknote, FileCheck, AlertCircle, Info, Hotel, Calendar as CalendarIcon
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const RED = '#E53935';
const RED_DARK = '#B71C1C';
const RED_SOFT = '#FFF5F5';
const RED_MID = '#FFCDD2';

const VisitorVisa = ({ user, selectedLeadId, onBack }) => {
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
    visaType: 'visitor_visa',
    appliedDate: '',
    visaOffice: '',
    applicationId: '',
    biometricsDate: '',
    decision: 'pending',
    decisionDate: '',
    travelDetails: {
      intendedArrival: '',
      intendedDeparture: '',
      purposeOfVisit: '',
      accommodationAddress: ''
    },
    passportDetails: {
      passportNumber: '',
      expiryDate: ''
    },
    additionalInfo: {
      previousVisits: '',
      notes: ''
    }
  });

  useEffect(() => {
    fetchVisaLeads();
  }, []);

  const fetchVisaLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/leads?status=visa_process&limit=200`,
        { headers: { Authorization: `Bearer ${token}` } });
      
      const visaLeads = (res.data.leads || []).filter(l => l.visa?.visaType === 'visitor_visa');
      setLeads(visaLeads);
    } catch (error) {
      console.error('Error fetching visitor visa leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectLead = (lead) => {
    setSelectedLead(lead);
    setEditing(false);
    const visa = lead.visa || {};
    setFormData({
      visaType: 'visitor_visa',
      appliedDate: visa.appliedDate?.split('T')[0] || '',
      visaOffice: visa.visaOffice || '',
      applicationId: visa.applicationId || '',
      biometricsDate: visa.biometricsDate?.split('T')[0] || '',
      decision: visa.decision || 'pending',
      decisionDate: visa.decisionDate?.split('T')[0] || '',
      travelDetails: {
        intendedArrival: visa.travelDetails?.intendedArrival?.split('T')[0] || '',
        intendedDeparture: visa.travelDetails?.intendedDeparture?.split('T')[0] || '',
        purposeOfVisit: visa.travelDetails?.purposeOfVisit || '',
        accommodationAddress: visa.travelDetails?.accommodationAddress || ''
      },
      passportDetails: {
        passportNumber: visa.passportDetails?.passportNumber || '',
        expiryDate: visa.passportDetails?.expiryDate?.split('T')[0] || ''
      },
      additionalInfo: {
        previousVisits: visa.additionalInfo?.previousVisits || '',
        notes: visa.additionalInfo?.notes || ''
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
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveVisa = async () => {
    if (!selectedLead) return;
    if (!window.confirm(`Approve visitor visa for ${selectedLead.name}?`)) return;
    
    setApproving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { 
          visa: { ...formData, decision: 'approved', decisionDate: new Date().toISOString().split('T')[0] },
          status: 'visa_granted'
        },
        { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`✅ Visitor Visa APPROVED for ${selectedLead.name}!`);
      fetchVisaLeads();
      setSelectedLead(null);
    } catch (error) {
      alert('Failed to approve visa');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectVisa = async () => {
    if (!selectedLead) return;
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    if (!window.confirm(`Reject visitor visa for ${selectedLead.name}?`)) return;
    
    setApproving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/leads/${selectedLead._id}/full-update`,
        { visa: { ...formData, decision: 'rejected', decisionDate: new Date().toISOString().split('T')[0] }, status: 'lost' },
        { headers: { Authorization: `Bearer ${token}` } });
      
      alert(`❌ Visitor Visa REJECTED for ${selectedLead.name}`);
      fetchVisaLeads();
      setSelectedLead(null);
    } catch (error) {
      alert('Failed to reject visa');
    } finally {
      setApproving(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: leads.length,
    pending: leads.filter(l => l.visa?.decision === 'pending').length,
    approved: leads.filter(l => l.visa?.decision === 'approved').length,
    rejected: leads.filter(l => l.visa?.decision === 'rejected').length
  };

  const VisaCard = ({ lead, isSelected, onClick }) => {
    const visa = lead.visa || {};
    const decisionColor = visa.decision === 'approved' ? '#10B981' : visa.decision === 'rejected' ? '#EF4444' : '#F59E0B';
    
    return (
      <button onClick={onClick}
        className="w-full text-left p-4 transition-all border-b hover:bg-gray-50"
        style={{ 
          borderColor: '#F0F0F0', 
          background: isSelected ? RED_SOFT : 'white',
          borderLeft: isSelected ? `3px solid ${RED}` : '3px solid transparent'
        }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
            <Plane className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">{lead.name}</p>
            <p className="text-xs text-gray-400">{lead.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${decisionColor}15`, color: decisionColor }}>
                {visa.decision === 'approved' ? 'Approved' : visa.decision === 'rejected' ? 'Rejected' : 'Pending'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: isSelected ? RED : '#D1D5DB' }} />
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg,${RED_DARK},${RED})` }}>
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visitor Visa Management</h1>
              <p className="text-sm text-gray-500">Manage tourist/visitor visa applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl p-4 border" style={{ background: RED_SOFT, borderColor: `${RED}20` }}>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold" style={{ color: RED }}>{stats.total}</p>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: '#FFFBEB', borderColor: '#F59E0B20' }}>
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{stats.pending}</p>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: '#ECFDF5', borderColor: '#10B98120' }}>
          <p className="text-xs text-gray-500">Approved</p>
          <p className="text-2xl font-bold" style={{ color: '#10B981' }}>{stats.approved}</p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden shadow-lg border" style={{ borderColor: '#F0F0F0' }}>
        <div className="w-80 flex-shrink-0 bg-white border-r">
          <div className="p-4" style={{ background: `linear-gradient(135deg,${RED_DARK} 0%,${RED} 100%)` }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-300" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search visitor visa applicants..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none text-white placeholder-red-200"
                style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredLeads.map(lead => (
              <VisaCard key={lead._id} lead={lead} isSelected={selectedLead?._id === lead._id} onClick={() => selectLead(lead)} />
            ))}
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          {!selectedLead ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Plane className="w-16 h-16" style={{ color: RED_MID }} />
              <p className="mt-4 text-gray-500">Select a visitor visa application</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white rounded-2xl border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedLead.name}</h2>
                    <p className="text-sm text-gray-500">{selectedLead.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {saved && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {formData.decision === 'pending' && (
                      <>
                        <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white" style={{ background: RED }}>
                          <Edit3 className="w-4 h-4 inline mr-1" /> Edit
                        </button>
                        <button onClick={handleApproveVisa} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-600">Approve</button>
                        <button onClick={handleRejectVisa} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600">Reject</button>
                      </>
                    )}
                    {editing && (
                      <>
                        <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                        <button onClick={handleSave} className="px-3 py-1.5 rounded-lg text-white" style={{ background: RED }}>Save</button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500">Application ID</label>
                    {editing ? <input value={formData.applicationId} onChange={e => handleChange(null, 'applicationId', e.target.value)} className="w-full p-2 border rounded-lg" />
                      : <p className="p-2 bg-gray-50 rounded-lg">{formData.applicationId || 'Not assigned'}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Purpose of Visit</label>
                    {editing ? <input value={formData.travelDetails.purposeOfVisit} onChange={e => handleChange('travelDetails', 'purposeOfVisit', e.target.value)} className="w-full p-2 border rounded-lg" />
                      : <p className="p-2 bg-gray-50 rounded-lg">{formData.travelDetails.purposeOfVisit || 'Not specified'}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">Intended Arrival</label>
                      {editing ? <input type="date" value={formData.travelDetails.intendedArrival} onChange={e => handleChange('travelDetails', 'intendedArrival', e.target.value)} className="w-full p-2 border rounded-lg" />
                        : <p className="p-2 bg-gray-50 rounded-lg">{formData.travelDetails.intendedArrival ? new Date(formData.travelDetails.intendedArrival).toLocaleDateString() : 'Not set'}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Intended Departure</label>
                      {editing ? <input type="date" value={formData.travelDetails.intendedDeparture} onChange={e => handleChange('travelDetails', 'intendedDeparture', e.target.value)} className="w-full p-2 border rounded-lg" />
                        : <p className="p-2 bg-gray-50 rounded-lg">{formData.travelDetails.intendedDeparture ? new Date(formData.travelDetails.intendedDeparture).toLocaleDateString() : 'Not set'}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Passport Number</label>
                    {editing ? <input value={formData.passportDetails.passportNumber} onChange={e => handleChange('passportDetails', 'passportNumber', e.target.value)} className="w-full p-2 border rounded-lg" />
                      : <p className="p-2 bg-gray-50 rounded-lg">{formData.passportDetails.passportNumber || 'Not provided'}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Status</label>
                    <p className="p-2 rounded-lg font-semibold" style={{ 
                      background: formData.decision === 'approved' ? '#ECFDF5' : formData.decision === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                      color: formData.decision === 'approved' ? '#10B981' : formData.decision === 'rejected' ? '#EF4444' : '#F59E0B'
                    }}>
                      {formData.decision === 'approved' ? '✅ APPROVED' : formData.decision === 'rejected' ? '❌ REJECTED' : '⏳ PENDING'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorVisa;