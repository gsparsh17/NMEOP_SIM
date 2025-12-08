import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart,
  Shield,
  AlertTriangle,
  History
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DutyManagement() {
  const { user, hasPermission } = useAuth();
  const [duties, setDuties] = useState([]);
  const [currentDuty, setCurrentDuty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // New duty form
  const [newDuty, setNewDuty] = useState({
    basic_customs_duty_pct: 10.0,
    agri_cess_pct: 5.0,
    effective_from: new Date().toISOString().split('T')[0],
    notes: ""
  });
  
  // Edit duty form
  const [editDuty, setEditDuty] = useState({
    basic_customs_duty_pct: 10.0,
    agri_cess_pct: 5.0,
    effective_from: "",
    notes: "",
    is_active: true
  });

  useEffect(() => {
    fetchDuties();
    fetchCurrentDuty();
  }, []);

  const fetchDuties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/duties`);
      setDuties(response.data.duties || []);
    } catch (error) {
      console.error('Error fetching duties:', error);
      alert('Failed to load custom duties');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentDuty = async () => {
    try {
      const response = await axios.get(`${API_URL}/duty-defaults`);
      setCurrentDuty(response.data);
    } catch (error) {
      console.error('Error fetching current duty:', error);
    }
  };

  const handleCreateDuty = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/admin/duties`, {
        ...newDuty,
        effective_from: new Date(newDuty.effective_from).toISOString()
      });
      
      if (response.status === 201) {
        alert('Custom duty created successfully!');
        setShowCreateModal(false);
        setNewDuty({
          basic_customs_duty_pct: 10.0,
          agri_cess_pct: 5.0,
          effective_from: new Date().toISOString().split('T')[0],
          notes: ""
        });
        fetchDuties();
        fetchCurrentDuty();
      }
    } catch (error) {
      console.error('Error creating duty:', error);
      alert(error.response?.data?.error || 'Failed to create custom duty');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDuty = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/admin/duties/${selectedDuty.id}`, 
        {
          ...editDuty,
          effective_from: new Date(editDuty.effective_from).toISOString()
        }
      );
      
      if (response.status === 200) {
        alert('Custom duty updated successfully!');
        setShowEditModal(false);
        fetchDuties();
        fetchCurrentDuty();
      }
    } catch (error) {
      console.error('Error updating duty:', error);
      alert(error.response?.data?.error || 'Failed to update custom duty');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDuty = async (dutyId, dutyName) => {
    if (!window.confirm(`Are you sure you want to delete this duty entry?\n\n${dutyName}`)) {
      return;
    }
    
    try {
      setLoading(true);
      // Note: We don't have a DELETE endpoint, so we'll deactivate instead
      const response = await axios.put(`${API_URL}/admin/duties/${dutyId}`, {
        is_active: false
      });
      
      if (response.status === 200) {
        alert('Duty entry deactivated successfully!');
        fetchDuties();
        fetchCurrentDuty();
      }
    } catch (error) {
      console.error('Error deleting duty:', error);
      alert('Failed to delete duty entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (dutyId) => {
    try {
      setLoading(true);
      // First, deactivate all duties
      await Promise.all(
        duties.map(duty => 
          axios.put(`${API_URL}/admin/duties/${duty.id}`, {
            is_active: false
          })
        )
      );
      
      // Then activate the selected one
      const response = await axios.put(`${API_URL}/admin/duties/${dutyId}`, {
        is_active: true
      });
      
      if (response.status === 200) {
        alert('Duty activated successfully!');
        fetchDuties();
        fetchCurrentDuty();
      }
    } catch (error) {
      console.error('Error setting active duty:', error);
      alert('Failed to set active duty');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (duty) => {
    setSelectedDuty(duty);
    setEditDuty({
      basic_customs_duty_pct: duty.basic_customs_duty_pct,
      agri_cess_pct: duty.agri_cess_pct,
      effective_from: duty.effective_from.split('T')[0],
      notes: duty.notes || "",
      is_active: duty.is_active
    });
    setShowEditModal(true);
  };

  const calculateTotalDuty = (bcd, cess) => {
    const sws = (bcd + cess) * 0.10;
    return (bcd + cess + sws).toFixed(2);
  };

  const exportDuties = () => {
    const dataStr = JSON.stringify(duties, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom-duties-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-l-4 border-[#003366] shadow-sm rounded-r-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#003366]">Custom Duty Management</h2>
            <p className="text-gray-600 mt-1">
              Configure and manage Crude Palm Oil import duty rates
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={!hasPermission('manage_duties')}
              className="flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              New Duty Rate
            </button>
            
            <button
              onClick={exportDuties}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>
      </div>

      {/* Current Duty Status */}
      {currentDuty && (
        <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Current Active Duty</h3>
              <p className="text-sm text-gray-600">Applied to all CPO import calculations</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">ACTIVE</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Basic Customs Duty (BCD)</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {currentDuty.basic_customs_duty_pct}%
              </div>
              <div className="text-xs text-gray-500 mt-1">On CIF value</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Agriculture Cess</div>
              <div className="text-2xl font-bold text-green-700 mt-1">
                {currentDuty.agri_cess_pct}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Additional levy</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-600">Total Effective Duty</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">
                {calculateTotalDuty(currentDuty.basic_customs_duty_pct, currentDuty.agri_cess_pct)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Including SWS</div>
            </div>
          </div>
          
          {currentDuty.effective_from && (
            <div className="mt-6 pt-6 border-t border-blue-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Effective from: {new Date(currentDuty.effective_from).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Duty History Toggle */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Duty Rate History</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
              <p className="mt-2 text-gray-600">Loading duty history...</p>
            </div>
          ) : duties.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">No duty history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duties.map((duty) => (
                <div key={duty.id} className={`border rounded-lg p-4 ${
                  duty.is_active 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          duty.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {duty.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(duty.effective_from).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">BCD</div>
                          <div className="text-lg font-semibold text-blue-700">
                            {duty.basic_customs_duty_pct}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Cess</div>
                          <div className="text-lg font-semibold text-green-700">
                            {duty.agri_cess_pct}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Total</div>
                          <div className="text-lg font-semibold text-purple-700">
                            {calculateTotalDuty(duty.basic_customs_duty_pct, duty.agri_cess_pct)}%
                          </div>
                        </div>
                      </div>
                      
                      {duty.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          Notes: {duty.notes}
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Created: {new Date(duty.created_at).toLocaleDateString()} by {duty.created_by}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!duty.is_active && (
                        <button
                          onClick={() => handleSetActive(duty.id)}
                          disabled={loading || !hasPermission('manage_duties')}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                          title="Set as Active"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEditClick(duty)}
                        disabled={loading || !hasPermission('manage_duties')}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors disabled:opacity-50"
                        title="Edit Duty"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDuty(duty.id, `BCD: ${duty.basic_customs_duty_pct}%, Cess: ${duty.agri_cess_pct}%`)}
                        disabled={loading || !hasPermission('manage_duties') || duty.is_active}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Delete Duty"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Duty Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Create New Duty Rate</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateDuty} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BCD (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      value={newDuty.basic_customs_duty_pct}
                      onChange={(e) => setNewDuty({...newDuty, basic_customs_duty_pct: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    />
                    <div className="text-xs text-gray-500 mt-1">Basic Customs Duty</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cess (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      value={newDuty.agri_cess_pct}
                      onChange={(e) => setNewDuty({...newDuty, agri_cess_pct: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    />
                    <div className="text-xs text-gray-500 mt-1">Agriculture Cess</div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective From *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDuty.effective_from}
                    onChange={(e) => setNewDuty({...newDuty, effective_from: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newDuty.notes}
                    onChange={(e) => setNewDuty({...newDuty, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    placeholder="Optional: Add notes about this duty change..."
                  />
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Duty Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Basic Customs Duty</div>
                      <div className="text-lg font-semibold text-blue-700">
                        {newDuty.basic_customs_duty_pct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Agriculture Cess</div>
                      <div className="text-lg font-semibold text-green-700">
                        {newDuty.agri_cess_pct}%
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-600">Social Welfare Surcharge (10%)</div>
                      <div className="text-lg font-semibold text-amber-700">
                        {((newDuty.basic_customs_duty_pct + newDuty.agri_cess_pct) * 0.10).toFixed(2)}%
                      </div>
                    </div>
                    <div className="col-span-2 border-t pt-2">
                      <div className="text-sm text-gray-600 font-medium">Total Effective Duty</div>
                      <div className="text-xl font-bold text-purple-700">
                        {calculateTotalDuty(newDuty.basic_customs_duty_pct, newDuty.agri_cess_pct)}%
                      </div>
                    </div>
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
                    {loading ? 'Creating...' : 'Create Duty Rate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Duty Modal */}
      {showEditModal && selectedDuty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Edit Duty Rate</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleEditDuty} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BCD (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      value={editDuty.basic_customs_duty_pct}
                      onChange={(e) => setEditDuty({...editDuty, basic_customs_duty_pct: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cess (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      value={editDuty.agri_cess_pct}
                      onChange={(e) => setEditDuty({...editDuty, agri_cess_pct: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effective From *
                  </label>
                  <input
                    type="date"
                    required
                    value={editDuty.effective_from}
                    onChange={(e) => setEditDuty({...editDuty, effective_from: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editDuty.is_active}
                    onChange={(e) => setEditDuty({...editDuty, is_active: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editDuty.notes}
                    onChange={(e) => setEditDuty({...editDuty, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
                  />
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Duty Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Basic Customs Duty</div>
                      <div className="text-lg font-semibold text-blue-700">
                        {editDuty.basic_customs_duty_pct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Agriculture Cess</div>
                      <div className="text-lg font-semibold text-green-700">
                        {editDuty.agri_cess_pct}%
                      </div>
                    </div>
                    <div className="col-span-2 border-t pt-2">
                      <div className="text-sm text-gray-600 font-medium">Total Effective Duty</div>
                      <div className="text-xl font-bold text-purple-700">
                        {calculateTotalDuty(editDuty.basic_customs_duty_pct, editDuty.agri_cess_pct)}%
                      </div>
                    </div>
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
                    {loading ? 'Updating...' : 'Update Duty Rate'}
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