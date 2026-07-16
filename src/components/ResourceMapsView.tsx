import React, { useState, useEffect } from "react";
import { ActiveLayerState } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ResourceMapsViewProps {
  searchQuery: string;
}

export const ResourceMapsView: React.FC<ResourceMapsViewProps> = ({ searchQuery }) => {
  const [layers, setLayers] = useState<ActiveLayerState>({
    powerGrid: true,
    waterNetworks: false,
    evCharging: true,
    airQuality: true
  });

  const [activeTab, setActiveTab] = useState<"live" | "historical" | "simulated">("live");
  
  // Interactive Auto-Route trigger state
  const [isAutoRerouted, setIsAutoRerouted] = useState(false);
  const [isRerouting, setIsRerouting] = useState(false);
  const [gridStability, setGridStability] = useState(98.4);

  // New States for Historical and Simulated tab actions
  const [isSimulatingGrid, setIsSimulatingGrid] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [isExportingLogs, setIsExportingLogs] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Dynamic values for EV Charging load wave (simulates live fluctuating load)
  const [evWavePoints, setEvWavePoints] = useState("M0,80 Q50,20 100,60 T200,40 T300,70 T400,30");
  const [evLiveTick, setEvLiveTick] = useState(0);

  // Hover states for heatmap grid cell
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; demand: number } | null>(null);

  // Zoom state for interactive map
  const [zoom, setZoom] = useState<number>(1.0);

  // Toggle individual layers
  const toggleLayer = (layer: keyof ActiveLayerState) => {
    setLayers({
      ...layers,
      [layer]: !layers[layer]
    });
  };

  // Simulating live update waves for the EV Station occupancy SVG
  useEffect(() => {
    const interval = setInterval(() => {
      setEvLiveTick(prev => prev + 1);
      // Generate slightly fluctuating SVG path points
      const p1 = Math.floor(65 + Math.random() * 15);
      const p2 = Math.floor(25 + Math.random() * 10);
      const p3 = Math.floor(55 + Math.random() * 15);
      const p4 = Math.floor(35 + Math.random() * 10);
      const p5 = Math.floor(65 + Math.random() * 15);
      const p6 = Math.floor(25 + Math.random() * 10);
      setEvWavePoints(`M0,${p1} Q50,${p2} 100,${p3} T200,${p4} T300,${p5} T400,${p6}`);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Trigger the Auto-route animation
  const handleAutoRoute = () => {
    setIsRerouting(true);
    setTimeout(() => {
      setIsRerouting(false);
      setIsAutoRerouted(true);
      setGridStability(99.8);
    }, 300);
  };

  const handleRunSimulation = () => {
    setIsSimulatingGrid(true);
    setTimeout(() => {
      setIsSimulatingGrid(false);
      setSimulationComplete(true);
    }, 600);
  };

  const handleExportLogs = () => {
    setIsExportingLogs(true);
    setTimeout(() => {
      setIsExportingLogs(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 600);
  };

  // Distinct Heatmap Grid data per tab
  const getHeatmapGrid = () => {
    switch (activeTab) {
      case "historical":
        return [
          [40, 50, 60, 45, 30],
          [35, 70, 85, 75, 40],
          [25, 80, 90, 85, 35],
          [30, 60, 70, 65, 30],
          [15, 30, 45, 35, 20]
        ];
      case "simulated":
        return [
          [5, 12, 18, 12, 5],
          [12, 22, 35, 22, 12],
          [18, 35, 50, 35, 18],
          [12, 22, 35, 22, 12],
          [5, 12, 18, 12, 5]
        ];
      case "live":
      default:
        return [
          [15, 25, 45, 15, 20],
          [30, 65, 55, 40, 25],
          [10, 75, 95, 80, 15],
          [20, 45, 60, 45, 20],
          [5, 15, 25, 15, 5]
        ];
    }
  };

  const heatmapGrid = getHeatmapGrid();

  const getWasteData = () => {
    switch (activeTab) {
      case "historical":
        return [
          { height: "85%", active: false },
          { height: "90%", active: false },
          { height: "95%", active: true },
          { height: "80%", active: false },
          { height: "88%", active: true },
          { height: "75%", active: false },
          { height: "70%", active: false }
        ];
      case "simulated":
        return [
          { height: "40%", active: false },
          { height: "35%", active: false },
          { height: "50%", active: true },
          { height: "42%", active: false },
          { height: "45%", active: true },
          { height: "30%", active: false },
          { height: "25%", active: false }
        ];
      case "live":
      default:
        return [
          { height: "60%", active: false },
          { height: "45%", active: false },
          { height: "85%", active: true },
          { height: "70%", active: false },
          { height: "95%", active: true },
          { height: "55%", active: false },
          { height: "30%", active: false }
        ];
    }
  };

  const wasteData = getWasteData();

  const getEvWavePoints = () => {
    switch (activeTab) {
      case "historical":
        return "M0,75 Q100,20 200,85 T400,30";
      case "simulated":
        return "M0,45 Q100,35 200,55 T400,30";
      case "live":
      default:
        return evWavePoints;
    }
  };

  const activeEvWave = getEvWavePoints();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="pb-12 space-y-8 text-white"
    >
      {/* Page Header & View Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 select-none">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Resource Intelligence
          </h2>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            Real-time spatial analysis and infrastructure metrics.
          </p>
        </div>

        {/* Triple Filters */}
        <div className="flex gap-1.5 glass-panel p-1 rounded-xl border border-white/10 backdrop-blur-md">
          {(["live", "historical", "simulated"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5"
              }`}
            >
              <span className="capitalize">{tab === "live" ? "Live View" : tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left Column: Interactive Map & Bottom Charts */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Map Canvas Overlay */}
          <div className="relative glass-panel border border-white/10 rounded-2xl overflow-hidden h-[450px]">
            {/* Zoomable Container Wrapper */}
            <div 
              className="absolute inset-0 w-full h-full transition-all duration-300 ease-out origin-center"
              style={{
                transform: `scale(${zoom})`,
              }}
            >
              {/* Base Map Image with San Francisco structure style */}
              <div className="absolute inset-0 z-0 select-none">
                <div 
                  className={`w-full h-full bg-cover bg-center pointer-events-none transition-all duration-500 ${
                    activeTab === "historical" 
                      ? "sepia brightness-[0.6] contrast-[1.1] saturate-[0.6] opacity-25" 
                      : activeTab === "simulated"
                      ? "hue-rotate-[130deg] brightness-[0.7] saturate-[1.3] opacity-35"
                      : "grayscale opacity-30"
                  }`}
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyRxK-8gvOZiZ97sUprnKl5LYb98xL8nepAV-D4_n6_qivDnaRuIMPnlrXNxrOV9zlPHUF3cDta9n6SmBUmCcbJrMT-HStTfpfeJ_twpvAD_tzXHIZanY6b8hpNLLDb2YrCI8dr9ZrtVqC3D5qTQFlHP6YIgWelXz-zKCT_BhKwBMrPyBioVmElHC-6SyIxJnMk5opKxLX3HtCiqlWA4woxPv_lg4wkyo7XjDK3CYWDIEJ2MyPix1qT4ZYOgHayaZyOqQUJ7ZMycc')`
                  }}
                />
              </div>

              {/* Glowing Map Layers depending on Active State */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-60">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10 mix-blend-overlay"></div>
              </div>

              {/* SVG Interactive network nodes overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                {/* Power grid active nodes */}
                {layers.powerGrid && (
                  <g className="transition-all duration-500">
                    <circle cx="35%" cy="30%" r="8" fill="#6366f1" className="pulse-dot" />
                    <circle cx="65%" cy="40%" r="8" fill="#6366f1" className="pulse-dot" />
                    <line x1="35%" y1="30%" x2="65%" y2="40%" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="5, 4" className="animate-pulse" />
                    {isRerouting && (
                      <line x1="35%" y1="30%" x2="50%" y2="70%" stroke="#10b981" strokeWidth="4" strokeDasharray="3, 3" />
                    )}
                    {isAutoRerouted && (
                      <g>
                        <circle cx="50%" cy="70%" r="9" fill="#10b981" />
                        <line x1="35%" y1="30%" x2="50%" y2="70%" stroke="#10b981" strokeWidth="3" />
                        <line x1="65%" y1="40%" x2="50%" y2="70%" stroke="#10b981" strokeWidth="3" />
                      </g>
                    )}
                  </g>
                )}

                {/* Water networks */}
                {layers.waterNetworks && (
                  <g className="transition-all duration-500">
                    <path d="M 120 180 Q 250 120 480 340 T 600 210" fill="none" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="4" />
                    <circle cx="120" cy="180" r="6" fill="#38bdf8" />
                    <circle cx="480" cy="340" r="6" fill="#38bdf8" />
                  </g>
                )}

                {/* EV Charging active nodes */}
                {layers.evCharging && (
                  <g className="transition-all duration-500">
                    <circle cx="28%" cy="65%" r="6" fill="#ec4899" />
                    <circle cx="58%" cy="75%" r="6" fill="#ec4899" />
                    <circle cx="72%" cy="48%" r="6" fill="#ec4899" />
                  </g>
                )}

                {/* Air Quality node indicators */}
                {layers.airQuality && (
                  <g className="transition-all duration-500">
                    <circle cx="48%" cy="25%" r="10" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1" />
                    <circle cx="82%" cy="35%" r="10" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" strokeWidth="1" />
                    <circle cx="22%" cy="45%" r="10" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1" />
                  </g>
                )}

                {/* Historical-specific annotations */}
                {activeTab === "historical" && (
                  <g className="transition-all duration-500">
                    <circle cx="45%" cy="50%" r="14" fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3, 3" />
                    <circle cx="45%" cy="50%" r="4" fill="#f59e0b" />
                    
                    <circle cx="75%" cy="60%" r="14" fill="rgba(245, 158, 11, 0.12)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3, 3" />
                    <circle cx="75%" cy="60%" r="4" fill="#f59e0b" />
                  </g>
                )}

                {/* Simulated-specific annotations */}
                {activeTab === "simulated" && (
                  <g className="transition-all duration-500">
                    <line x1="28%" y1="65%" x2="50%" y2="70%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4, 4" />
                    <line x1="58%" y1="75%" x2="50%" y2="70%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4, 4" />
                    <line x1="72%" y1="48%" x2="65%" y2="40%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4, 4" />
                    {simulationComplete && (
                      <g>
                        <circle cx="50%" cy="70%" r="12" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1.5" />
                        <circle cx="50%" cy="70%" r="4" fill="#10b981" />
                      </g>
                    )}
                  </g>
                )}
              </svg>
            </div>

            {/* Active Layers control panel (Glassmorphic) overlay */}
            <div className="absolute top-6 left-6 z-20 w-64 glass-panel bg-slate-950/90 p-5 rounded-2xl shadow-md border border-white/10 select-none backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                  <span className="material-symbols-outlined text-sm mr-2 select-none text-indigo-400">layers</span>
                  Layers
                </h3>
                <button
                  onClick={() => {
                    setLayers({
                      powerGrid: true,
                      waterNetworks: false,
                      evCharging: true,
                      airQuality: true
                    });
                    setZoom(1.0);
                    setIsAutoRerouted(false);
                    setIsRerouting(false);
                    setGridStability(98.4);
                    setIsSimulatingGrid(false);
                    setSimulationComplete(false);
                    setIsExportingLogs(false);
                    setExportComplete(false);
                  }}
                  className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-all flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-1 rounded border border-white/5 hover:border-indigo-500/30 active:scale-95"
                  title="Reset all layers and parameters for this zone"
                >
                  <span className="material-symbols-outlined text-[12px]">restart_alt</span>
                  Reset Zone
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Power Grid */}
                <label className="flex items-center group cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={layers.powerGrid}
                    onChange={() => toggleLayer("powerGrid")}
                    className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                  />
                  <span className="ml-3 text-xs font-bold text-slate-200 flex-1">Power Grid</span>
                  <span className="w-2 h-2 rounded-full bg-[#6366f1] pulse-dot"></span>
                </label>

                {/* Water Networks */}
                <label className="flex items-center group cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={layers.waterNetworks}
                    onChange={() => toggleLayer("waterNetworks")}
                    className="rounded border-white/20 text-sky-500 focus:ring-sky-400 h-4 w-4 cursor-pointer"
                  />
                  <span className="ml-3 text-xs font-bold text-slate-200 flex-1">Water Networks</span>
                  {layers.waterNetworks && <span className="w-2 h-2 rounded-full bg-sky-400 pulse-dot"></span>}
                </label>

                {/* EV Charging Stations */}
                <label className="flex items-center group cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={layers.evCharging}
                    onChange={() => toggleLayer("evCharging")}
                    className="rounded border-white/20 text-pink-500 focus:ring-pink-450 h-4 w-4 cursor-pointer"
                  />
                  <span className="ml-3 text-xs font-bold text-slate-200 flex-1">EV Charging Stations</span>
                  <span className="w-2 h-2 rounded-full bg-[#ec4899]"></span>
                </label>

                {/* Air Quality Sensors */}
                <label className="flex items-center group cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={layers.airQuality}
                    onChange={() => toggleLayer("airQuality")}
                    className="rounded border-white/20 text-rose-500 focus:ring-rose-450 h-4 w-4 cursor-pointer"
                  />
                  <span className="ml-3 text-xs font-bold text-slate-200 flex-1">Air Quality Sensors</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                </label>
              </div>
            </div>

            {/* Map UI Control Buttons */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 select-none">
              <button 
                onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                className="w-10 h-10 glass-panel bg-slate-950/90 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white pointer-events-auto transition-all cursor-pointer hover:bg-white/5 active:scale-95"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
              <button 
                onClick={() => setZoom(z => Math.max(0.7, z - 0.15))}
                className="w-10 h-10 glass-panel bg-slate-950/90 border border-white/10 rounded-xl flex items-center justify-center text-slate-300 hover:text-white pointer-events-auto transition-all cursor-pointer hover:bg-white/5 active:scale-95"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-lg">remove</span>
              </button>
            </div>

            {/* Legend bar */}
            <div className="absolute bottom-6 left-6 z-20 glass-panel bg-slate-950/90 border border-white/10 px-4 py-3 rounded-2xl select-none backdrop-blur-md">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">Critical Load</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">Optimal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500"></div>
                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">Maintenance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dual charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
            {/* Weekly Waste Volume */}
            <div className="glass-card border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">
                    Weekly Waste Volume
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Metric Tonnes (District 04)</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                  -4.2%
                </span>
              </div>
              
              {/* Waste Bar Chart Blocks */}
              <div className="h-28 w-full flex items-end gap-3 px-1">
                {wasteData.map((bar, index) => (
                  <div key={index} className="flex-1 flex flex-col justify-end h-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: bar.height }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`w-full rounded-t-sm transition-all duration-300 hover:bg-indigo-400 ${
                        bar.active ? "bg-indigo-500" : "bg-white/10"
                      }`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-white/10">
                <span>Mon</span>
                <span>Wed</span>
                <span>Sun</span>
              </div>
            </div>

            {/* EV Charging Usage occupancy area wave */}
            <div className="glass-card border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">
                    EV Station Load
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeTab === "live" ? "Real-time Occupancy" : activeTab === "historical" ? "Monthly Averaged" : "Forecasted Demand"}
                  </p>
                </div>
                {activeTab === "live" ? (
                  <div className="flex items-center text-xs text-pink-400 font-bold">
                    <span className="pulse-dot w-2 h-2 rounded-full bg-pink-500 mr-2"></span>
                    LIVE
                  </div>
                ) : activeTab === "historical" ? (
                  <div className="flex items-center text-xs text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                    HISTORIC
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                    SIMULATION
                  </div>
                )}
              </div>
              
              {/* Dynamic SVG occupancy wave area */}
              <div className="relative h-28 w-full overflow-hidden">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <path 
                    className="text-pink-400 transition-all duration-[2000ms] ease-in-out" 
                    d={activeEvWave} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                  />
                  <path 
                    className="fill-pink-500/5 transition-all duration-[2000ms] ease-in-out" 
                    d={`${activeEvWave} L400,100 L0,100 Z`}
                  />
                </svg>
              </div>

              <div className="flex justify-between mt-3 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest pt-2 border-t border-white/10">
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Demand Map & Sector Stats */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Heatmap Grid card */}
          <div className="glass-card border border-white/10 rounded-2xl p-6 flex flex-col h-[450px]">
            <div className="mb-6 select-none">
              <h4 className="text-sm font-bold text-white font-sans">
                Demand vs. Availability
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">District-level heat intensity mapping</p>
            </div>

            {/* 5x5 Heatmap Matrix */}
            <div className="flex-1 grid grid-cols-5 grid-rows-5 gap-1.5 relative select-none">
              {heatmapGrid.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  // Style opacity or bg based on demand value
                  let bgClass = "bg-pink-500/10 hover:bg-pink-500/30";
                  if (val > 80) bgClass = "bg-indigo-500 border border-indigo-400 hover:scale-105";
                  else if (val > 60) bgClass = "bg-indigo-500/70 hover:scale-105";
                  else if (val > 40) bgClass = "bg-pink-500/50 hover:scale-105";
                  else if (val > 20) bgClass = "bg-pink-500/25 hover:scale-105";

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onMouseEnter={() => setHoveredCell({ r: rIdx + 1, c: cIdx + 1, demand: val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`${bgClass} rounded-lg cursor-pointer transition-all duration-250`}
                    />
                  );
                })
              )}

              {/* Tooltip for cell details */}
              {hoveredCell && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 text-white rounded-xl shadow-xl px-4 py-2 border border-white/10 text-xs pointer-events-none z-30 font-mono text-center backdrop-blur-md">
                  <p className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                    District R{hoveredCell.r}-C{hoveredCell.c}
                  </p>
                  <p className="mt-1 font-semibold text-[11px]">
                    Grid Load: {hoveredCell.demand}%
                  </p>
                </div>
              )}
            </div>

            {/* Low vs Surplus spectrum bar */}
            <div className="mt-5 flex items-center justify-between select-none">
              <span className="text-[9px] font-mono font-bold text-slate-500">LOW DEMAND</span>
              <div className="h-2.5 flex-1 mx-4 rounded-full bg-gradient-to-r from-pink-500/20 via-indigo-500/50 to-indigo-500"></div>
              <span className="text-[9px] font-mono font-bold text-slate-500">SURPLUS</span>
            </div>
          </div>

          {/* Infrastructure Health Stats Panel */}
          <div className="flex-1 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white font-sans select-none mb-1">
                Infrastructure Health
              </h4>
              
              <div className="space-y-3">
                {/* Grid Stability */}
                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10 select-none shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <span className="material-symbols-outlined text-base">bolt</span>
                    </div>
                    <span className="text-xs font-bold text-slate-200">Grid Stability</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {activeTab === "live" 
                      ? `${gridStability}%` 
                      : activeTab === "historical" 
                      ? "97.1% (Avg)" 
                      : simulationComplete 
                      ? "99.9% (Optimal)" 
                      : "99.2% (Target)"}
                  </span>
                </div>

                {/* Water Pressure */}
                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10 select-none shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                      <span className="material-symbols-outlined text-base">water_drop</span>
                    </div>
                    <span className="text-xs font-bold text-slate-200">Water Pressure</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-pink-400">
                    {activeTab === "live" ? "Normal" : activeTab === "historical" ? "Optimal" : "Balanced Flow"}
                  </span>
                </div>

                {/* CO2 Levels */}
                <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/10 select-none shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                      <span className="material-symbols-outlined text-base">air</span>
                    </div>
                    <span className="text-xs font-bold text-slate-200">CO2 Levels</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${
                    activeTab === "live" 
                      ? (isAutoRerouted ? "text-emerald-400" : "text-rose-400")
                      : activeTab === "historical"
                      ? "text-rose-400/80"
                      : "text-emerald-400"
                  }`}>
                    {activeTab === "live"
                      ? (isAutoRerouted ? "+0.8% Target" : "+2.1%")
                      : activeTab === "historical"
                      ? "+3.4% Baseline"
                      : "-12.5% Target"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Action Card per View Tab */}
            {activeTab === "live" && (
              <div className="mt-6 p-4 rounded-xl bg-indigo-950/40 border border-white/10 text-white select-none relative overflow-hidden shadow-md backdrop-blur-md">
                <p className="text-[9px] font-mono font-bold opacity-80 uppercase tracking-widest">
                  Optimization Alert
                </p>
                <p className="text-xs leading-relaxed font-semibold mt-1">
                  Excess solar generation in District 02. Rerouting to EV Hub B recommended.
                </p>
                <button
                  onClick={handleAutoRoute}
                  disabled={isAutoRerouted || isRerouting}
                  className={`mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    isAutoRerouted ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/20 cursor-default" : ""
                  }`}
                >
                  {isRerouting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                      Rerouting Circuits...
                    </span>
                  ) : isAutoRerouted ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Power Rerouted successfully
                    </span>
                  ) : (
                    "Auto-Route"
                  )}
                </button>
              </div>
            )}

            {activeTab === "historical" && (
              <div className="mt-6 p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-white select-none relative overflow-hidden shadow-md backdrop-blur-md">
                <p className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  Historical Log Archive
                </p>
                <p className="text-xs leading-relaxed font-semibold mt-1">
                  View full historical performance sheets, past outage reports, and solar production records.
                </p>
                <button
                  onClick={handleExportLogs}
                  disabled={isExportingLogs}
                  className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  {isExportingLogs ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm animate-spin">downloading</span>
                      Exporting CSV Logs...
                    </span>
                  ) : exportComplete ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">done_all</span>
                      Archival Report Downloaded
                    </span>
                  ) : (
                    "Download Archive Reports"
                  )}
                </button>
              </div>
            )}

            {activeTab === "simulated" && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-white select-none relative overflow-hidden shadow-md backdrop-blur-md">
                <p className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Grid Load Simulation
                </p>
                <p className="text-xs leading-relaxed font-semibold mt-1">
                  Simulate high-penetration EV charging loads paired with virtual albedo cooling effects.
                </p>
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulatingGrid}
                  className={`mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    simulationComplete ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/20" : ""
                  }`}
                >
                  {isSimulatingGrid ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm animate-spin">smart_toy</span>
                      Running AI Optimization...
                    </span>
                  ) : simulationComplete ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      Simulation Balanced (99.9% Est)
                    </span>
                  ) : (
                    "Run Simulation Optimizer"
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </motion.div>
  );
};
