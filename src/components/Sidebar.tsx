import React, { useState } from "react";
import { ViewType } from "../types";

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  activeProfile: string;
  onProfileChange: (profileId: string) => void;
}

export const PROFILES = [
  {
    id: "admin_root",
    name: "Admin Root",
    role: "System Administrator (All Access)",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzqmpeLvjQyWx4Cj7c9EsyfledNNWYbHCsk8DC5TgS6z0ZVtPr1bARmzm0MWaWK1qFOejaCvt8OcE0n9P8aF3CnC3YzX9kbG4_-tebZyzF8xo5hkulU-naicYIamypcyYTeyK5UwG0qSelhw29UKfuqb0-lsmebfxx54SQfQY9xzraAg5E2tKAgOAIm_vkbI7btDLCVFdQDDBw2tQhmm7fwqOmdnRUHQe5jdKU6PUPjwHvW_VEClo5W39yYYfut6FD-Kx1L5LWjhk"
  },
  {
    id: "aris_thorne",
    name: "Manager",
    role: "Manager (Reporting Hub Only)",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8gfPH1BMpt88VeelSPaL2kUqMr2iCNkDShqIXG-Pql2dtaEX9FG65XuWtRPPJv-NgWhBV4h69DBcS-yYqoPebT4IqMkPPaX0Ai2JJjHf-B-tUOHBjIW1mznkmjD8OTt6rpaXfzff18in8M6tlhwqX6M5yJqfR0YX3PYWJrVvH7hGH1ov39WsKQsTHb6a-KhNxkMkaYksRd_CVDVJ0VGsAHuQ9-196MrTwZBxZEE98NPHX0wpquRgIkoHsaNGJwGvU_AzyTcezjW8"
  },
  {
    id: "admin_unit_01",
    name: "Employee",
    role: "Employee (Read-Only / Suggestions)",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDE20L6u9Y7183flOA-FPVvtO9mJHJJIgDECWdZCjeQY_OvYfZuUieDC2HN4axmqkJ8y4MTWqkxFwgQitXmUJ5sH2wOo6Z99GCg8lFJfkIB80AdptbcrpuFBEbWQhCNSExMC_bEeqm6n1LAb8CptG56sZbM112DXvABaDHVI7_TLpVmiY4sytgX-ITZHwp6trpePClvfFfsBgn5e8-p5Ye8tH0RGiDP--ALXANL-CdB8l2KReVwEbeAMnQAqj6IkDJirP1mIvG_TGU"
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  activeProfile,
  onProfileChange
}) => {
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  const selectedProfile = PROFILES.find(p => p.id === activeProfile) || PROFILES[0];

  const allMenuItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: "dashboard" },
    { id: "simulation" as ViewType, label: "Simulation Engine", icon: "simulation" },
    { id: "reports" as ViewType, label: "Reporting Hub", icon: "report" },
    { id: "maps" as ViewType, label: "Resource Maps", icon: "map" },
    { id: "analytics" as ViewType, label: "Analytics", icon: "analytics" }
  ];

  const menuItems = activeProfile === "aris_thorne"
    ? allMenuItems.filter(item => item.id === "reports")
    : allMenuItems;

  return (
    <aside className="glass-panel h-screen w-64 fixed left-0 top-0 border-r border-white/10 flex flex-col py-8 z-[60] select-none text-white backdrop-blur-2xl">
      {/* Brand Logo */}
      <div className="px-6 mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-1.5 font-sans bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 select-none">
          <span className="material-symbols-outlined text-3xl font-bold select-none text-indigo-400 bg-clip-text" style={{ fontVariationSettings: "'FILL' 1" }}>
            location_city
          </span>
          NovaCity
        </h1>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">
          Smart City OS
        </p>
      </div>

      {/* Access Control Status Indicator */}
      <div className="mx-4 mb-6 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
          Security Level
        </p>
        <p className={`text-xs font-bold font-mono mt-0.5 flex items-center gap-1.5 ${
          activeProfile === "aris_thorne" 
            ? "text-amber-400" 
            : activeProfile === "admin_unit_01" 
              ? "text-sky-400" 
              : "text-emerald-400"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            activeProfile === "aris_thorne" 
              ? "bg-amber-400" 
              : activeProfile === "admin_unit_01" 
                ? "bg-sky-400 animate-pulse" 
                : "bg-emerald-400 animate-pulse"
          }`} />
          {activeProfile === "aris_thorne" 
            ? "Restricted Manager" 
            : activeProfile === "admin_unit_01" 
              ? "Employee (Read-Only)" 
              : "Root Admin Access"}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out cursor-pointer ${
                isActive
                  ? "bg-indigo-500/15 text-indigo-300 font-bold border-r-4 border-indigo-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`material-symbols-outlined mr-3 text-xl transition-transform group-hover:scale-105 ${isActive ? "font-bold text-indigo-300" : "text-slate-400"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile dropdown selector */}
      <div className="px-4 mt-auto relative">
        {showProfileSelector && (
          <div className="absolute bottom-16 left-4 right-4 bg-slate-950 rounded-xl shadow-2xl border border-white/15 p-2.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 text-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase px-3 pt-1 pb-2">
              Switch Identity
            </p>
            <div className="space-y-1">
              {PROFILES.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => {
                    onProfileChange(profile.id);
                    setShowProfileSelector(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left text-xs hover:bg-white/5 cursor-pointer transition-colors ${
                    activeProfile === profile.id ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
                  }`}
                >
                  <img
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                    src={profile.img}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-semibold text-white">{profile.name}</p>
                    <p className="text-[10px] text-slate-400">{profile.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Active Profile trigger */}
        <div
          onClick={() => setShowProfileSelector(!showProfileSelector)}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all duration-200 select-none text-white"
        >
          <img
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30"
            src={selectedProfile.img}
            alt={selectedProfile.name}
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-white truncate flex items-center justify-between">
              {selectedProfile.name}
              <span className="material-symbols-outlined text-xs text-slate-400">unfold_more</span>
            </p>
            <p className="text-xs text-slate-400 truncate">{selectedProfile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
