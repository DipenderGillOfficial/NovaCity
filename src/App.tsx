import React, { useState, useEffect } from "react";
import { Sidebar, PROFILES } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { SimulationView } from "./components/SimulationView";
import { ResourceMapsView } from "./components/ResourceMapsView";
import { ReportingHubView } from "./components/ReportingHubView";
import { AnalyticsView } from "./components/AnalyticsView";
import { ViewType, CivicAlert, SimulationParams, SimulationResult, ChatMessage, EmployeeSuggestion, ThemeType, DesignStyle } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { getLocalAdvisorResponse } from "./lib/localAdvisor";
import { CinematicIntro } from "./components/CinematicIntro";

const INITIAL_SUGGESTIONS: EmployeeSuggestion[] = [
  {
    id: "sug-1",
    author: "Employee",
    authorImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDE20L6u9Y7183flOA-FPVvtO9mJHJJIgDECWdZCjeQY_OvYfZuUieDC2HN4axmqkJ8y4MTWqkxFwgQitXmUJ5sH2wOo6Z99GCg8lFJfkIB80AdptbcrpuFBEbWQhCNSExMC_bEeqm6n1LAb8CptG56sZbM112DXvABaDHVI7_TLpVmiY4sytgX-ITZHwp6trpePClvfFfsBgn5e8-p5Ye8tH0RGiDP--ALXANL-CdB8l2KReVwEbeAMnQAqj6IkDJirP1mIvG_TGU",
    viewContext: "Resource Maps",
    content: "We should consider adding an electric vehicle (EV) fleet hub near the District 7 high renewable solar generation node so we can dynamically buffer solar peaks.",
    timestamp: "2h ago",
    status: "approved"
  },
  {
    id: "sug-2",
    author: "Employee",
    authorImg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDE20L6u9Y7183flOA-FPVvtO9mJHJJIgDECWdZCjeQY_OvYfZuUieDC2HN4axmqkJ8y4MTWqkxFwgQitXmUJ5sH2wOo6Z99GCg8lFJfkIB80AdptbcrpuFBEbWQhCNSExMC_bEeqm6n1LAb8CptG56sZbM112DXvABaDHVI7_TLpVmiY4sytgX-ITZHwp6trpePClvfFfsBgn5e8-p5Ye8tH0RGiDP--ALXANL-CdB8l2KReVwEbeAMnQAqj6IkDJirP1mIvG_TGU",
    viewContext: "Simulation Engine",
    content: "According to my latest modeling runs, applying solar-reflective albedo coatings across District 2 reduces localized temperature anomalies by up to 1.8°C. Suggest prioritizing high-exposure roofs.",
    timestamp: "10m ago",
    status: "pending"
  }
];

// Initial static mock data representing pristine starting states for reports
const INITIAL_ALERTS: CivicAlert[] = [
  {
    id: "alert-1",
    title: "Water Main Repair",
    description: "District water pipe burst around block 12. Main isolation valve closed. Repair crew dispatched.",
    time: "10m ago",
    status: "active",
    category: "water",
    district: "District 4"
  },
  {
    id: "alert-2",
    title: "Pothole Reported",
    description: "Deep pothole causing slow traffic merge on Oak & 5th Avenue block. Warning signs placed.",
    time: "42m ago",
    status: "pending",
    category: "pothole",
    district: "District 2"
  },
  {
    id: "alert-3",
    title: "Grid Optimization",
    description: "High renewable generation detected in District 7. Auto-rerouting circuits to grid storage.",
    time: "2h ago",
    status: "resolved",
    category: "grid",
    district: "District 7"
  },
  {
    id: "alert-4",
    title: "Traffic Sensor Malfunction",
    description: "Speed telemetry sensor offline in Zone 4 underpass. Diagnostics showing voltage drop.",
    time: "4h ago",
    status: "active",
    category: "sensor",
    district: "District 9"
  }
];

const INITIAL_SIMULATION_PARAMS: SimulationParams = {
  greenSpaceRatio: 42,
  publicTransitFrequency: 4.5,
  buildingHeightLimits: 120,
  optimizeAlbedo: true
};

