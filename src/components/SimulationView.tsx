import React, { useState, useEffect } from "react";
import { SimulationParams, SimulationResult } from "../types";
import { motion } from "motion/react";
// @ts-ignore
import bhopalMap from "../assets/images/bhopal_tech_map_1784013150389.jpg";
// @ts-ignore
import vitBhopalSatellite from "../assets/images/vit_bhopal_satellite_1784013363224.jpg";

interface SimulationViewProps {
  params: SimulationParams;
  onParamsChange: (newParams: SimulationParams) => void;
  result: SimulationResult;
  onRunSimulation: () => Promise<void>;
  isSimulating: boolean;
  activeProfile?: string;
  onAddSuggestion?: (content: string, viewContext: string) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  params,
  onParamsChange,
  result,
  onRunSimulation,
  isSimulating,
  activeProfile,
  onAddSuggestion
}) => {
  const [activeZone, setActiveZone] = useState<string>("Zone 7");
  const [mapType, setMapType] = useState<"bhopal" | "vit_satellite" | "bhopal_tech">("vit_satellite");
  const [is3D, setIs3D] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [showLayers, setShowLayers] = useState<boolean>(true);

  // States for 1-second delayed slide-in
  const [showSides, setShowSides] = useState(false);
  const [countdown, setCountdown] = useState(1);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      setShowSides(true);
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(timer);
    };
  }, []);

  // Local suggestion states for Employee profile
  const [simulationSuggestion, setSimulationSuggestion] = useState("");
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  // Local helper to change individual params
  const setParam = (key: keyof SimulationParams, value: any) => {
    if (activeProfile === "admin_unit_01") return;
    onParamsChange({
      ...params,
      [key]: value
    });
  };

  // Mock Bhopal center coordinate locations for the interactive 3D map elements
  const transitNodes = [
    { id: "A", x: 25, y: 35, type: "transit" },
    { id: "B", x: 45, y: 65, type: "solar" },
    { id: "C", x: 60, y: 25, type: "transit" },
    { id: "D", x: 75, y: 55, type: "green" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="h-[calc(100vh-6rem)] relative flex flex-col text-white"
    >
      {/* 3D Map View Layer (Absolute Background of page content area) */}
      <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden border border-white/10 bg-[#070c1e] select-none">
        
        {/* Transform Wrapper for 3D and Zoom */}
        <div
          className="w-full h-full relative transition-all duration-700 ease-out"
          style={{
            transform: `${is3D ? "perspective(1200px) rotateX(25deg) rotateY(-2deg) rotateZ(-4deg) translateY(10px)" : ""} scale(${zoom})`,
            transformStyle: is3D ? "preserve-3d" : "flat",
          }}
        >
          {/* Underlay Map Placeholder with Bhopal, India view */}
          <div 
            className="w-full h-full absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('${mapType === "vit_satellite" ? vitBhopalSatellite : bhopalMap}')`,
              opacity: mapType === "vit_satellite" ? 0.65 : 0.4
            }}
          />

          {/* Live Map Interaction Overlay: SVG Overlay matching Sliders! */}
          {showLayers && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {/* Dynamic Green Space overlay based on greenSpaceRatio slider */}
              <circle 
                cx="75%" 
                cy="55%" 
                r={`${20 + (params.greenSpaceRatio * 0.8)}px`} 
                fill="rgba(99, 102, 241, 0.15)" 
                stroke="rgba(99, 102, 241, 0.4)" 
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              {/* Transit Line connection paths glowing and pulsing */}
              <path 
                d="M 250 350 L 450 650 L 600 250" 
                fill="none" 
                stroke="rgba(236, 72, 153, 0.5)" 
                strokeWidth={`${2 + (20 - params.publicTransitFrequency) * 0.3}`} 
                strokeDasharray="8, 6" 
                className="transition-all duration-300 animate-pulse"
              />

              {/* Interactive height vectors mimicking 3D buildings depending on height Limit */}
              <line 
                x1="35%" 
                y1="40%" 
                x2="35%" 
                y2={`${40 - (params.buildingHeightLimits * 0.1)}%`} 
                stroke="#6366f1" 
                strokeWidth="6" 
                strokeLinecap="round" 
                className="transition-all duration-300 opacity-60"
              />
              <line 
                x1="38%" 
                y1="45%" 
                x2="38%" 
                y2={`${45 - (params.buildingHeightLimits * 0.08)}%`} 
                stroke="#ec4899" 
                strokeWidth="8" 
                strokeLinecap="round" 
                className="transition-all duration-300 opacity-60"
              />
            </svg>
          )}

          {/* Floating animated markers */}
          {showLayers && (mapType === "vit_satellite" ? [
            { name: "VIT Academic Hub", top: "48%", left: "58%", desc: "Central Block", key: "hub" },
            { name: "Hostel Blocks", top: "35%", left: "32%", desc: "Residential", key: "hostels" },
            { name: "Campus Lake", top: "65%", left: "70%", desc: "Ecological", key: "lake" },
            { name: "Innovation Labs", top: "25%", left: "48%", desc: "Solar Tech Core", key: "labs" },
          ] : [
            { name: `${activeZone}: High Density`, top: "48%", left: "58%", desc: "District Center", key: "zone7" }
          ]).map((pin) => (
            <div key={pin.key} className="absolute z-20" style={{ top: pin.top, left: pin.left }}>
              <div className="relative group cursor-pointer pointer-events-auto">
                <div className="pulse-dot w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg border border-white relative">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping absolute opacity-75"></div>
                  <div className="w-2 h-2 bg-white rounded-full relative"></div>
                </div>
                <div className="absolute top-8 left-1/2 -translate-x-1/2 glass-card border border-white/10 px-3.5 py-1.5 rounded-full whitespace-nowrap shadow-md opacity-90 group-hover:opacity-100 transition-all duration-200 text-center">
                  <span className="font-mono text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                    {pin.name}
                  </span>
                  <span className="block text-[8px] text-slate-400 font-mono font-bold uppercase tracking-wider mt-0.5">
                    {pin.desc}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Floating Albedo Effect glow if enabled */}
          {params.optimizeAlbedo && (
            <div className="absolute inset-0 bg-white/5 pointer-events-none mix-blend-overlay transition-all duration-500" />
          )}
        </div>
      </div>

      {/* Control overlay on left & prediction results on right */}
      <div className="relative z-10 flex-1 p-6 flex gap-6 overflow-hidden select-none pointer-events-none">
        
        {/* Left Column: Active Scenario Card & Parameters (Scrollable and Interactive) */}
        <motion.div
          initial={{ opacity: 0, x: -350 }}
          animate={{ 
            opacity: showSides ? (is3D ? 0 : 1) : 0,
            x: showSides ? (is3D ? -48 : 0) : -350,
            scale: is3D ? 0.95 : 1
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`w-80 flex flex-col gap-4 h-full overflow-y-auto pr-1 ${
            showSides && !is3D ? "pointer-events-auto" : "pointer-events-none select-none"
          }`}
        >
          
          {/* Scenario Overview Card */}
          <div className="bg-[#0b1329]/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/15">
            <div className="flex items-center justify-between mb-3.5">
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Active Scenario
              </span>
              <span className="material-symbols-outlined text-indigo-400 text-base font-bold">
                edit_square
              </span>
            </div>
            <h2 className="text-lg text-white font-extrabold font-sans">
              Solar Integration Plan 2030
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Phase 2: District-wide renewable grid optimization.
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-mono font-bold select-none">
              <span className="px-2 py-0.5 bg-pink-500/10 text-pink-300 border border-pink-500/20 rounded-full">Sustainable</span>
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">Validated</span>
            </div>
          </div>

          {/* Simulation Parameters Slider Panel */}
          <div className="bg-[#0b1329]/95 backdrop-blur-md p-5 rounded-2xl flex-1 overflow-y-auto space-y-6 shadow-xl border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-white font-sans flex items-center">
                <span className="material-symbols-outlined mr-2 text-indigo-400 text-lg">tune</span>
                Simulation Parameters
              </h3>
              {activeProfile !== "admin_unit_01" ? (
                <button
                  onClick={() => {
                    onParamsChange({
                      greenSpaceRatio: 42,
                      publicTransitFrequency: 4.5,
                      buildingHeightLimits: 120,
                      optimizeAlbedo: true
                    });
                  }}
                  className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer bg-white/5 px-2 py-1 rounded border border-white/5 hover:border-indigo-500/30 active:scale-95"
                  title="Reset simulation parameters to default"
                >
                  <span className="material-symbols-outlined text-[12px]">restart_alt</span>
                  Reset Zone
                </button>
              ) : (
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  <span className="material-symbols-outlined text-[11px]">lock</span>
                  Locked
                </span>
              )}
            </div>

            <div className="space-y-6">
              {/* Parameter 1: Green Space Ratio */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-200">Green Space Ratio</label>
                  <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {params.greenSpaceRatio}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.greenSpaceRatio}
                  onChange={(e) => setParam("greenSpaceRatio", parseInt(e.target.value))}
                  disabled={activeProfile === "admin_unit_01"}
                  className={`w-full h-1 bg-white/10 rounded-lg appearance-none accent-indigo-500 ${
                    activeProfile === "admin_unit_01" ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  }`}
                />
                <p className="text-[10px] text-slate-400 leading-normal">
                  Percentage of urban land dedicated to parks, vertical gardens, and bioswales.
                </p>
              </div>

              {/* Parameter 2: Public Transit Frequency */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-200">Public Transit Frequency</label>
                  <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {params.publicTransitFrequency} min
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={params.publicTransitFrequency}
                  onChange={(e) => setParam("publicTransitFrequency", parseFloat(e.target.value))}
                  disabled={activeProfile === "admin_unit_01"}
                  className={`w-full h-1 bg-white/10 rounded-lg appearance-none accent-indigo-500 ${
                    activeProfile === "admin_unit_01" ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  }`}
                />
                <p className="text-[10px] text-slate-400 leading-normal">
                  Average dispatch interval between zero-emission autonomous rail and shuttle units.
                </p>
              </div>

              {/* Parameter 3: Building Height Limits */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-200">Building Height Limits</label>
                  <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {params.buildingHeightLimits}m
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={params.buildingHeightLimits}
                  onChange={(e) => setParam("buildingHeightLimits", parseInt(e.target.value))}
                  disabled={activeProfile === "admin_unit_01"}
                  className={`w-full h-1 bg-white/10 rounded-lg appearance-none accent-indigo-500 ${
                    activeProfile === "admin_unit_01" ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  }`}
                />
                <p className="text-[10px] text-slate-400 leading-normal">
                  Maximum permitted vertical height for structural skyscrapers and zoning in Zone 7.
                </p>
              </div>

              {/* Toggle Switch Parameter 4 */}
              <div className="pt-4 border-t border-white/10">
                <label className={`flex items-center justify-between group ${activeProfile === "admin_unit_01" ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                  <span className="text-xs font-bold text-slate-200">Optimize Albedo Effect</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={params.optimizeAlbedo}
                      onChange={(e) => setParam("optimizeAlbedo", e.target.checked)}
                      disabled={activeProfile === "admin_unit_01"}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>
                <p className="text-[10px] text-slate-400 leading-normal mt-2">
                  Apply solar-reflective coatings on high-exposure roofs to curb urban heat.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Space Spacer for center map with dynamic map toggles */}
        <div className="flex-1 flex flex-col items-center justify-start pt-4 relative">
          {!showSides && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel border border-sky-500/30 bg-slate-950/80 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md mb-4 pointer-events-auto"
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-200">Retrieving Spatial Telemetry...</span>
                <span className="text-sky-400 font-bold ml-2">Loading controls in {countdown}s</span>
              </div>
            </motion.div>
          )}

          <div className="glass-panel border border-white/10 rounded-full p-1.5 shadow-lg shadow-black/40 flex items-center gap-1 pointer-events-auto backdrop-blur-md">
            <button
              onClick={() => setMapType("vit_satellite")}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mapType === "vit_satellite"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">satellite_alt</span>
              VIT Bhopal Satellite
            </button>
            <button
              onClick={() => setMapType("bhopal_tech")}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mapType === "bhopal_tech"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Bhopal Vector
            </button>
          </div>
        </div>

        {/* Right Column: Predictive Impact Cards & Main Run Button */}
        <motion.div
          initial={{ opacity: 0, x: 350 }}
          animate={{ 
            opacity: showSides ? (is3D ? 0 : 1) : 0,
            x: showSides ? (is3D ? 48 : 0) : 350,
            scale: is3D ? 0.95 : 1
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`w-80 flex flex-col gap-4 h-full overflow-y-auto pr-1 pb-4 ${
            showSides && !is3D ? "pointer-events-auto" : "pointer-events-none select-none"
          }`}
        >
          
          <h3 className="text-sm font-extrabold text-white font-sans flex items-center px-1 border-b border-white/10 pb-2">
            <span className="material-symbols-outlined mr-2 text-indigo-400 text-lg">analytics</span>
            Impact Prediction
          </h3>

          {/* Trigger Compute Simulation CTA (moved to top) */}
          <div className="pb-2 border-b border-white/10 select-none">
            {activeProfile === "admin_unit_01" ? (
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full bg-slate-800/80 text-slate-400 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-white/5 cursor-not-allowed text-xs"
                >
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Simulation Locked (Employee Read-Only)</span>
                </button>
                
                <div className="bg-sky-950/20 border border-sky-500/20 rounded-xl p-3">
                  <p className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">feedback</span>
                    Suggest Parameter Optimization
                  </p>
                  
                  {suggestionSubmitted ? (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400">
                      Suggestion submitted successfully! Admin will review.
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g., Target 50% Green Space in Zone 7..."
                        value={simulationSuggestion}
                        onChange={(e) => setSimulationSuggestion(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500/50"
                      />
                      <button
                        onClick={() => {
                          if (!simulationSuggestion.trim()) return;
                          if (onAddSuggestion) {
                            onAddSuggestion(simulationSuggestion, "Simulation Engine");
                          }
                          setSimulationSuggestion("");
                          setSuggestionSubmitted(true);
                          setTimeout(() => setSuggestionSubmitted(false), 3000);
                        }}
                        className="bg-sky-600 hover:bg-sky-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        Suggest
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onRunSimulation}
                disabled={isSimulating}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-[0.98] transition-all group overflow-hidden relative cursor-pointer"
              >
                <span className={`material-symbols-outlined ${isSimulating ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}>
                  autorenew
                </span>
                <span className="text-md">
                  {isSimulating ? "Computing Forecast..." : "Run Simulation"}
                </span>

                {/* Sliding progress bar overlay matching screenshot */}
                {isSimulating && (
                  <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-[width_1s_ease-out_forwards]" style={{ width: "100%" }} />
                )}
              </button>
            )}
            <p className="text-center text-[10px] text-slate-500 mt-2.5 font-mono uppercase tracking-widest font-semibold select-none">
              Est. Compute Time: {result.roiPeriod === "18mo" ? "1.2s" : "0.8s"} • {result.gridLoadImpact}
            </p>
          </div>

          <div className="space-y-4">
            {/* Impact Card 1: CO2 Reduction */}
            <div className="bg-[#0b1329]/95 border border-white/15 p-4 rounded-xl relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-indigo-400">eco</span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">CO2 Reduction</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h4 className="text-2xl font-extrabold text-indigo-300">{result.co2Reduction}</h4>
                <span className="text-xs font-bold text-indigo-400">↑ 4.2</span>
              </div>
              <div className="w-full bg-white/10 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: "72%" }}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 leading-snug">
                {result.co2Detail}
              </p>
            </div>

            {/* Impact Card 2: Estimated ROI */}
            <div className="bg-[#0b1329]/95 border border-white/15 p-4 rounded-xl relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-pink-400">monetization_on</span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Estimated ROI</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h4 className="text-2xl font-extrabold text-white">{result.estimatedRoi}</h4>
                <span className="text-xs text-pink-300 font-bold">{result.roiPeriod}</span>
              </div>
              <div className="flex mt-3 gap-1.5 select-none">
                <div className="h-1 flex-1 bg-pink-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-pink-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
                <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 leading-snug">
                {result.roiDetail}
              </p>
            </div>

            {/* Impact Card 3: Traffic Impact */}
            <div className="bg-[#0b1329]/95 border border-white/15 p-4 rounded-xl relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-4xl text-slate-400">commute</span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Traffic Impact</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h4 className="text-2xl font-extrabold text-white">{result.trafficImpact}</h4>
                <span className="text-xs text-slate-400 font-medium">Avg Trip</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 leading-snug">
                {result.trafficDetail}
              </p>
            </div>

            {/* AI Advisor Core Suggestion Block */}
            <div className="p-3 bg-indigo-500/5 rounded-xl border border-white/10 text-[11px] text-slate-300">
              <p className="font-bold text-indigo-300 flex items-center gap-1 uppercase tracking-wider mb-1">
                <span className="material-symbols-outlined text-sm">psychology</span>
                NovaCity AI Core Advice
              </p>
              <p className="leading-relaxed">
                {result.recommendation}
              </p>
              {result.riskAssessment && (
                <p className="mt-1.5 font-semibold text-slate-500 text-[10px]">
                  Risk: {result.riskAssessment}
                </p>
              )}
            </div>

            {/* Feature 3: Actionable Civic Policies */}
            <div className="space-y-2 pt-2 border-t border-white/10 select-none">
              <p className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">policy</span>
                Actionable Civic Policies
              </p>
              
              <div className="space-y-1.5 text-left">
                <div className="bg-[#0d152b]/95 border border-white/10 p-2.5 rounded-xl flex items-start gap-2 hover:bg-white/10 hover:border-white/20 transition-all shadow">
                  <span className="material-symbols-outlined text-xs text-emerald-400 mt-0.5">park</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-200">Policy 1: Eco-Roof Canopy Mandate</p>
                    <p className="text-[8px] text-slate-400">Incentivizes private roofs over 15m to establish live sedum vegetative mats to absorb storm runoff and lower direct cooling overhead.</p>
                  </div>
                </div>

                <div className="bg-[#0d152b]/95 border border-white/10 p-2.5 rounded-xl flex items-start gap-2 hover:bg-white/10 hover:border-white/20 transition-all shadow">
                  <span className="material-symbols-outlined text-xs text-indigo-400 mt-0.5">directions_transit</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-200">Policy 2: High-Frequency Transit Arterial</p>
                    <p className="text-[8px] text-slate-400">Designates priority express lanes along solar-adjacent districts, scaling shuttle frequency to 5-minute increments.</p>
                  </div>
                </div>

                <div className="bg-[#0d152b]/95 border border-white/10 p-2.5 rounded-xl flex items-start gap-2 hover:bg-white/10 hover:border-white/20 transition-all shadow">
                  <span className="material-symbols-outlined text-xs text-pink-400 mt-0.5">wb_sunny</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-200">Policy 3: Cool-Asphalt Albedo Surfacing</p>
                    <p className="text-[8px] text-slate-400">Requires high-exposure roads to apply albedo reflective asphalt overlays, trimming surface temperature indexes by up to 12%.</p>
                  </div>
                </div>

                <div className="bg-[#0d152b]/95 border border-white/10 p-2.5 rounded-xl flex items-start gap-2 hover:bg-white/10 hover:border-white/20 transition-all shadow">
                  <span className="material-symbols-outlined text-xs text-amber-400 mt-0.5">battery_charging_full</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-200">Policy 4: Micro-Grid Dynamic Shaving</p>
                    <p className="text-[8px] text-slate-400">Integrates public EV fleet terminals as bi-directional batteries to shave solar peaks and buffer district grid load limits.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating map view controls */}
      <div className="absolute bottom-24 right-10 z-20 flex flex-col gap-2 select-none">
        <button 
          onClick={() => setZoom(z => Math.min(2.0, z + 0.1))}
          className="w-10 h-10 glass-panel border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 pointer-events-auto transition-colors cursor-pointer text-slate-300"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(0.8, z - 0.1))}
          className="w-10 h-10 glass-panel border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 pointer-events-auto transition-colors cursor-pointer text-slate-300"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-lg">remove</span>
        </button>
        <div className="h-2"></div>
        <button 
          onClick={() => setShowLayers(!showLayers)}
          className={`w-10 h-10 glass-panel border rounded-xl flex items-center justify-center hover:bg-white/10 pointer-events-auto transition-colors cursor-pointer ${
            showLayers ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/10" : "border-white/10 text-slate-400"
          }`}
          title="Toggle Overlays"
        >
          <span className="material-symbols-outlined text-lg">layers</span>
        </button>
        <button 
          onClick={() => setIs3D(!is3D)}
          className={`w-10 h-10 glass-panel border rounded-xl flex items-center justify-center hover:bg-white/10 pointer-events-auto transition-all duration-300 cursor-pointer ${
            is3D 
              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/15 shadow-sm shadow-emerald-500/20" 
              : "border-white/10 text-slate-300"
          }`}
          title="Toggle 3D Perspective Map"
        >
          <span className={`material-symbols-outlined text-lg ${is3D ? "rotate-45" : ""} transition-transform duration-300`}>3d_rotation</span>
        </button>
      </div>

      {/* Bottom Data Feed Strip Overlay */}
      <div className={`relative z-10 mt-auto select-none bg-[#0b1329]/95 border border-white/15 rounded-2xl px-6 py-3.5 flex items-center justify-between gap-6 shadow-xl mb-2 text-white transition-all duration-500 ease-in-out ${
        is3D 
          ? "opacity-0 translate-y-12 pointer-events-none scale-95" 
          : "pointer-events-auto opacity-100"
      }`}>
        <div className="flex items-center flex-wrap gap-x-8 gap-y-2">
          {/* Ambient Temp */}
          <div className="flex items-center gap-3 border-r border-white/10 pr-8">
            <span className="material-symbols-outlined text-indigo-400 text-xl">thermostat</span>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold leading-none">
                Ambient Temp
              </p>
              <p className="font-mono text-sm text-white font-bold mt-1">29.6°C</p>
            </div>
          </div>
          
          {/* Air Quality */}
          <div className="flex items-center gap-3 border-r border-white/10 pr-8">
            <span className="material-symbols-outlined text-indigo-400 text-xl">air</span>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold leading-none">
                Air Quality
              </p>
              <p className="font-mono text-sm text-white font-bold mt-1">AQI 78 (Moderate)</p>
            </div>
          </div>
          
          {/* Grid Load */}
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-400 text-xl">bolt</span>
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold leading-none">
                Grid Load
              </p>
              <p className="font-mono text-sm text-white font-bold mt-1">{result.gridLoadImpact}</p>
            </div>
          </div>
        </div>

        {/* Collaborators list */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 border border-[#020617] text-[8px] text-white font-bold flex items-center justify-center">AS</div>
            <div className="w-6 h-6 rounded-full bg-pink-500 border border-[#020617] text-[8px] text-white font-bold flex items-center justify-center">LK</div>
            <div className="w-6 h-6 rounded-full bg-zinc-700 border border-[#020617] text-[8px] text-white font-bold flex items-center justify-center">+4</div>
          </div>
          <span className="text-xs font-semibold text-slate-400">Active Collaborators</span>
        </div>
      </div>
    </motion.div>
  );
};
