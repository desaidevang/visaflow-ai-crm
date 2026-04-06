// MainDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, FileText, Calendar, CheckCircle, TrendingUp, Globe,
  DollarSign, Award, Target, Zap, Shield, UserCheck, Briefcase,
  GraduationCap, Plane, Building, ArrowUpRight, ArrowDownRight,
  MoreVertical, ChevronRight, Mail, Phone, MapPin, ThumbsUp,
  PieChart, BarChart, Activity, Clock, AlertCircle, RefreshCw,
  Download, Filter, Eye, Star, MessageCircle, Heart, BookOpen,
  School, Users2, BriefcaseBusiness, Ticket, LogIn, Settings,
  Home, GitBranch, Library, FolderTree, DoorOpen
} from 'lucide-react';
import axios from 'axios';

// Configure axios defaults
const API_URL = 'http://localhost:5000/api';

// Set axios defaults for credentials
axios.defaults.withCredentials = true;

const MainDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Dashboard API Response:', response.data);
      
      if (response.data.success) {
        // The data is nested inside response.data.data
        setDashboardData(response.data.data);
        setLastUpdated(new Date());
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this dashboard.');
      } else {
        setError(err.response?.data?.message || 'Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/lead-analytics`, {
        params: { period: selectedPeriod },
        withCredentials: true
      });
      if (response.data.success) {
        setDashboardData(prev => ({
          ...prev,
          analytics: response.data.data
        }));
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
    }
  }, [selectedPeriod]);

  // Fetch recent activities
  const fetchActivities = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/activities`, {
        withCredentials: true
      });
      if (response.data.success) {
        setDashboardData(prev => ({
          ...prev,
          activities: response.data.data
        }));
      }
    } catch (err) {
      console.error('Activities fetch error:', err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Load additional data when tab changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'activities') {
      fetchActivities();
    }
  }, [activeTab, fetchAnalytics, fetchActivities]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
      if (activeTab === 'activities') fetchActivities();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchActivities, activeTab]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time ago
  const timeAgo = (date) => {
    if (!date) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use dashboardData directly (already the data object from API)
  const stats = dashboardData || {};

  // Stat cards configuration
  const statCards = [
    {
      title: 'Total Leads',
      value: stats?.overview?.totalLeads || 0,
      change: stats?.overview?.leadGrowth || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Leads This Month',
      value: stats?.overview?.leadsThisMonth || 0,
      change: stats?.overview?.leadGrowth,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Active Applications',
      value: stats?.overview?.activeApplications || 0,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Approval Rate',
      value: `${stats?.overview?.approvalRate || 0}%`,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.revenue?.totalPaid || 0),
      icon: DollarSign,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(stats?.revenue?.pendingAmount || 0),
      icon: Clock,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  // Status colors mapping
  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-cyan-100 text-cyan-700',
    counselling: 'bg-purple-100 text-purple-700',
    coaching: 'bg-indigo-100 text-indigo-700',
    documentation: 'bg-amber-100 text-amber-700',
    visa_process: 'bg-orange-100 text-orange-700',
    visa_granted: 'bg-green-100 text-green-700',
    converted: 'bg-emerald-100 text-emerald-700',
    lost: 'bg-red-100 text-red-700',
    application_submitted: 'bg-teal-100 text-teal-700'
  };

  const statusLabels = {
    new: 'New',
    contacted: 'Contacted',
    counselling: 'Counselling',
    coaching: 'Coaching',
    documentation: 'Documentation',
    visa_process: 'Visa Process',
    visa_granted: 'Visa Granted',
    converted: 'Converted',
    lost: 'Lost',
    application_submitted: 'Application Submitted'
  };

  // Get max count for chart scaling
  const maxMonthlyCount = Math.max(...(stats?.monthlyTrends?.map(t => t.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.name || 'User'}! Here's what's happening with your leads today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Last updated: {timeAgo(lastUpdated)}
            </span>
          )}
          <button
            onClick={() => {
              fetchDashboardData();
              if (activeTab === 'activities') fetchActivities();
            }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {['overview', 'analytics', 'activities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium transition capitalize ${
                activeTab === tab
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' && <PieChart className="w-4 h-4 inline mr-2" />}
              {tab === 'analytics' && <BarChart className="w-4 h-4 inline mr-2" />}
              {tab === 'activities' && <Activity className="w-4 h-4 inline mr-2" />}
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                  {stat.change !== undefined && stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${
                      stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Charts and Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Monthly Lead Trends</h3>
                <button className="text-xs text-gray-400 hover:text-gray-600">View Details →</button>
              </div>
              <div className="h-64">
                <div className="flex items-end justify-between h-full gap-2">
                  {stats?.monthlyTrends?.map((trend, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-red-400 to-red-500 rounded-lg transition-all hover:from-red-500 hover:to-red-600"
                        style={{ height: `${Math.max((trend.count / maxMonthlyCount) * 200, 4)}px` }}
                      />
                      <span className="text-xs text-gray-500 rotate-45 origin-left whitespace-nowrap">
                        {trend.month?.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Lead Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(stats?.statusDistribution || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-36">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[status] || status}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{count} leads</span>
                        <span>{((count / (stats?.overview?.totalLeads || 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-400 to-red-500 rounded-full h-2 transition-all"
                          style={{ width: `${(count / (stats?.overview?.totalLeads || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Conversion Funnel</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Overall: {stats?.conversionRates?.overall || 0}%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { stage: 'New Leads', count: stats?.funnelData?.new || 0, rate: 100 },
                { stage: 'Counselling', count: stats?.funnelData?.counselling || 0, rate: stats?.conversionRates?.toCounselling || 0 },
                { stage: 'Coaching', count: stats?.funnelData?.coaching || 0, rate: stats?.conversionRates?.toCoaching || 0 },
                { stage: 'Visa Process', count: stats?.funnelData?.visa_process || 0, rate: stats?.conversionRates?.toVisa || 0 },
                { stage: 'Visa Granted', count: stats?.funnelData?.visa_granted || 0, rate: stats?.conversionRates?.toApproval || 0 }
              ].map((stage, idx) => (
                <div key={idx} className="text-center">
                  <div className="relative mb-2">
                    <div className="text-2xl font-bold text-gray-800">{stage.count}</div>
                    {idx > 0 && (
                      <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden md:block">
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{stage.stage}</p>
                  <p className="text-xs font-medium text-green-600">{stage.rate}% conversion</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leads Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Recent Leads</h3>
              <button className="text-xs text-red-500 hover:text-red-600">View All →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visa Type</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.recentLeads?.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{lead.name}</p>
                          <p className="text-xs text-gray-400">{lead.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{lead.destination || '—'}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{lead.visaType === 'Not specified' ? '—' : lead.visaType}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[lead.status] || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{formatDate(lead.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Follow-ups */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              Upcoming Follow-ups
            </h3>
            <div className="space-y-3">
              {stats?.upcomingFollowups?.length > 0 ? (
                stats.upcomingFollowups.map((followup, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{followup.name}</p>
                      <p className="text-xs text-gray-500">{followup.followUpSummary || 'No summary provided'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">{formatDate(followup.followUpDate)}</p>
                      <p className="text-xs text-gray-400">{followup.phone}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No upcoming follow-ups scheduled</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              {['week', 'month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-sm rounded-md transition capitalize ${
                    selectedPeriod === period
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Visa Success by Country</h3>
            <div className="space-y-3">
              {stats?.countryDistribution && Object.entries(stats.countryDistribution).map(([country, count]) => (
                <div key={country} className="flex items-center gap-3">
                  <div className="w-32">
                    <span className="text-sm font-medium text-gray-700">{country}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{count} applications</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-500 rounded-full h-2 transition-all"
                        style={{ width: `${(count / (stats?.overview?.totalLeads || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Visa Type Distribution</h3>
            <div className="flex flex-wrap gap-3">
              {stats?.visaTypeDistribution && Object.entries(stats.visaTypeDistribution).map(([type, count]) => (
                <div key={type} className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full">
                  <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                  <span className="ml-2 text-sm font-semibold text-red-500">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Stats (Admin only) */}
          {user?.role === 'admin' && stats?.users && stats.users.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Team Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.users.map((roleStat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{roleStat._id}</p>
                      <p className="text-xs text-gray-500">{roleStat.activeCount} active</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-800">{roleStat.count}</span>
                      <p className="text-xs text-gray-400">total users</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Activities</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {dashboardData?.activities?.length > 0 ? (
              dashboardData.activities.map((activity, idx) => (
                <div key={idx} className="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'visa_approved' ? 'bg-green-100' :
                    activity.type === 'visa_rejected' ? 'bg-red-100' :
                    activity.type === 'lead_converted' ? 'bg-emerald-100' : 'bg-blue-100'
                  }`}>
                    {activity.type === 'visa_approved' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {activity.type === 'visa_rejected' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    {activity.type === 'lead_converted' && <ThumbsUp className="w-4 h-4 text-emerald-600" />}
                    {activity.type === 'status_updated' && <RefreshCw className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.message}</p>
                    {activity.details?.summary && (
                      <p className="text-xs text-gray-500 mt-1">{activity.details.summary}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.timestamp)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No recent activities to display</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;