import React, { useState, useEffect } from "react";
import { ViewType } from "../types";

interface HeaderProps {
  currentView: ViewType;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeReportsCount: number;
  onNavigate: (view: ViewType) => void;
  onOpenNotifications: () => void;
  activeProfile?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  activeReportsCount,
  onNavigate,
  onOpenNotifications,
  activeProfile
}) => {
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as "HH:mm:ss UTC" or current timezone
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setSystemTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-50 glass-panel border-b border-white/10 flex justify-between items-center px-10 text-white backdrop-blur-xl">
      <div className="flex-1" />

      {/* Header Quick Stats & Icons */}
      <div className="flex items-center gap-6 ml-auto">
        {/* System Time clock */}
        <div className="hidden md:flex items-center gap-1 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1 rounded text-slate-300 select-none">
          <span className="material-symbols-outlined text-xs text-indigo-400 animate-pulse">schedule</span>
          <span>{systemTime || "00:00:00"}</span>
        </div>

        {/* Live System pill tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold tracking-wider text-[11px] font-mono select-none uppercase">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span>Live System</span>
        </div>

        {/* Notifications Icon Button */}
        <button 
          onClick={onOpenNotifications}
          className="relative text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer select-none flex items-center justify-center p-1 rounded-full hover:bg-white/10"
        >
          <span className="material-symbols-outlined">notifications</span>
          {activeReportsCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#020617]">
              {activeReportsCount}
            </span>
          )}
        </button>

        {/* Settings view launcher (Admin/Root only) */}
        {activeProfile !== "aris_thorne" && (
          <button 
            onClick={() => onNavigate("analytics")}
            className="text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer select-none flex items-center justify-center p-1 rounded-full hover:bg-white/10"
            title="NovaCity Smart Advisor Settings"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        )}
      </div>
    </header>
  );
};
