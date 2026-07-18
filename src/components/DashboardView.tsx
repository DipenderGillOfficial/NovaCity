import React, { useState } from "react";
import { CivicAlert } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface DashboardViewProps {
  alerts: CivicAlert[];
  searchQuery: string;
  onNavigate: (view: any) => void;
  onUpdateAlertStatus: (id: string, status: "active" | "pending" | "resolved") => void;
  onOpenNoticeModal: (incident: CivicAlert) => void;
  onTriggerSimulation: () => void;
  activeProfile?: string;
  suggestions?: any[];
  onAddSuggestion?: (content: string, viewContext: string) => void;
  onUpdateSuggestionStatus?: (id: string, status: "pending" | "approved" | "rejected") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  alerts,
  searchQuery,
  onNavigate,
  onUpdateAlertStatus,
  onOpenNoticeModal,
  onTriggerSimulation,
  activeProfile,
  suggestions = [],
  onAddSuggestion,
  onUpdateSuggestionStatus
}) => {
  // Local Suggestion Form State
  const [newSuggestionText, setNewSuggestionText] = useState("");
  const [suggScope, setSuggScope] = useState("General City Operations");
  const [suggSuccess, setSuggSuccess] = useState(false);

  // Chart Hover Tooltip State
  const [hoveredPulseBar, setHoveredPulseBar] = useState<{
    index: number;
    solar: number;
    grid: number;
    hour: string;
  } | null>(null);

  // States for District Inspector & Historical Trend Chart (Features 1 & 2)
  const [selectedDistrict, setSelectedDistrict] = useState("District 7");
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{
    month: string;
    co2: number;
    solar: number;
    index: number;
  } | null>(null);

  // Filter alerts based on search query
  const filteredAlerts = alerts.filter(
    alert =>
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hourly data for the Live City Pulse chart (matches the screenshot bar charts beautifully)
  const hourlyData = [
    { hour: "00:00", solar: 240, grid: 510 },
    { hour: "02:00", solar: 210, grid: 480 },
    { hour: "04:00", solar: 180, grid: 440 },
    { hour: "06:00", solar: 350, grid: 490 },
    { hour: "08:00", solar: 520, grid: 540 },
    { hour: "10:00", solar: 740, grid: 590 },
    { hour: "12:00", solar: 860, grid: 620 },
    { hour: "14:00", solar: 890, grid: 600 },
    { hour: "16:00", solar: 710, grid: 580 },
    { hour: "18:00", solar: 420, grid: 580 },
    { hour: "20:00", solar: 310, grid: 530 },
    { hour: "22:00", solar: 260, grid: 500 }
  ];

  // Local District Data Map for District Inspector
  const districtDataMap: Record<string, {
    name: string;
    solar: number;
    greenery: number;
    carbon: "High" | "Medium" | "Low";
    waterFlow: number;
    tempAnomaly: string;
    status: "Optimal" | "Active" | "Pending";
    description: string;
  }> = {
    "District 1": {
      name: "Downtown Core",
      solar: 45,
      greenery: 18,
      carbon: "High",
      waterFlow: 420,
      tempAnomaly: "+2.4°C",
      status: "Active",
      description: "Dense commercial and business center. High concentration of micro heat islands. Upgrades to reflective albedo roof membranes and high-density pocket parks are prioritized."
    },
    "District 2": {
      name: "Residential West",
      solar: 65,
      greenery: 35,
      carbon: "Medium",
      waterFlow: 280,
      tempAnomaly: "+1.1°C",
      status: "Pending",
      description: "Low-rise housing sectors with mature urban canopy coverage. Excellent solar capacity margins on southern rooftops."
    },
    "District 4": {
      name: "Waterfront Hub",
      solar: 55,
      greenery: 28,
      carbon: "Medium",
      waterFlow: 510,
      tempAnomaly: "+1.6°C",
      status: "Active",
      description: "Mixed-use coastal developments with high marine-breeze albedo cooling offsets. Localized water runoffs being integrated with bioswales."
    },
    "District 7": {
      name: "Solar Highlands",
      solar: 92,
      greenery: 52,
      carbon: "Low",
      waterFlow: 150,
      tempAnomaly: "-0.4°C",
      status: "Optimal",
      description: "Pinnacle region of high renewable solar farms and municipal carbon reservoirs. Acts as a key battery buffer for peak grid load demands."
    },
    "District 9": {
      name: "Industrial North",
      solar: 30,
      greenery: 12,
      carbon: "High",
      waterFlow: 640,
      tempAnomaly: "+3.1°C",
      status: "Active",
      description: "Manufacturing factories with heavy logistics fleets. High utility load footprint. Retrofitting autonomous high-capacity transit networks reduces trip overhead."
    },
    "District 5": {
      name: "Innovation Hub",
      solar: 80,
      greenery: 42,
      carbon: "Low",
      waterFlow: 220,
      tempAnomaly: "+0.2°C",
      status: "Optimal",
      description: "University complexes and research campuses. Fully optimized smart grids with micro-solar buffers and heat pump cooperatives."
    }
  };

  const districtTrends: Record<string, Array<{ month: string; co2: number; solar: number }>> = {
    "District 1": [
      { month: "Jan", co2: 125, solar: 120 },
      { month: "Feb", co2: 118, solar: 140 },
      { month: "Mar", co2: 114, solar: 180 },
      { month: "Apr", co2: 110, solar: 210 },
      { month: "May", co2: 104, solar: 240 },
      { month: "Jun", co2: 95,  solar: 280 }
    ],
    "District 2": [
      { month: "Jan", co2: 85, solar: 220 },
      { month: "Feb", co2: 80, solar: 260 },
      { month: "Mar", co2: 74, solar: 320 },
      { month: "Apr", co2: 68, solar: 400 },
      { month: "May", co2: 60, solar: 510 },
      { month: "Jun", co2: 52, solar: 620 }
    ],
    "District 4": [
      { month: "Jan", co2: 90, solar: 180 },
      { month: "Feb", co2: 84, solar: 210 },
      { month: "Mar", co2: 78, solar: 260 },
      { month: "Apr", co2: 72, solar: 310 },
      { month: "May", co2: 65, solar: 390 },
      { month: "Jun", co2: 58, solar: 480 }
    ],
    "District 7": [
      { month: "Jan", co2: 95, solar: 310 },
      { month: "Feb", co2: 88, solar: 360 },
      { month: "Mar", co2: 82, solar: 450 },
      { month: "Apr", co2: 74, solar: 590 },
      { month: "May", co2: 68, solar: 740 },
      { month: "Jun", co2: 59, solar: 880 }
    ],
    "District 9": [
      { month: "Jan", co2: 142, solar: 100 },
      { month: "Feb", co2: 138, solar: 120 },
      { month: "Mar", co2: 132, solar: 150 },
      { month: "Apr", co2: 126, solar: 190 },
      { month: "May", co2: 120, solar: 230 },
      { month: "Jun", co2: 114, solar: 270 }
    ],
    "District 5": [
      { month: "Jan", co2: 72, solar: 280 },
      { month: "Feb", co2: 66, solar: 340 },
      { month: "Mar", co2: 58, solar: 420 },
      { month: "Apr", co2: 50, solar: 530 },
      { month: "May", co2: 42, solar: 650 },
      { month: "Jun", co2: 34, solar: 790 }
    ]
  };

  const historicalTrends = districtTrends[selectedDistrict] || districtTrends["District 7"];

  const getCO2Y = (co2Val: number) => {
    const ratio = Math.max(0, Math.min(1, co2Val / 150));
    return 175 - ratio * 145;
  };

  const getSolarY = (solarVal: number) => {
    const ratio = Math.max(0, Math.min(1, solarVal / 1000));
    return 175 - ratio * 145;
  };

  const solarYCoords = historicalTrends.map(t => getSolarY(t.solar));
  const co2YCoords = historicalTrends.map(t => getCO2Y(t.co2));

  const solarPathD = `M 20 ${solarYCoords[0]} Q 100 ${solarYCoords[1]}, 180 ${solarYCoords[2]} T 260 ${solarYCoords[3]} T 340 ${solarYCoords[4]} T 420 ${solarYCoords[5]}`;
  const solarAreaD = `${solarPathD} L 420 180 L 20 180 Z`;

  const co2PathD = `M 20 ${co2YCoords[0]} Q 100 ${co2YCoords[1]}, 180 ${co2YCoords[2]} T 260 ${co2YCoords[3]} T 340 ${co2YCoords[4]} T 420 ${co2YCoords[5]}`;
  const co2AreaD = `${co2PathD} L 420 180 L 20 180 Z`;

  const activeDistrictData = districtDataMap[selectedDistrict] || districtDataMap["District 7"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="pb-12 space-y-10 text-white"
    >
      {/* Header Title & System Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            City Overview
          </h2>
          <div className="flex items-center gap-2 mt-1.5 select-none">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-slate-400 uppercase">
              System Status: Optimal
            </span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3 select-none">
          {activeProfile === "admin_unit_01" ? (
            <>
              <button
                onClick={() => {
                  const targetElement = document.getElementById("employee-suggestions-board");
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="glass-card text-sky-300 border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-all duration-200 animate-pulse"
              >
                <span className="material-symbols-outlined text-lg">rate_review</span>
                Submit Suggestion
              </button>
              <button
                disabled
                className="bg-slate-800 text-slate-500 border border-white/5 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 cursor-not-allowed transition-all duration-200"
              >
                <span className="material-symbols-outlined text-lg">lock</span>
                Simulation Locked
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate("reports")}
                className="glass-card text-indigo-300 border border-white/10 hover:bg-white/5 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-all duration-200"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                New Public Notice
              </button>
              <button
                onClick={onTriggerSimulation}
                className="bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] shadow-lg shadow-indigo-500/20 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-all duration-200"
              >
                <span className="material-symbols-outlined text-lg">play_arrow</span>
                Start Simulation
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bento Grid: Health Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sustainability Score */}
        <div
          onClick={() => onNavigate("simulation")}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between overflow-hidden relative group transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:border-indigo-500/30 hover:bg-white/5 active:scale-[0.99]"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-15 transition-opacity text-indigo-400 select-none">
            <span className="material-symbols-outlined text-9xl">eco</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Sustainability Score
              </p>
              <p className="text-4xl font-extrabold text-indigo-400 mt-2 font-sans">84%</p>
            </div>
            <span className="material-symbols-outlined text-indigo-300 bg-indigo-500/10 p-2.5 rounded-xl">
              trending_up
            </span>
          </div>
          <div className="mt-8 select-none">
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: "84%" }}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2.5 font-semibold">
              +2.4% from last month
            </p>
          </div>
        </div>

        {/* Energy Efficiency */}
        <div
          onClick={() => onNavigate("simulation")}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between overflow-hidden relative group transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:border-pink-500/30 hover:bg-white/5 active:scale-[0.99]"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-15 transition-opacity text-pink-400 select-none">
            <span className="material-symbols-outlined text-9xl">bolt</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Energy Efficiency
              </p>
              <p className="text-4xl font-extrabold text-pink-400 mt-2 font-sans">92%</p>
            </div>
            <span className="material-symbols-outlined text-pink-300 bg-pink-500/10 p-2.5 rounded-xl">
              check_circle
            </span>
          </div>
          <div className="mt-8 select-none">
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div className="bg-pink-500 h-full rounded-full transition-all duration-1000" style={{ width: "92%" }}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2.5 font-semibold">
              Operating at peak performance
            </p>
          </div>
        </div>

        {/* Active Reports */}
        <div
          onClick={() => onNavigate("reports")}
          className="glass-card p-6 rounded-2xl flex flex-col justify-between overflow-hidden relative group transition-all duration-300 hover:-translate-y-1 cursor-pointer hover:border-amber-500/30 hover:bg-white/5 active:scale-[0.99]"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-15 transition-opacity text-amber-400 select-none">
            <span className="material-symbols-outlined text-9xl">warning</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Active Reports
              </p>
              <p className="text-4xl font-extrabold text-amber-400 mt-2 font-sans">{filteredAlerts.filter(a => a.status !== "resolved").length}</p>
            </div>
            <span className="material-symbols-outlined text-amber-400 bg-amber-500/10 p-2.5 rounded-xl">
              priority_high
            </span>
          </div>
          <div className="mt-8 select-none">
            {/* Level blocks indicator mimicking screenshot 1 */}
            <div className="flex gap-1.5">
              <div className="h-2.5 w-full bg-amber-500 rounded-full"></div>
              <div className="h-2.5 w-full bg-amber-500 rounded-full"></div>
              <div className="h-2.5 w-full bg-amber-500 rounded-full"></div>
              <div className="h-2.5 w-full bg-white/10 rounded-full"></div>
              <div className="h-2.5 w-full bg-white/10 rounded-full"></div>
            </div>
            <p className="text-xs text-slate-400 mt-2.5 font-semibold">
              {filteredAlerts.filter(a => a.status === "active").length} critical items requiring attention
            </p>
          </div>
        </div>
      </div>

      {/* Main Sections: Pulse Chart & Civic Alerts list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live City Pulse Chart Panel */}
        <div className="lg:col-span-8 glass-card rounded-2xl flex flex-col overflow-hidden relative">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 select-none">
            <div>
              <h3 className="font-bold text-white font-sans text-lg">
                Live City Pulse
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time energy consumption (MW) vs. Renewables
              </p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  Solar/Wind
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  Grid Load
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Responsive SVG Bar Chart */}
          <div className="p-6 h-[340px] relative flex items-end gap-3 select-none">
            {hourlyData.map((data, idx) => {
              // Normalize values for chart height
              const solarHeight = (data.solar / 1000) * 100; // max 1000MW scale
              const gridHeight = (data.grid / 1000) * 100;

              return (
                <div 
                  key={idx} 
                  className="flex-1 h-full flex items-end gap-1 relative group"
                  onMouseEnter={() => setHoveredPulseBar({ index: idx, solar: data.solar, grid: data.grid, hour: data.hour })}
                  onMouseLeave={() => setHoveredPulseBar(null)}
                >
                  {/* Solar/Wind Bar */}
                  <div
                    className="w-1/2 bg-indigo-500/25 hover:bg-indigo-500/45 rounded-t transition-all cursor-pointer"
                    style={{ height: `${solarHeight}%` }}
                  ></div>
                  
                  {/* Grid Load Bar */}
                  <div
                    className="w-1/2 bg-pink-500/25 hover:bg-pink-500/45 rounded-t transition-all cursor-pointer"
                    style={{ height: `${gridHeight}%` }}
                  ></div>
                </div>
              );
            })}

            {/* Float Tooltip mimicking screenshots */}
            {hoveredPulseBar && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white rounded-xl shadow-xl p-3 border border-white/10 text-xs flex flex-col gap-1.5 z-20 pointer-events-none backdrop-blur-md">
                <p className="font-bold border-b border-white/10 pb-1 text-[10px] tracking-wider uppercase font-mono text-slate-400">
                  Timestamp: {hoveredPulseBar.hour}
                </p>
                <p className="flex justify-between gap-4 font-semibold text-indigo-300">
                  <span>Solar/Wind:</span>
                  <span className="font-mono">{hoveredPulseBar.solar} MW</span>
                </p>
                <p className="flex justify-between gap-4 font-semibold text-pink-300">
                  <span>Grid Load:</span>
                  <span className="font-mono">{hoveredPulseBar.grid} MW</span>
                </p>
              </div>
            )}

            {/* X-Axis labels */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-6 pb-2 text-[10px] font-mono text-slate-400 border-t border-white/10 pt-3 mt-4">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>

        {/* Recent Civic Alerts Panel */}
        <div className="lg:col-span-4 glass-card rounded-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center select-none">
            <h3 className="font-bold text-white font-sans text-lg">
              Civic Alerts
            </h3>
            <button className="text-slate-400 hover:text-white">
              <span className="material-symbols-outlined text-lg">filter_list</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[340px] divide-y divide-white/10">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active alerts matching search.
              </div>
            ) : (
              filteredAlerts.map(alert => {
                // Determine icon based on category/type
                let iconName = "warning";
                let iconBg = "bg-pink-500/10 text-pink-400";
                if (alert.category === "water") {
                  iconName = "plumbing";
                  iconBg = "bg-indigo-500/10 text-indigo-300";
                } else if (alert.category === "grid") {
                  iconName = "bolt";
                  iconBg = "bg-pink-500/10 text-pink-300";
                } else if (alert.category === "sensor") {
                  iconName = "settings";
                  iconBg = "bg-white/10 text-slate-300";
                } else if (alert.category === "pothole") {
                  iconName = "engineering";
                  iconBg = "bg-emerald-500/10 text-emerald-300";
                }

                return (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-white/5 transition-colors duration-150 relative group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${iconBg} p-2 rounded-xl flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-lg">{iconName}</span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                            {alert.title}
                          </h4>
                          {alert.status === "active" && (
                            <span className="w-2 h-2 rounded-full bg-pink-500 pulse-dot flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {alert.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            {alert.time} • {alert.status}
                          </p>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {activeProfile === "admin_unit_01" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const text = `Suggest review/action on alert "${alert.title}" in ${alert.district}. Current status: ${alert.status}.`;
                                  if (onAddSuggestion) {
                                    onAddSuggestion(text, "Dashboard Alert Monitor");
                                  }
                                  const targetElement = document.getElementById("employee-suggestions-board");
                                  if (targetElement) {
                                    targetElement.scrollIntoView({ behavior: "smooth" });
                                  }
                                }}
                                className="text-[10px] font-bold text-sky-400 hover:underline bg-sky-500/10 px-2 py-1 rounded"
                              >
                                Suggest Action
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenNoticeModal(alert);
                                  }}
                                  className="text-[10px] font-bold text-indigo-400 hover:underline bg-indigo-500/10 px-2 py-1 rounded"
                                  title="Draft public warning notification"
                                >
                                  Notice
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateAlertStatus(alert.id, alert.status === "resolved" ? "active" : "resolved");
                                  }}
                                  className="text-[10px] font-bold text-slate-400 hover:underline bg-white/10 px-2 py-1 rounded"
                                >
                                  {alert.status === "resolved" ? "Reopen" : "Resolve"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-4 bg-white/5 text-center select-none border-t border-white/10">
            <button
              onClick={() => onNavigate("reports")}
              className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
            >
              View All Alerts & Reports
            </button>
          </div>
        </div>
      </div>

      {/* Lower Visual Section: District Resource Allocation map banner */}
      <div className="select-none">
        <div className="glass-card rounded-2xl overflow-hidden relative min-h-[300px] flex flex-col justify-center">
          {/* Background Map Graphic Overlay */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center opacity-30 pointer-events-none"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyRxK-8gvOZiZ97sUprnKl5LYb98xL8nepAV-D4_n6_qivDnaRuIMPnlrXNxrOV9zlPHUF3cDta9n6SmBUmCcbJrMT-HStTfpfeJ_twpvAD_tzXHIZanY6b8hpNLLDb2YrCI8dr9ZrtVqC3D5qTQFlHP6YIgWelXz-zKCT_BhKwBMrPyBioVmElHC-6SyIxJnMk5opKxLX3HtCiqlWA4woxPv_lg4wkyo7XjDK3CYWDIEJ2MyPix1qT4ZYOgHayaZyOqQUJ7ZMycc')`
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/85 to-transparent"></div>
          </div>

          <div className="relative z-10 p-8 sm:p-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8 w-full">
            <div className="max-w-xl space-y-4">
              <h3 className="text-2xl font-extrabold text-white font-sans tracking-tight">
                District Resource Allocation
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualize real-time deployment of emergency services, maintenance crews, and energy load balancing across all 12 city districts.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => onNavigate("maps")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98] px-6 py-2.5 rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">map</span>
                  Launch Map Viewer
                </button>
                <button
                  onClick={() => onNavigate("analytics")}
                  className="glass-card border border-white/10 text-white hover:bg-white/5 px-6 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200"
                >
                  District Metrics
                </button>
              </div>
            </div>

            {/* Floating stat card blocks */}
            <div className="flex gap-4 self-start lg:self-auto">
              <div className="bg-white/5 backdrop-blur p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col min-w-[120px]">
                <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  Active Crews
                </p>
                <p className="text-2xl font-extrabold text-indigo-400 mt-1">142</p>
              </div>
              <div className="bg-white/5 backdrop-blur p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col min-w-[120px]">
                <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  Avg Response
                </p>
                <p className="text-2xl font-extrabold text-pink-400 mt-1">4.2m</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 1 & 2: District Insights & Historical Resource Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Insights Panel (7 Columns) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1.5 select-none">
            <h3 className="font-bold text-white font-sans text-lg">
              District Insights & Health Rankings
            </h3>
            <p className="text-xs text-slate-400">
              Select a district to inspect localized temperature, canopy coverage, and green infrastructure status.
            </p>
          </div>

          {/* Grid of Districts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(districtDataMap).map(([id, d]) => {
              const isSelected = selectedDistrict === id;
              let statusDot = "bg-rose-500 animate-pulse";
              if (d.status === "Optimal") statusDot = "bg-emerald-400";
              else if (d.status === "Pending") statusDot = "bg-amber-400";

              return (
                <div
                  key={id}
                  onClick={() => setSelectedDistrict(id)}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left select-none relative overflow-hidden group ${
                    isSelected
                      ? "bg-indigo-600/15 border-indigo-500/80 shadow-md shadow-indigo-500/10"
                      : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {id}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {d.name}
                  </p>
                  
                  {/* Quick indicators */}
                  <div className="flex items-center gap-2 mt-2 font-mono text-[8px] text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[9px] text-indigo-400">bolt</span>
                      {d.solar}%
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[9px] text-emerald-400">eco</span>
                      {d.greenery}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Focused Active District Inspector Card */}
          <div className="bg-indigo-950/35 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-white/5 pb-3 select-none">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold font-mono">
                  {selectedDistrict}
                </span>
                <h4 className="text-sm font-bold text-white font-sans">
                  {activeDistrictData.name} Overview
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase flex items-center gap-1 bg-white/5 border border-white/10 text-slate-300`}>
                <span className={`w-1 h-1 rounded-full ${
                  activeDistrictData.status === "Optimal" ? "bg-emerald-400" : activeDistrictData.status === "Pending" ? "bg-amber-400" : "bg-rose-500 animate-pulse"
                }`} />
                {activeDistrictData.status} State
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="space-y-1">
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider select-none">Solar Capacity</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-indigo-400 select-none">solar_power</span>
                  <span className="text-sm font-extrabold font-mono text-white">{activeDistrictData.solar}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider select-none">Tree Canopy</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-emerald-400 select-none">park</span>
                  <span className="text-sm font-extrabold font-mono text-white">{activeDistrictData.greenery}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider select-none">Thermal Offset</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-pink-400 select-none">device_thermostat</span>
                  <span className={`text-sm font-extrabold font-mono ${activeDistrictData.tempAnomaly.startsWith("-") ? "text-emerald-400" : "text-rose-400"}`}>
                    {activeDistrictData.tempAnomaly}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider select-none">Water System Demand</p>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-sky-400 select-none">water_drop</span>
                  <span className="text-sm font-extrabold font-mono text-white">{activeDistrictData.waterFlow} L/s</span>
                </div>
              </div>
            </div>

            {/* Environmental Microclimate Diagnostics sensor readings */}
            {(() => {
              // Derive environmental stats dynamically based on district profile
              let aqi = 55;
              let humidity = 58;
              let wind = "12.5 km/h NW";
              let pm25 = 14.2;
              let aqiColor = "text-emerald-400";
              let aqiStatus = "Excellent";

              if (selectedDistrict === "District 1") {
                aqi = 145; humidity = 42; wind = "4.8 km/h SE"; pm25 = 38.5; aqiColor = "text-rose-400"; aqiStatus = "Unhealthy (Sensitive)";
              } else if (selectedDistrict === "District 2") {
                aqi = 58; humidity = 64; wind = "12.1 km/h W"; pm25 = 12.2; aqiColor = "text-emerald-300"; aqiStatus = "Good";
              } else if (selectedDistrict === "District 4") {
                aqi = 45; humidity = 78; wind = "19.4 km/h SSE"; pm25 = 8.4; aqiColor = "text-emerald-400"; aqiStatus = "Excellent";
              } else if (selectedDistrict === "District 7") {
                aqi = 22; humidity = 50; wind = "24.8 km/h NW"; pm25 = 4.1; aqiColor = "text-emerald-400"; aqiStatus = "Excellent";
              } else if (selectedDistrict === "District 9") {
                aqi = 188; humidity = 38; wind = "8.2 km/h NE"; pm25 = 74.5; aqiColor = "text-rose-500 animate-pulse"; aqiStatus = "Unhealthy";
              } else if (selectedDistrict === "District 5") {
                aqi = 35; humidity = 58; wind = "11.5 km/h NNE"; pm25 = 6.8; aqiColor = "text-emerald-400"; aqiStatus = "Excellent";
              }

              return (
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                    <span className="material-symbols-outlined text-xs text-indigo-400 animate-pulse">airwave</span>
                    Microclimate & Ambient Sensors
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider select-none">Air Quality Index</p>
                      <p className={`text-xs font-extrabold ${aqiColor} font-mono flex items-center gap-1`}>
                        {aqi} AQI <span className="text-[9px] font-normal text-slate-400">({aqiStatus})</span>
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider select-none">Relative Humidity</p>
                      <p className="text-xs font-extrabold text-white font-mono">{humidity}% RH</p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider select-none">Wind Velocity</p>
                      <p className="text-xs font-extrabold text-white font-mono flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px] text-sky-400">wind_power</span>
                        {wind}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider select-none">Particulate PM2.5</p>
                      <p className="text-xs font-extrabold text-white font-mono">{pm25} µg/m³</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1 border-t border-white/5">
              {activeDistrictData.description}
            </p>
          </div>
        </div>

        {/* 6-Month Historical Trends SVG Chart Panel (5 Columns) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5 select-none">
            <h3 className="font-bold text-white font-sans text-lg">
              Historical Operational Trends
            </h3>
            <p className="text-xs text-slate-400">
              6-month telemetry charting relative CO2 footprint reductions against renewable solar output gains.
            </p>
          </div>

          {/* Interactive SVG Chart Container */}
          <div className="relative h-[220px] w-full mt-4 flex flex-col justify-end">
            <svg viewBox="0 0 450 200" className="w-full h-full overflow-visible select-none">
              <defs>
                {/* Gradients */}
                <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="450" y2="40" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="100" x2="450" y2="100" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="0" y1="160" x2="450" y2="160" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3,3" />

              {/* Area Under Lines (Fill) */}
              {/* Solar Area */}
              <path
                d={solarAreaD}
                fill="url(#solarGrad)"
              />
              {/* CO2 Area */}
              <path
                d={co2AreaD}
                fill="url(#co2Grad)"
              />

              {/* Stroke Lines */}
              {/* Solar (indigo) */}
              <path
                d={solarPathD}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* CO2 (pink) */}
              <path
                d={co2PathD}
                fill="none"
                stroke="#ec4899"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="1"
              />

              {/* Vertical Interactive Hover Regions (6 regions) */}
              {historicalTrends.map((t, idx) => {
                const xCoord = 20 + idx * 80;
                return (
                  <g key={idx}>
                    {/* Invisible Wide Bar for Hover Trigger */}
                    <rect
                      x={xCoord - 40}
                      y="10"
                      width="80"
                      height="170"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredTrendPoint({ month: t.month, co2: t.co2, solar: t.solar, index: idx })}
                      onMouseLeave={() => setHoveredTrendPoint(null)}
                    />
                    {/* Visual markers for hover feedback */}
                    {hoveredTrendPoint && hoveredTrendPoint.index === idx && (
                      <line x1={xCoord} y1="20" x2={xCoord} y2="180" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="1.5" />
                    )}
                  </g>
                );
              })}

              {/* Month Labels along X Axis */}
              <text x="20" y="195" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">JAN</text>
              <text x="100" y="195" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">FEB</text>
              <text x="180" y="195" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">MAR</text>
              <text x="260" y="195" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">APR</text>
              <text x="340" y="195" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">MAY</text>
              <text x="420" y="195" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">JUN</text>
            </svg>

            {/* Float Tooltip */}
            <div className="h-10 mt-2 select-none relative">
              <AnimatePresence>
                {hoveredTrendPoint ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-0 bg-slate-900/90 border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between text-xs backdrop-blur-md"
                  >
                    <span className="font-bold text-slate-300 font-mono tracking-wider">{hoveredTrendPoint.month.toUpperCase()} Telemetry</span>
                    <div className="flex gap-4">
                      <span className="text-indigo-300 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Solar: <span className="font-mono text-white">{hoveredTrendPoint.solar}MWh</span>
                      </span>
                      <span className="text-pink-300 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                        Carbon Index: <span className="font-mono text-white">{hoveredTrendPoint.co2}pt</span>
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-slate-400 text-[10px] text-center pt-2 font-mono flex items-center justify-center gap-1 border-t border-white/5 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-xs animate-pulse text-indigo-400">touch_app</span>
                    Hover across columns to preview detailed monthly telemetry
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Advisory & Suggestions Board Panel */}
      <div id="employee-suggestions-board" className="glass-card border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 select-none">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-sans">
              <span className="material-symbols-outlined text-sky-400">rate_review</span>
              Employee Suggestions Board
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Transparent log of municipal feedback and operational improvements submitted by district workers.
            </p>
          </div>
          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 self-start md:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Active Feedback Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submit panel for Employee */}
          {activeProfile === "admin_unit_01" && (
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <p className="text-xs font-bold font-mono uppercase text-sky-400 tracking-widest flex items-center gap-1.5 select-none">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                Submit Operational Suggestion
              </p>
              
              {suggSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
                  Advisory suggestion logged! It has been dispatched to the Root Admin.
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest select-none">Impact Scope / Department</label>
                  <select
                    value={suggScope}
                    onChange={(e) => setSuggScope(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="General City Operations">General Operations</option>
                    <option value="Simulation Modeling">Simulation Modeling</option>
                    <option value="Reporting Hub Alerts">Alert Logging & Notices</option>
                    <option value="Sustainability Allocations">Green Space & Energy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest select-none">Advisory Feedback Details</label>
                  <textarea
                    rows={4}
                    value={newSuggestionText}
                    onChange={(e) => setNewSuggestionText(e.target.value)}
                    placeholder="Provide specific parameter targets or municipal adjustments..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!newSuggestionText.trim()) return;
                    if (onAddSuggestion) {
                      onAddSuggestion(newSuggestionText, suggScope);
                    }
                    setNewSuggestionText("");
                    setSuggSuccess(true);
                    setTimeout(() => setSuggSuccess(false), 3000);
                  }}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm shadow-sky-500/10 cursor-pointer"
                >
                  Post to Suggestions Board
                </button>
              </div>
            </div>
          )}

          {/* Feed list */}
          <div className={`${activeProfile === "admin_unit_01" ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
            <p className="text-xs font-bold font-mono uppercase text-slate-400 tracking-widest select-none">
              Live Suggestions Feed ({suggestions.length})
            </p>

            {suggestions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-slate-400 text-xs select-none">
                No employees have filed feedback suggestions in this cycle.
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {suggestions.map((s) => {
                  let statusColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                  let statusLabel = "Pending Review";
                  let statusIcon = "schedule";
                  if (s.status === "approved") {
                    statusColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                    statusLabel = "Approved";
                    statusIcon = "check_circle";
                  } else if (s.status === "rejected") {
                    statusColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                    statusLabel = "Declined";
                    statusIcon = "cancel";
                  }

                  return (
                    <div key={s.id} className="bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-xl transition-all space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                            E1
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{s.author}</p>
                            <p className="text-[9px] font-mono text-slate-500 mt-0.5">Filed under: <span className="text-indigo-400">{s.viewContext}</span></p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase flex items-center gap-1 ${statusColor}`}>
                          <span className="material-symbols-outlined text-[10px]">{statusIcon}</span>
                          {statusLabel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pl-8">
                        {s.content}
                      </p>

                      {/* Admin Management Controls */}
                      {activeProfile === "admin_root" && s.status === "pending" && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5 pl-8 select-none">
                          <span className="text-[10px] font-mono text-slate-400 mr-auto font-bold uppercase tracking-wide">Review Action:</span>
                          <button
                            onClick={() => onUpdateSuggestionStatus && onUpdateSuggestionStatus(s.id, "rejected")}
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[12px]">close</span>
                            Decline
                          </button>
                          <button
                            onClick={() => onUpdateSuggestionStatus && onUpdateSuggestionStatus(s.id, "approved")}
                            className="bg-emerald-500/25 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5 shadow-sm shadow-emerald-500/10"
                          >
                            <span className="material-symbols-outlined text-[12px]">check</span>
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
