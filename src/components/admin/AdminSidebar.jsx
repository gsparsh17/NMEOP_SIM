import React from "react";
import { 
  Home, 
  DollarSign, 
  MapPin, 
  Target, 
  Upload, 
  Cpu, 
  FileText, 
  Shield,
  Settings,
  LogOut,
  Database,
  BarChart3,
  Users,
  Bell,
  Cloud,
  Lock,
  IndianRupee
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function AdminSidebar({ isOpen }) {
  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home size={20} />,
      path: "/",
      badge: null,
      roles: ["admin", "editor", "viewer"]
    },
    {
      title: "Price Data",
      icon: <IndianRupee size={20} />,
      path: "/prices",
      badge: "3 new",
      badgeColor: "bg-green-500",
      roles: ["admin", "editor"]
    },
    {
      title: "State Data",
      icon: <MapPin size={20} />,
      path: "/states",
      badge: null,
      roles: ["admin", "editor"]
    },
    {
      title: "NMEO Targets",
      icon: <Target size={20} />,
      path: "/nmeo-targets",
      badge: "Updated",
      badgeColor: "bg-blue-500",
      roles: ["admin", "editor"]
    },
    {
      title: "Import Data",
      icon: <Upload size={20} />,
      path: "/imports",
      badge: null,
      roles: ["admin", "editor"]
    },
    // {
    //   title: "API Manager",
    //   icon: <Cpu size={20} />,
    //   path: "/api",
    //   badge: null,
    //   roles: ["admin"]
    // },
    // {
    //   title: "Reports",
    //   icon: <FileText size={20} />,
    //   path: "/reports",
    //   badge: "5",
    //   badgeColor: "bg-orange-500",
    //   roles: ["admin", "editor", "viewer"]
    // },
    // {
    //   title: "Audit Logs",
    //   icon: <Shield size={20} />,
    //   path: "/audit",
    //   badge: "Active",
    //   badgeColor: "bg-purple-500",
    //   roles: ["admin"]
    // },
    // {
    //   title: "Settings",
    //   icon: <Settings size={20} />,
    //   path: "/settings",
    //   badge: null,
    //   roles: ["admin"]
    // }
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes("admin")
  );

  return (
    <aside className={`
      fixed lg:sticky top-0 left-0 h-screen bg-gradient-to-b from-[#0069ae] to-[#002244]
      shadow-xl z-40 transition-all duration-300 overflow-y-auto
      ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
    `}>
      {/* Government Logo Section */}
      <div className="p-5 border-b border-[#005b94]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src="/assets/ut.png" 
              alt="Government Logo" 
              className="w-14 h-14 object-contain"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#FF9933] text-white text-[8px] px-1 py-0.5 rounded">
              SECURE
            </div>
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">Admin Portal</h2>
            <p className="text-xs text-white">NMEO-OP Data Management</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-300">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-1">
          <div className="text-xs uppercase text-white font-medium tracking-wider mb-2 px-3">
            Main Navigation
          </div>
{filteredItems.map((item) => (
  <NavLink
    key={item.path}
    to={item.path}
    className={({ isActive }) => `
      flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group
      ${isActive 
        ? 'bg-gradient-to-r from-[#FF9933] to-[#e6892a] text-white shadow-lg' 
        : 'text-white hover:bg-[#005b94] hover:text-white'
      }
    `}
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3">
          <span className={`${isActive ? 'text-white' : 'text-white group-hover:text-white'}`}>
            {item.icon}
          </span>
          <span className="text-sm font-medium">{item.title}</span>
        </div>
        {item.badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-gray-600'} text-white`}>
            {item.badge}
          </span>
        )}
      </>
    )}
  </NavLink>
))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#138808] to-green-600 text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
            <Bell size={16} />
            <span>Emergency Alert</span>
          </button>
        </div>
      </nav>

      {/* Mobile Close Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {}}
        />
      )}
    </aside>
  );
}