import React, { useState } from "react";
import { ViewType } from "../types";
import { soundscapeEngine } from "../lib/audioEngine";

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
  const [activeAudioFeed, setActiveAudioFeed] = useState(soundscapeEngine.getCurrentFeed());
  const [audioVolume, setAudioVolume] = useState(soundscapeEngine.getVolume());

  const handleAudioToggle = (feed: string) => {
    if (activeAudioFeed === feed) {
      soundscapeEngine.stopAll();
      setActiveAudioFeed("off");
    } else {
      soundscapeEngine.playFeed(feed);
      setActiveAudioFeed(feed);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    soundscapeEngine.setVolume(newVol);
    setAudioVolume(newVol);
  };

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
    <aside className="glass-panel h-screen w-64 fixed left-0 top-0 border-r border-white/10 flex flex-col py-6 z-[60] select-none text-white backdrop-blur-2xl">
      {/* Brand Logo - Fixed */}
      <div className="px-6 mb-4 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-1.5 font-sans bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 select-none">
          <span className="material-symbols-outlined text-3xl font-bold select-none text-indigo-400 bg-clip-text" style={{ fontVariationSettings: "'FILL' 1" }}>
            location_city
          </span>
          Bloomfield
        </h1>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">
          Environmental & Civic OS
        </p>
      </div>

      {/* Scrollable Center Area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 min-h-0">
        {/* Navigation Links */}
        <nav className="space-y-1 px-2">
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

        {/* Sonic Environment Diagnostic Feeds */}
        <div className="mx-3 p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3 select-none">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-indigo-400 animate-pulse">volume_up</span>
              Sonic Diagnostics
            </p>
            {activeAudioFeed !== "off" && (
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded animate-pulse">
                LIVE FEED
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleAudioToggle("lake")}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left truncate transition-all duration-150 cursor-pointer ${
                activeAudioFeed === "lake"
                  ? "bg-indigo-500/20 border border-indigo-400 text-indigo-200"
                  : "bg-white/5 border border-transparent text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Listen to synthesized low-frequency lake wave noise"
            >
              🌊 Upper Lake
            </button>
            <button
              onClick={() => handleAudioToggle("transit")}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left truncate transition-all duration-150 cursor-pointer ${
                activeAudioFeed === "transit"
                  ? "bg-indigo-500/20 border border-indigo-400 text-indigo-200"
                  : "bg-white/5 border border-transparent text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Listen to synthesized deep 55Hz transit hum"
            >
              ⚡ Transit Hum
            </button>
            <button
              onClick={() => handleAudioToggle("solar")}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left truncate transition-all duration-150 cursor-pointer ${
                activeAudioFeed === "solar"
                  ? "bg-indigo-500/20 border border-indigo-400 text-indigo-200"
                  : "bg-white/5 border border-transparent text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Listen to solar grid inverter micro resonance"
            >
              🔆 Solar Inverters
            </button>
            <button
              onClick={() => handleAudioToggle("park")}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left truncate transition-all duration-150 cursor-pointer ${
                activeAudioFeed === "park"
                  ? "bg-indigo-500/20 border border-indigo-400 text-indigo-200"
                  : "bg-white/5 border border-transparent text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Listen to synthesized organic biosphere park birds"
            >
              🌲 Park Biosphere
            </button>
          </div>

          <button
            onClick={() => {
              soundscapeEngine.stopAll();
              setActiveAudioFeed("off");
            }}
            className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center transition-all duration-150 cursor-pointer border ${
              activeAudioFeed === "off"
                ? "bg-slate-900/60 border-white/5 text-slate-500 cursor-not-allowed"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
            }`}
            disabled={activeAudioFeed === "off"}
            title="Stop all sound feeds"
          >
            {activeAudioFeed === "off" ? "🔇 Audio Off" : "🔇 Stop Sound Feed"}
          </button>

          {activeAudioFeed !== "off" && (
            <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
              <span className="material-symbols-outlined text-[13px] text-slate-400">volume_down</span>
              <input
                type="range"
                min="0.01"
                max="0.90"
                step="0.01"
                value={audioVolume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-indigo-500 cursor-pointer"
              />
              <span className="material-symbols-outlined text-[13px] text-slate-400">volume_up</span>
            </div>
          )}
        </div>
      </div>

      {/* User profile dropdown selector - Fixed */}
      <div className="px-4 mt-auto pt-4 border-t border-white/5 shrink-0 relative">
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
                  ></img>
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
          ></img>
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