const INITIAL_SIMULATION_RESULT: SimulationResult = {
  co2Reduction: "-38.2%",
  co2Detail: "Substantial offset via high-density carbon sinks and transit frequency.",
  estimatedRoi: "$2.4M",
  roiPeriod: "18mo",
  roiDetail: "Calculated based on municipal fuel tax offset and building insulation gains.",
  trafficImpact: "-14.5%",
  trafficDetail: "Average trip times decreased by 4.2 minutes across Zone 7 corridors.",
  recommendation: "Focus on adding bioswales around high albedo zones to maximize thermal mitigation.",
  riskAssessment: "Low - High citizen approval forecasted.",
  gridLoadImpact: "82% Capacity"
};

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content: "Greetings. I am the Bloomfield Core Advisor. I help manage environmental sustainability, optimize resources, and model civic parameters.",
    timestamp: "10:24 AM"
  }
];

export default function App() {
  // Global States (with localStorage synchronization where relevant)
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const saved = localStorage.getItem("bloomfield_view");
    return (saved as ViewType) || "dashboard";
  });

  const [activeProfile, setActiveProfile] = useState<string>(() => {
    return localStorage.getItem("bloomfield_profile") || "admin_root";
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [alerts, setAlerts] = useState<CivicAlert[]>(() => {
    const saved = localStorage.getItem("bloomfield_alerts");
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [simulationParams, setSimulationParams] = useState<SimulationParams>(() => {
    const saved = localStorage.getItem("bloomfield_sim_params");
    return saved ? JSON.parse(saved) : INITIAL_SIMULATION_PARAMS;
  });

  const [lastSimulatedParams, setLastSimulatedParams] = useState<SimulationParams>(() => {
    const saved = localStorage.getItem("bloomfield_last_sim_params");
    return saved ? JSON.parse(saved) : INITIAL_SIMULATION_PARAMS;
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult>(() => {
    const saved = localStorage.getItem("bloomfield_sim_result");
    return saved ? JSON.parse(saved) : INITIAL_SIMULATION_RESULT;
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("bloomfield_chat");
    return saved ? JSON.parse(saved) : INITIAL_CHAT;
  });

  const [suggestions, setSuggestions] = useState<EmployeeSuggestion[]>(() => {
    const saved = localStorage.getItem("bloomfield_suggestions");
    return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
  });

  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem("bloomfield_theme") as ThemeType) || "cosmic";
  });

  const [designStyle, setDesignStyle] = useState<DesignStyle>(() => {
    return (localStorage.getItem("bloomfield_design_style") as DesignStyle) || "glass";
  });

  const [showIntro, setShowIntro] = useState<boolean>(true);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Notifications Sidebar Modal Overlay State
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedIncidentForNotice, setSelectedIncidentForNotice] = useState<CivicAlert | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("bloomfield_view", currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem("bloomfield_profile", activeProfile);
  }, [activeProfile]);

  useEffect(() => {
    localStorage.setItem("bloomfield_alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("bloomfield_sim_params", JSON.stringify(simulationParams));
  }, [simulationParams]);

  useEffect(() => {
    localStorage.setItem("bloomfield_last_sim_params", JSON.stringify(lastSimulatedParams));
  }, [lastSimulatedParams]);

  useEffect(() => {
    localStorage.setItem("bloomfield_sim_result", JSON.stringify(simulationResult));
  }, [simulationResult]);

  useEffect(() => {
    localStorage.setItem("bloomfield_chat", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem("bloomfield_suggestions", JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem("bloomfield_theme", theme);
    const body = document.body;
    body.classList.remove("theme-cosmic", "theme-emerald", "theme-cyberpunk", "theme-solar", "theme-nordic");
    body.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("bloomfield_design_style", designStyle);
    const body = document.body;
    body.classList.remove("design-glass", "design-terminal", "design-minimalist", "design-tactical", "design-editorial");
    body.classList.add(`design-${designStyle}`);
  }, [designStyle]);

  // Enforce access control: Dr. Aris Thorne is restricted to Reporting Hub only
  useEffect(() => {
    if (activeProfile === "aris_thorne" && currentView !== "reports") {
      setCurrentView("reports");
    }
  }, [activeProfile, currentView]);

  // Actions
  const handleAddSuggestion = (content: string, viewContext: string) => {
    const activeProfileData = PROFILES.find(p => p.id === activeProfile) || PROFILES[0];
    const newSuggestion: EmployeeSuggestion = {
      id: `sug-${Date.now()}`,
      author: activeProfileData.name,
      authorImg: activeProfileData.img,
      viewContext,
      content,
      timestamp: "Just now",
      status: "pending"
    };
    setSuggestions(prev => [newSuggestion, ...prev]);
  };

  const handleUpdateSuggestionStatus = (id: string, status: "approved" | "dismissed" | "pending") => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleUpdateAlertStatus = (id: string, status: "active" | "pending" | "resolved") => {
    setAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, status } : alert));
  };

  const handleAddAlert = (newAlert: Omit<CivicAlert, "id" | "time">) => {
    const alertItem: CivicAlert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      time: "Just now"
    };
    setAlerts(prev => [alertItem, ...prev]);
  };

  // Run Simulation API Action
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    const start = Date.now();
    try {
      const response = await fetch("/api/gemini/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simulationParams)
      });
      
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Ensure a minimum visual feedback of 150ms so the pulse/progress bar is visible
      const elapsed = Date.now() - start;
      if (elapsed < 150) {
        await new Promise(resolve => setTimeout(resolve, 150 - elapsed));
      }

      setSimulationResult(data);
    } catch (err) {
      console.warn("Using smart dynamic client simulation fallback:", err);
      // Realistic local calculations fallback if backend is offline or keys missing
      const elapsed = Date.now() - start;
      if (elapsed < 150) {
        await new Promise(resolve => setTimeout(resolve, 150 - elapsed));
      }

      // Add a small dynamic micro-variation (fluctuation) to make sequential clicks feel alive, realistic, and responsive
      const varianceCo2 = (Math.random() * 0.8 - 0.4);
      const varianceRoi = (Math.random() * 0.12 - 0.06);
      const varianceTraffic = (Math.random() * 0.6 - 0.3);

      const baseCo2 = (30 + (simulationParams.greenSpaceRatio * 0.45) + (20 - simulationParams.publicTransitFrequency) * 1.25);
      const co2Val = Math.max(1.0, baseCo2 + varianceCo2).toFixed(1);

      const baseRoi = (1.2 + (simulationParams.buildingHeightLimits * 0.006));
      const roiVal = Math.max(0.1, baseRoi + varianceRoi).toFixed(2);

      const baseTraffic = (5 + (20 - simulationParams.publicTransitFrequency) * 1.6);
      const trafficVal = Math.max(0.5, baseTraffic + varianceTraffic).toFixed(1);

      // Dynamic load impact representation
      const loadOptions = ["78% Capacity", "81% Capacity", "76% Capacity", "79% Capacity"];
      const gridLoadImpact = loadOptions[Math.floor(Math.random() * loadOptions.length)];

      setSimulationResult({
        co2Reduction: `-${co2Val}%`,
        co2Detail: `Calculated from ${simulationParams.greenSpaceRatio}% green space and optimized albedo coating.`,
        estimatedRoi: `$${roiVal}M`,
        roiPeriod: "15mo",
        roiDetail: `Estimated ROI period of 15 months calculated based on municipal fuel tax offset and energy savings.`,
        trafficImpact: `-${trafficVal}%`,
        trafficDetail: `Average commute reduction across district corridors.`,
        recommendation: "Excellent progress. We advise expanding public electric shuttle counts to District 4.",
        riskAssessment: "Extremely low risk.",
        gridLoadImpact: gridLoadImpact
      });
    } finally {
      setIsSimulating(false);
      setLastSimulatedParams(simulationParams);
    }
  };

  // Chat message send API Action
  const handleSendMessage = async (content: string, image?: { data: string; mimeType: string }) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsResponding(true);

    const lowerContent = content.toLowerCase();
    const isAskingAboutCreators = 
      (lowerContent.includes("who") && (lowerContent.includes("made") || lowerContent.includes("built") || lowerContent.includes("created") || lowerContent.includes("developed") || lowerContent.includes("design"))) ||
      lowerContent.includes("creator") || 
      lowerContent.includes("members") || 
      lowerContent.includes("team") || 
      lowerContent.includes("developer") ||
      lowerContent.includes("who is behind");

    if (isAskingAboutCreators) {
      setTimeout(() => {
        const fallbackReply = getLocalAdvisorResponse(content, simulationParams, simulationResult);
        const assistantMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          role: "assistant",
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, assistantMsg]);
        setIsResponding(false);
      }, 300);
      return;
    }

    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: content, 
          history: chatHistory, 
          image,
          alerts,
          simulationParams,
          simulationResult
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, assistantMsg]);
      setIsResponding(false);
    } catch (err) {
      console.error(err);
      // Realistic fallback advisory chat reply utilizing our smart client-side NLP generator
      setTimeout(() => {
        const fallbackReply = getLocalAdvisorResponse(content, simulationParams, simulationResult);
        const assistantMsg: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          role: "assistant",
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, assistantMsg]);
        setIsResponding(false);
      }, 300);
    }
  };

  const handleOpenNoticeModal = (incident: CivicAlert) => {
    setSelectedIncidentForNotice(incident);
    setCurrentView("reports");
  };

  const handleProfileChange = (profileId: string) => {
    setActiveProfile(profileId);
    if (profileId === "aris_thorne") {
      setCurrentView("reports");
    }
  };

  const activeReportsCount = alerts.filter(a => a.status === "active").length;

  if (showIntro) {
    return (
      <CinematicIntro
        onComplete={() => setShowIntro(false)}
        currentTheme={theme}
        currentDesign={designStyle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex text-white font-sans">
      
      {/* Sidebar Rail Layout Component */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSearchQuery("");
        }}
        activeProfile={activeProfile}
        onProfileChange={handleProfileChange}
      />

      {/* Main Page Area Container */}
      <div className="flex-1 pl-64 pt-16 min-h-screen flex flex-col">
        {/* Header Navigation layout */}
        <Header
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeReportsCount={activeReportsCount}
          onNavigate={(view) => {
            setCurrentView(view);
            setSearchQuery("");
          }}
          onOpenNotifications={() => setShowNotifications(true)}
          activeProfile={activeProfile}
        />

        {/* Central main content area */}
        <main className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentView === "dashboard" && (
              <DashboardView
                key="dashboard"
                alerts={alerts}
                searchQuery={searchQuery}
                onNavigate={(view) => {
                  setCurrentView(view);
                  setSearchQuery("");
                }}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                onOpenNoticeModal={handleOpenNoticeModal}
                onTriggerSimulation={() => {
                  setCurrentView("simulation");
                  setSearchQuery("");
                }}
                activeProfile={activeProfile}
                suggestions={suggestions}
                onAddSuggestion={handleAddSuggestion}
                onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
              />
            )}

            {currentView === "simulation" && (() => {
              const isResultStale = 
                simulationParams.greenSpaceRatio !== lastSimulatedParams.greenSpaceRatio ||
                simulationParams.publicTransitFrequency !== lastSimulatedParams.publicTransitFrequency ||
                simulationParams.optimizeAlbedo !== lastSimulatedParams.optimizeAlbedo;
              return (
                <SimulationView
                  key="simulation"
                  params={simulationParams}
                  onParamsChange={setSimulationParams}
                  result={simulationResult}
                  onRunSimulation={handleRunSimulation}
                  isSimulating={isSimulating}
                  activeProfile={activeProfile}
                  onAddSuggestion={handleAddSuggestion}
                  isResultStale={isResultStale}
                />
              );
            })()}

            {currentView === "maps" && (
              <ResourceMapsView
                key="maps"
                searchQuery={searchQuery}
              />
            )}

            {currentView === "reports" && (
              <ReportingHubView
                key="reports"
                alerts={alerts}
                onAddAlert={handleAddAlert}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                searchQuery={searchQuery}
                activeProfile={activeProfile}
                onAddSuggestion={handleAddSuggestion}
              />
            )}

            {currentView === "analytics" && (
              <AnalyticsView
                key="analytics"
                chatHistory={chatHistory}
                onSendMessage={handleSendMessage}
                isResponding={isResponding}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Sidebar drawer Overlay for notifications/recent logs */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-100 flex justify-end select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-96 h-screen glass-panel shadow-2xl border-l border-white/10 p-8 flex flex-col gap-6 text-white"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-md font-extrabold text-white font-sans flex items-center">
                  <span className="material-symbols-outlined mr-2 text-indigo-400">notifications</span>
                  System Notifications
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-full hover:bg-white/10 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Active notifications list */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {alerts.filter(a => a.status === "active").map(alert => (
                  <div
                    key={alert.id}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-sm"
                  >
                    <p className="text-[9px] font-mono font-bold text-pink-400 uppercase tracking-widest">
                      CRITICAL • {alert.district}
                    </p>
                    <h4 className="text-xs font-bold text-white mt-1">
                      {alert.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-slate-400">
                      <span>{alert.time}</span>
                      <button
                        onClick={() => {
                          handleUpdateAlertStatus(alert.id, "resolved");
                          setShowNotifications(false);
                        }}
                        className="text-indigo-400 font-bold hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
                
                {alerts.filter(a => a.status === "active").length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    All clear. No critical alerts requiring attention.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
