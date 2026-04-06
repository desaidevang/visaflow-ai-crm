// components/BasicInfoTab.jsx
import React from 'react';

const BasicInfoTab = ({ formData, setFormData, modalMode }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // View mode - show text display
  if (modalMode === 'view') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formData.name || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formData.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formData.phone || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formData.country || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formData.destination || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg capitalize">{formData.profile || '-'}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap">{formData.message || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{formData.status || '-'}</p>
        </div>
      </div>
    );
  }

  // Edit or Add mode - show editable inputs
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            value={formData.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input
            type="text"
            value={formData.destination || ''}
            onChange={(e) => handleChange('destination', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile</label>
          <select
            value={formData.profile || 'student'}
            onChange={(e) => handleChange('profile', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <option value="student">Student</option>
            <option value="professional">Professional</option>
            <option value="business">Business</option>
            <option value="tourist">Tourist</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={formData.message || ''}
          onChange={(e) => handleChange('message', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={formData.status || 'new'}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="new">New Lead</option>
          <option value="contacted">Contacted</option>
          <option value="counselling">Counselling</option>
          <option value="coaching">Coaching</option>
          <option value="documentation">Documentation</option>
          <option value="visa_process">Visa Process</option>
          <option value="interview">Interview</option>
          <option value="application_submitted">Application Submitted</option>
          <option value="offer_received">Offer Received</option>
          <option value="visa_granted">Visa Granted</option>
          <option value="travel_arranged">Travel Arranged</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>
    </div>
  );
};

export default BasicInfoTab;