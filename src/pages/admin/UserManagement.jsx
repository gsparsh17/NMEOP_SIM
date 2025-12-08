import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Key
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserManagement() {
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // New user form
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "user",
    phone: "",
    department: "",
    permissions: []
  });
  
  // Edit user form
  const [editUser, setEditUser] = useState({
    first_name: "",
    last_name: "",
    role: "",
    phone: "",
    department: "",
    is_active: true,
    permissions: []
  });

  // Permission options
  const permissionOptions = [
    { value: "create_user", label: "Create Users" },
    { value: "read_user", label: "View Users" },
    { value: "update_user", label: "Update Users" },
    { value: "delete_user", label: "Delete Users" },
    { value: "read_audit_logs", label: "View Audit Logs" },
    { value: "manage_settings", label: "Manage Settings" },
    { value: "view_all_data", label: "View All Data" },
    { value: "manage_duties", label: "Manage Duties" },
    { value: "manage_predictions", label: "Manage Predictions" },
    { value: "export_data", label: "Export Data" },
    { value: "manage_users", label: "Manage Users" },
    { value: "view_reports", label: "View Reports" }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, newUser);
      
      if (response.status === 201) {
        alert('User created successfully!');
        setShowCreateModal(false);
        setNewUser({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          role: "user",
          phone: "",
          department: "",
          permissions: []
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/admin/users/${selectedUser.id}`, 
        editUser
      );
      
      if (response.status === 200) {
        alert('User updated successfully!');
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to deactivate user ${userName}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/admin/users/${userId}`);
      
      if (response.status === 200) {
        alert('User deactivated successfully!');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.error || 'Failed to deactivate user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/admin/users/${userId}`, {
        is_active: !currentStatus
      });
      
      if (response.status === 200) {
        alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditUser({
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      phone: user.phone || "",
      department: user.department || "",
      is_active: user.is_active,
      permissions: user.permissions || []
    });
    setShowEditModal(true);
  };

  const handlePermissionToggle = (permission, isEdit = false) => {
    if (isEdit) {
      const newPermissions = editUser.permissions.includes(permission)
        ? editUser.permissions.filter(p => p !== permission)
        : [...editUser.permissions, permission];
      setEditUser({ ...editUser, permissions: newPermissions });
    } else {
      const newPermissions = newUser.permissions.includes(permission)
        ? newUser.permissions.filter(p => p !== permission)
        : [...newUser.permissions, permission];
      setNewUser({ ...newUser, permissions: newPermissions });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const exportUsers = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'analyst': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-l-4 border-[#003366] shadow-sm rounded-r-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#003366]">User Management</h2>
            <p className="text-gray-600 mt-1">
              Manage system users, roles, and permissions
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!hasPermission('create_user')}
              className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
            
            <button
              onClick={exportUsers}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="user">User</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {userItem.first_name?.[0]}{userItem.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userItem.first_name} {userItem.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userItem.email}
                          </div>
                          {userItem.department && (
                            <div className="text-xs text-gray-400">
                              {userItem.department}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}>
                          {userItem.role.toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-600">
                          {userItem.permissions?.length || 0} permissions
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {userItem.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {userItem.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {userItem.email}
                        </div>
                        {userItem.last_login && (
                          <div className="text-xs text-gray-500">
                            Last login: {new Date(userItem.last_login).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {userItem.is_active ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-700 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-700 font-medium">Inactive</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {new Date(userItem.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(userItem)}
                          disabled={!hasPermission('update_user')}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleUserStatus(userItem.id, userItem.is_active)}
                          disabled={!hasPermission('update_user')}
                          className={userItem.is_active 
                            ? "text-amber-600 hover:text-amber-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            : "text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          }
                          title={userItem.is_active ? "Deactivate User" : "Activate User"}
                        >
                          {userItem.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(userItem.id, `${userItem.first_name} ${userItem.last_name}`)}
                          disabled={!hasPermission('delete_user') || userItem.id === user?.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Create New User</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  >
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {permissionOptions.map(permission => (
                      <label key={permission.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={newUser.permissions.includes(permission.value)}
                          onChange={() => handlePermissionToggle(permission.value)}
                          className="rounded text-[#003366] focus:ring-[#003366]"
                        />
                        <span className="text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit User: {selectedUser.first_name} {selectedUser.last_name}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editUser.first_name}
                      onChange={(e) => setEditUser({...editUser, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editUser.last_name}
                      onChange={(e) => setEditUser({...editUser, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editUser.department}
                    onChange={(e) => setEditUser({...editUser, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  >
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editUser.is_active}
                    onChange={(e) => setEditUser({...editUser, is_active: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {permissionOptions.map(permission => (
                      <label key={permission.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editUser.permissions.includes(permission.value)}
                          onChange={() => handlePermissionToggle(permission.value, true)}
                          className="rounded text-[#003366] focus:ring-[#003366]"
                        />
                        <span className="text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}