// components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Edit2, Trash2, Eye, Search, Filter,
  X, Check, Shield, UserCheck, User, Mail, Briefcase,
  Calendar, MoreVertical, Download, Upload, RefreshCw,
  AlertCircle, Star, Award, Clock, Zap, Loader
} from 'lucide-react';

const UserManagement = ({ user: currentUser }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'visitor'
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  // Check permissions based on user role
  const isAdmin = currentUser?.role === 'admin';
  const isAgent = currentUser?.role === 'agent';
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canCreate = isAdmin;
  const canViewAll = isAdmin || isAgent;

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token') || currentUser?.token;
  };

  // API calls
  const API_BASE_URL = 'http://localhost:5000/api';

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (response.status === 403) {
        showNotification('You do not have permission to view users', 'error');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Network error. Please check your connection.', 'error');
    } finally {
      setFetchingUsers(false);
    }
  };

  // Create user
  const createUser = async (userData) => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        return false;
      }

      if (response.status === 403) {
        showNotification('Only admins can create users', 'error');
        return false;
      }

      if (response.ok) {
        const newUser = await response.json();
        setUsers(prev => [newUser, ...prev]);
        showNotification('User created successfully!', 'success');
        return true;
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to create user', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification('Network error. Please try again.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (id, userData) => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (response.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        return false;
      }

      if (response.status === 403) {
        showNotification('Only admins can update users', 'error');
        return false;
      }

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(user => 
          user._id === id ? { ...user, ...updatedUser } : user
        ));
        showNotification('User updated successfully!', 'success');
        return true;
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to update user', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Network error. Please try again.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        showNotification('Session expired. Please login again.', 'error');
        return false;
      }

      if (response.status === 403) {
        showNotification('Only admins can delete users', 'error');
        return false;
      }

      if (response.ok) {
        setUsers(prev => prev.filter(user => user._id !== id));
        showNotification('User deleted successfully!', 'success');
        return true;
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to delete user', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Network error. Please try again.', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    if (canViewAll) {
      fetchUsers();
    } else {
      setFetchingUsers(false);
    }
  }, [canViewAll]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle create user
  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    const success = await createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });

    if (success) {
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'visitor' });
    }
  };

  // Handle edit user
  const handleEditUser = async () => {
    if (!selectedUser) return;

    const updateData = {
      name: formData.name,
      email: formData.email,
      role: formData.role
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    const success = await updateUser(selectedUser._id, updateData);

    if (success) {
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', role: 'visitor' });
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!showDeleteConfirm) return;
    
    const success = await deleteUser(showDeleteConfirm._id);
    
    if (success) {
      setShowDeleteConfirm(null);
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  // Export users to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Created At', 'Applications'];
    const csvData = filteredUsers.map(user => [
      user.name,
      user.email,
      user.role,
      user.createdAt?.split('T')[0] || 'N/A',
      user.applications || 0
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Export completed!', 'success');
  };

  // Get role badge styling
  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: Shield, label: 'Admin' };
      case 'agent':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Briefcase, label: 'Agent' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: User, label: 'Visitor' };
    }
  };

  // Stats cards
  const stats = [
    { title: 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-indigo-500' },
    { title: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'from-red-500 to-rose-500' },
    { title: 'Agents', value: users.filter(u => u.role === 'agent').length, icon: Briefcase, color: 'from-green-500 to-emerald-500' },
    { title: 'Visitors', value: users.filter(u => u.role === 'visitor').length, icon: User, color: 'from-purple-500 to-pink-500' },
  ];

  // Loading state
  if (fetchingUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  // No access for visitors
  if (!canViewAll) {
    return (
      <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-lg border border-white/50 p-12 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to access user management.</p>
        <p className="text-gray-400 text-sm mt-2">Contact an administrator for access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 ${
          notification.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Manage users, roles, and permissions' : 'View team members and their activity'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
            disabled={fetchingUsers}
          >
            <RefreshCw className={`w-4 h-4 ${fetchingUsers ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {canCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg transition shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="backdrop-blur-md bg-white/70 rounded-2xl p-4 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-2">
              <div className={`bg-gradient-to-r ${stat.color} p-2 rounded-xl`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-500 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>
          <button 
            onClick={exportToCSV}
            className="p-2.5 bg-white/70 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Applications</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Last Active</th>
                {(canEdit || canDelete) && (
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const roleBadge = getRoleBadge(user.role);
                const RoleIcon = roleBadge.icon;
                return (
                  <tr key={user._id} className="hover:bg-red-50/20 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">{user.applications || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                            title="Edit User"
                            disabled={loading}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => setShowDeleteConfirm(user)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                              title="Delete User"
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="visitor">Visitor (Read Only)</option>
                  <option value="agent">Agent (Read & Limited Edit)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleCreateUser} disabled={loading} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-70">
                {loading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                  disabled={selectedUser.role === 'admin'}
                >
                  <option value="visitor">Visitor (Read Only)</option>
                  <option value="agent">Agent (Read & Limited Edit)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
                {selectedUser.role === 'admin' && (
                  <p className="text-xs text-amber-600 mt-1">Admin role cannot be changed</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleEditUser} disabled={loading} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-70">
                {loading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete User</h3>
              <p className="text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-700">{showDeleteConfirm.name}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDeleteUser} disabled={loading} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-70">
                {loading ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;