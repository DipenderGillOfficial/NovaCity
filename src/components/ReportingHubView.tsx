import React, { useState } from "react";
import { CivicAlert } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ReportingHubViewProps {
  alerts: CivicAlert[];
  onAddAlert: (newAlert: Omit<CivicAlert, "id" | "time">) => void;
  onUpdateAlertStatus: (id: string, status: "active" | "pending" | "resolved") => void;
  searchQuery: string;
  activeProfile?: string;
  onAddSuggestion?: (content: string, viewContext: string) => void;
}

export const ReportingHubView: React.FC<ReportingHubViewProps> = ({
  alerts,
  onAddAlert,
  onUpdateAlertStatus,
  searchQuery,
  activeProfile,
  onAddSuggestion
}) => {
  // Form States
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<any>("water");
  const [formDistrict, setFormDistrict] = useState("District 4");
  const [formDesc, setFormDesc] = useState("");
  
  // Feedback States for read-only Employee profile
  const [suggestedAlertIds, setSuggestedAlertIds] = useState<string[]>([]);
  const [formSuggested, setFormSuggested] = useState(false);
  const [draftSuggested, setDraftSuggested] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // AI Notice Drafter States
  const [aiIncident, setAiIncident] = useState("Water Leak in District 4");
  const [aiScope, setAiScope] = useState("Oak & 5th Avenue block");
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftedNotice, setDraftedNotice] = useState<{
    title: string;
    lead: string;
    details: string;
    actionItems: string[];
    estimatedResolution: string;
  } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "resolved">("all");

  const triggerSuggestAlert = (alertId: string, text: string) => {
    if (onAddSuggestion) {
      onAddSuggestion(text, "Reporting Hub");
    }
    setSuggestedAlertIds(prev => [...prev, alertId]);
    setTimeout(() => {
      setSuggestedAlertIds(prev => prev.filter(id => id !== alertId));
    }, 3000);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    if (activeProfile === "admin_unit_01") {
      const suggText = `Suggest incident report: "${formTitle}" in ${formDistrict}. Category: ${formCategory}. Description details: ${formDesc}`;
      if (onAddSuggestion) {
        onAddSuggestion(suggText, "Reporting Hub");
      }
      setFormTitle("");
      setFormDesc("");
      setFormSuggested(true);
      setTimeout(() => setFormSuggested(false), 3000);
      return;
    }

    onAddAlert({
      title: formTitle,
      description: formDesc,
      status: "active",
      category: formCategory,
      district: formDistrict
    });

    // Reset Form
    setFormTitle("");
    setFormDesc("");
  };

  // Call server-side API to draft Notice with Gemini
  const handleDraftNotice = async () => {
    setIsDrafting(true);
    setDraftedNotice(null);
    setIsPublished(false);
    try {
      const res = await fetch("/api/gemini/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentType: aiIncident,
          district: formDistrict,
          impactScope: aiScope,
          priority: "High"
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDraftedNotice(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setDraftedNotice({
        title: `OFFICIAL CIVIC NOTICE: ${aiIncident}`,
        lead: `Urgent utility advisory has been declared for ${formDistrict}.`,
        details: `City engineering crews have been dispatched to address ${aiIncident} around ${aiScope}. Pressure reductions and traffic detours may occur during active repair hours.`,
        actionItems: [
          "Follow local street detours and reduce speed near maintenance zones.",
          "Keep local non-essential water/grid consumption to a minimum.",
          "Check municipal dashboard for live updates."
        ],
        estimatedResolution: "4 Hours"
      });
    } finally {
      setIsDrafting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="pb-12 space-y-8 text-white"
    >
      {/* Page Header */}
      <div className="select-none">
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Reporting Hub
        </h2>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          Log municipal incidents, track active crews, and draft automated citizen notices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Alerts Table & Filters (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 select-none">
            <div className="flex gap-2 glass-panel p-1 rounded-xl border border-white/10 text-xs">
              {(["all", "active", "pending", "resolved"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold capitalize cursor-pointer transition-all ${
                    statusFilter === f
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Showing {filteredAlerts.length} reports
            </p>
          </div>

          {/* Incidents Table list */}
          <div className="glass-card border border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider select-none">
                    <th className="p-4 pl-6">Incident Category</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No municipal reports matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map(alert => {
                      // category styling
                      let catBadge = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                      if (alert.category === "water") catBadge = "bg-sky-500/10 text-sky-400 border border-sky-500/20";
                      else if (alert.category === "grid") catBadge = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
                      else if (alert.category === "pothole") catBadge = "bg-pink-500/10 text-pink-400 border border-pink-500/20";
                      else if (alert.category === "official") catBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      else if (alert.category === "sensor") catBadge = "bg-white/10 text-slate-300 border border-white/10";

                      // status styling
                      let statDot = "bg-rose-500";
                      if (alert.status === "pending") statDot = "bg-amber-400";
                      else if (alert.status === "resolved") statDot = "bg-emerald-400";

                      return (
                        <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-sans ${catBadge}`}>
                                {alert.category}
                              </span>
                              <div>
                                <p className="font-semibold text-white">{alert.title}</p>
                                <p className="text-xs text-slate-400 line-clamp-1 max-w-sm mt-0.5">{alert.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-300">
                            {alert.district}
                          </td>
                          <td className="p-4 select-none">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                              <span className={`w-1.5 h-1.5 rounded-full ${statDot}`} />
                              <span className="capitalize">{alert.status}</span>
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6 select-none">
                            <div className="flex items-center justify-end gap-2 text-xs">
                              {activeProfile === "admin_unit_01" ? (
                                <button
                                  onClick={() => {
                                    const actionName = alert.status === "resolved" ? "reopening" : "resolving";
                                    const suggText = `Suggest ${actionName} incident: "${alert.title}" in ${alert.district}. Crew reports state status should be updated.`;
                                    triggerSuggestAlert(alert.id, suggText);
                                  }}
                                  disabled={suggestedAlertIds.includes(alert.id)}
                                  className={`px-2.5 py-1 rounded-lg transition-all font-semibold flex items-center gap-1 ${
                                    suggestedAlertIds.includes(alert.id)
                                      ? "text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 cursor-default"
                                      : "text-sky-400 border border-sky-500/20 hover:bg-sky-500/10 bg-sky-500/5 cursor-pointer"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {suggestedAlertIds.includes(alert.id) ? "check_circle" : "feedback"}
                                  </span>
                                  {suggestedAlertIds.includes(alert.id) ? "Suggested ✓" : `Suggest ${alert.status === "resolved" ? "Reopen" : "Resolve"}`}
                                </button>
                              ) : (
                                <button
                                  onClick={() => onUpdateAlertStatus(alert.id, alert.status === "resolved" ? "active" : "resolved")}
                                  className="px-2.5 py-1 text-slate-300 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 bg-white/5 transition-colors cursor-pointer font-bold"
                                >
                                  {alert.status === "resolved" ? "Reopen" : "Resolve"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Log Incident Form & AI Announcement Builder (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* File Incident Report Form */}
          <div className="glass-card border border-white/10 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-extrabold text-white font-sans mb-4 flex items-center select-none">
              <span className="material-symbols-outlined mr-2 text-indigo-400 text-lg">
                {activeProfile === "admin_unit_01" ? "feedback" : "add_location_alt"}
              </span>
              {activeProfile === "admin_unit_01" ? "Suggest Incident Report" : "Log Incident Report"}
            </h3>
            
            {formSuggested && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Suggestion filed successfully! Admin has been notified.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Incident Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/25 outline-none text-white placeholder:text-slate-500"
                  placeholder="e.g. District water pipe burst"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 select-none">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/25 outline-none text-slate-200"
                  >
                    <option value="water">Water Main</option>
                    <option value="grid">Power Grid</option>
                    <option value="pothole">Pothole</option>
                    <option value="sensor">Sensor Node</option>
                    <option value="other">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">District Location</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500/25 outline-none text-slate-200"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={`District ${i + 1}`}>
                        District {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Description Details</label>
                <textarea
                  rows={3}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/25 outline-none text-white placeholder:text-slate-500"
                  placeholder="Affected zone coordinates, residents count, active status..."
                />
              </div>

              <button
                type="submit"
                className={`w-full text-white py-3 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all duration-200 select-none flex items-center justify-center gap-2 ${
                  activeProfile === "admin_unit_01"
                    ? "bg-sky-600 hover:bg-sky-500 shadow-sky-500/20"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {activeProfile === "admin_unit_01" ? "rate_review" : "publish"}
                </span>
                {activeProfile === "admin_unit_01" ? "Submit Incident Suggestion" : "Submit Report"}
              </button>
            </form>
          </div>

          {/* AI Notice Announcement Builder */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4 backdrop-blur-md">
            <h3 className="text-sm font-extrabold text-indigo-400 font-sans flex items-center select-none">
              <span className="material-symbols-outlined mr-2 text-indigo-400 text-lg">psychology</span>
              AI Civic Notice Drafter
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest select-none">Incident Type</label>
                <input
                  type="text"
                  value={aiIncident}
                  onChange={(e) => setAiIncident(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest select-none">Affected Streets/Zone</label>
                <input
                  type="text"
                  value={aiScope}
                  onChange={(e) => setAiScope(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-white"
                />
              </div>

              <button
                onClick={handleDraftNotice}
                disabled={isDrafting}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm select-none flex items-center justify-center gap-1.5 shadow-pink-500/20"
              >
                {isDrafting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                    Drafting Official Bulletin...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">spatial_tracking</span>
                    Generate Official Advisory
                  </>
                )}
              </button>
            </div>

            {/* Display Draft result */}
            <AnimatePresence>
              {draftedNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-indigo-950/40 p-4 rounded-xl border border-white/10 space-y-3 shadow-inner backdrop-blur-md"
                >
                  <p className="text-[10px] font-mono font-bold text-rose-400 uppercase select-none flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">campaign</span>
                    Preview Draft Bulletin
                  </p>
                  <h4 className="text-xs font-bold text-white font-sans border-b border-white/10 pb-1.5">
                    {draftedNotice.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-200 leading-normal">
                    {draftedNotice.lead}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {draftedNotice.details}
                  </p>
                  
                  <div className="space-y-1 pt-1 border-t border-white/10 select-none">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Action instructions:</p>
                    <ul className="list-disc pl-3 text-[10px] text-slate-400 space-y-1">
                      {draftedNotice.actionItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold select-none pt-2 border-t border-white/10">
                    <span>Est. Res: {draftedNotice.estimatedResolution}</span>
                    {activeProfile === "admin_unit_01" ? (
                      draftSuggested ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">check_circle</span>
                          Suggested ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            const contentText = `Suggest publishing drafted official advisory: "${draftedNotice.title}" - "${draftedNotice.lead}"`;
                            if (onAddSuggestion) {
                              onAddSuggestion(contentText, "Reporting Hub");
                            }
                            setDraftSuggested(true);
                            setTimeout(() => setDraftSuggested(false), 3000);
                          }}
                          className="text-sky-400 hover:underline cursor-pointer font-bold"
                        >
                          Suggest Bulletin Publication
                        </button>
                      )
                    ) : (
                      isPublished ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">check_circle</span>
                          Published to Feed ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onAddAlert({
                              title: draftedNotice.title,
                              description: `${draftedNotice.lead} ${draftedNotice.details}`,
                              status: "active",
                              category: "official",
                              district: formDistrict
                            });
                            setIsPublished(true);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[11px]">campaign</span>
                          Publish to Alerts Board
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
