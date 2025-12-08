import React, { useState } from "react";
import { Menu, X, Bell, User, LogOut, Shield, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminHeader({ user, sidebarOpen, toggleSidebar }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Data sync completed", time: "10 min ago", read: false },
    { id: 2, title: "New user registered", time: "2 hours ago", read: true },
  ]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="hidden lg:block">
      {/* Status Bar */}
      <div className="bg-[#003366] text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </span>
            <span className="text-gray-300">Last backup: Today 02:00 AM</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Session expires: {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button 
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-white flex items-center gap-1"
            >
              <Home size={12} />
              <span>Main Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header Content */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:text-[#003366] hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* Quick Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#003366]">4</div>
                  <div className="text-xs text-gray-600">Active Modules</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#138808]">98%</div>
                  <div className="text-xs text-gray-600">System Health</div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-lg text-gray-600 hover:text-[#003366] hover:bg-gray-100 relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-[#003366] to-[#0072bc] rounded-full flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">Administrator</p>
                    <p className="text-xs text-gray-500">Super Admin</p>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-gray-50">
                      <p className="text-sm font-semibold text-[#003366]">Administrator</p>
                      <p className="text-xs text-gray-500">admin@nmeo-op.gov.in</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">Session Active</span>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2">
                        <Shield size={16} />
                        <div>
                          <div className="font-medium">Profile Settings</div>
                          <div className="text-xs text-gray-500">Manage account details</div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 mt-1"
                      >
                        <LogOut size={16} />
                        <div>
                          <div className="font-medium">Logout</div>
                          <div className="text-xs text-red-500">End current session</div>
                        </div>
                      </button>
                    </div>
                    
                    <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                      <div className="text-xs text-gray-500">
                        <div>IP: 192.168.1.100</div>
                        <div>Location: New Delhi</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}