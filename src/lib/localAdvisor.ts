import { SimulationParams, SimulationResult } from "../types";

export function getLocalAdvisorResponse(
  message: string,
  params: SimulationParams,
  result: SimulationResult
): string {
  const lowerMessage = message.toLowerCase();

  // Determine if the query is related to the site, its creators, or its features
  const isSiteRelated = 
    // Greetings & identity & help
    lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey") || 
    lowerMessage.includes("greetings") || lowerMessage.includes("morning") || lowerMessage.includes("afternoon") ||
    lowerMessage.includes("help") || lowerMessage.includes("guide") || lowerMessage.includes("how to use") || 
    lowerMessage.includes("capabilities") || lowerMessage.includes("what can you do") || lowerMessage.includes("who are you") ||
    lowerMessage.includes("what is this") || lowerMessage.includes("about this") || lowerMessage.includes("site") ||
    lowerMessage.includes("website") || lowerMessage.includes("platform") || lowerMessage.includes("app") ||
    lowerMessage.includes("novacity") || lowerMessage.includes("nova city") ||
    lowerMessage.includes("system") || lowerMessage.includes("operational") || lowerMessage.includes("status") ||
    lowerMessage.includes("map") || lowerMessage.includes("3d") || lowerMessage.includes("view") || lowerMessage.includes("panel") ||
    
    // Creators / Developers
    lowerMessage.includes("creator") || lowerMessage.includes("developer") || lowerMessage.includes("team") ||
    lowerMessage.includes("member") || lowerMessage.includes("author") || lowerMessage.includes("built") ||
    lowerMessage.includes("made") || lowerMessage.includes("created") || lowerMessage.includes("designed") ||
    lowerMessage.includes("who is behind") || lowerMessage.includes("dipender") || lowerMessage.includes("divyam") ||
    lowerMessage.includes("shreya") || lowerMessage.includes("prakhar") ||
    
    // Core parameters, sliders, simulation & planning
    lowerMessage.includes("green") || lowerMessage.includes("park") || lowerMessage.includes("tree") ||
    lowerMessage.includes("forest") || lowerMessage.includes("canopy") || lowerMessage.includes("space") ||
    lowerMessage.includes("transit") || lowerMessage.includes("traffic") || lowerMessage.includes("bus") ||
    lowerMessage.includes("metro") || lowerMessage.includes("rail") || lowerMessage.includes("train") ||
    lowerMessage.includes("shuttle") || lowerMessage.includes("commute") || lowerMessage.includes("frequency") ||
    lowerMessage.includes("interval") || lowerMessage.includes("congest") || lowerMessage.includes("delay") ||
    lowerMessage.includes("building") || lowerMessage.includes("height") || lowerMessage.includes("ceiling") ||
    lowerMessage.includes("limit") || lowerMessage.includes("skyline") || lowerMessage.includes("skyscraper") ||
    lowerMessage.includes("architecture") || lowerMessage.includes("zoning") ||
    lowerMessage.includes("albedo") || lowerMessage.includes("coating") || lowerMessage.includes("reflect") ||
    lowerMessage.includes("cool asphalt") || lowerMessage.includes("surfacing") || lowerMessage.includes("roof") ||
    lowerMessage.includes("sustainable") || lowerMessage.includes("sustainability") || lowerMessage.includes("urban") ||
    lowerMessage.includes("city") || lowerMessage.includes("digital twin") || lowerMessage.includes("simulation") ||
    lowerMessage.includes("parameter") || lowerMessage.includes("temp") || lowerMessage.includes("temperature") ||
    lowerMessage.includes("weather") || lowerMessage.includes("forecast") || lowerMessage.includes("diagnostic") ||
    lowerMessage.includes("telemetry") ||
    
    // Simulation metrics & outcomes
    lowerMessage.includes("co2") || lowerMessage.includes("carbon") || lowerMessage.includes("reduction") ||
    lowerMessage.includes("emissions") || lowerMessage.includes("environment") || lowerMessage.includes("pollution") ||
    lowerMessage.includes("roi") || lowerMessage.includes("cost") || lowerMessage.includes("money") ||
    lowerMessage.includes("financial") || lowerMessage.includes("budget") || lowerMessage.includes("investment") ||
    lowerMessage.includes("payback") || lowerMessage.includes("return") ||
    lowerMessage.includes("grid") || lowerMessage.includes("electricity") || lowerMessage.includes("power") ||
    lowerMessage.includes("energy") || lowerMessage.includes("battery") || lowerMessage.includes("solar") ||
    lowerMessage.includes("wind") || lowerMessage.includes("substation") || lowerMessage.includes("generator") ||
    lowerMessage.includes("load") || lowerMessage.includes("capacity") ||
    
    // Incidents, reports, policies
    lowerMessage.includes("water") || lowerMessage.includes("leak") || lowerMessage.includes("pipe") ||
    lowerMessage.includes("burst") || lowerMessage.includes("main") || lowerMessage.includes("hydro") ||
    lowerMessage.includes("sewage") || lowerMessage.includes("drain") || lowerMessage.includes("flood") ||
    lowerMessage.includes("runoff") || lowerMessage.includes("bioswale") ||
    lowerMessage.includes("alert") || lowerMessage.includes("incident") || lowerMessage.includes("report") ||
    lowerMessage.includes("hub") || lowerMessage.includes("complaint") || lowerMessage.includes("pothole") ||
    lowerMessage.includes("safety") || lowerMessage.includes("emergency") || lowerMessage.includes("seismic") ||
    lowerMessage.includes("advisory") || lowerMessage.includes("draft") || lowerMessage.includes("notice") ||
    lowerMessage.includes("warning") || lowerMessage.includes("announcement") || lowerMessage.includes("bulletin") ||
    lowerMessage.includes("policy") || lowerMessage.includes("policies") || lowerMessage.includes("shaving") ||
    lowerMessage.includes("mandate") || lowerMessage.includes("arterial") || lowerMessage.includes("shaping") ||
    
    // Miscellaneous pre-coded topics
    lowerMessage.includes("pubg") || lowerMessage.includes("bgmi") || lowerMessage.includes("ban") ||
    lowerMessage.includes("quota") || lowerMessage.includes("429") || lowerMessage.includes("limit") ||
    lowerMessage.includes("rate");

  if (!isSiteRelated) {
    return `No, I am sorry, but I do not know about this topic. As the NovaCity central AI Core, I can only answer questions and assist you with topics directly related to this website, its creators, its simulation parameters, and its smart city OS features.

Please ask me a question related to our smart city systems, such as:
* **Creators & Team**: "Who built this website?" or "Who is Dipender/Divyam/Shreya/Prakhar?"
* **Zoning Sliders & Parameters**: "What is our current Green Space Ratio?" or "Explain the public transit frequency limits"
* **Real-time Simulation Outcomes**: "Show me our estimated ROI" or "How is CO2 reduction calculated?"
* **Civic Alerts & Advisories**: "Draft a public advisory for main leakage" or "Tell me about water main burst reports"`;
  }

  // Helper variables for combined logic
  const containsWater = lowerMessage.includes("water") || lowerMessage.includes("leak") || lowerMessage.includes("pipe") || lowerMessage.includes("burst") || lowerMessage.includes("sewage") || lowerMessage.includes("hydro") || lowerMessage.includes("main");
  const containsPower = lowerMessage.includes("power") || lowerMessage.includes("electricity") || lowerMessage.includes("blackout") || lowerMessage.includes("outage") || lowerMessage.includes("grid") || lowerMessage.includes("load") || lowerMessage.includes("energy") || lowerMessage.includes("solar");
  const containsAdvisory = lowerMessage.includes("advisory") || lowerMessage.includes("draft") || lowerMessage.includes("notice") || lowerMessage.includes("announcement") || lowerMessage.includes("warning") || lowerMessage.includes("alert") || lowerMessage.includes("write") || lowerMessage.includes("create") || lowerMessage.includes("publish");

  // 1. Specific case: Advisory / Draft for Water Main Leakage / Pipe Burst
  if (containsAdvisory && containsWater) {
    return `### 📢 OFFICIAL PUBLIC ADVISORY: WATER MAIN SERVICE DISRUPTION (DRAFT)

**To:** Residents, Businesses, and Municipal Personnel of District 3 (Oakwood Corridor)  
**Status:** EMERGENCY ADVISORY  
**Issued by:** NovaCity Municipal Water Authority & Central AI Diagnostics Core  

---

#### 🚨 Incident Summary
A sudden pressure spike (calculated at \`+24%\` above safety tolerance) has caused a **major water main fracture** along the **Oak Street and 5th Avenue intersection**. 

#### 🚧 Corrective Actions In Progress
1. **Dynamic Shutoff Valves Activated**: High-pressure isolation valves have been remotely triggered to bypass District 3, reducing immediate water loss from 120 Liters/sec to less than 15 Liters/sec.
2. **Emergency Crews Dispatched**: Heavy utility automated drones and emergency engineering crews have arrived on site to begin structural trenching.
3. **Traffic Diversion**: Local traffic has been redirected away from the Oakwood Corridor due to minor street flooding.

#### 📋 Resident Guidance
* **Boil Water Mandate**: Active for immediate residents of District 3 until water clarity index readings return to nominal safe margins.
* **Temporary Pressure Reduction**: Nearby sectors may experience minor pressure drops for the next **3 to 4 hours** while welding repairs are finalized and certified.
* **Emergency Supply**: Portable fresh-water tankers have been stationed at the **District 3 Civic Plaza** for immediate public use.

*Prepared dynamically by NovaCity AI Core based on active pressure monitoring and grid telemetry.*`;
  }

  // 2. Specific case: Advisory / Draft for Power Outage / Grid Load
  if (containsAdvisory && containsPower) {
    return `### 📢 OFFICIAL PUBLIC ADVISORY: REGIONAL POWER GRID SHAVING (DRAFT)

**To:** Residents, Commercial Retailers, and Smart Hubs in District 5 & 7  
**Status:** CAUTIONARY SYSTEM REGULATION  
**Issued by:** NovaCity Energy Management & Central AI Load Balancer  

---

#### ⚡ Incident Summary
Extreme ambient cooling demands have pushed regional power consumption to a peak grid threshold of \`${result.gridLoadImpact || "82% Capacity"}\`. To prevent thermal damage to central substation transformers, the system is entering an active load-shaving cycle.

#### 🔋 Active Mitigation & Grid Re-balancing
1. **Albedo Deflection Active**: NovaCity's active Cool Albedo coatings are reflecting solar heat away, saving approximately \`+4.2%\` auxiliary grid cooling load.
2. **EV Hub Power Throttle**: Smart vehicle charging portals in Sector B have been dynamically adjusted to standard flow rate (non-rapid) to safeguard reserve capacitors.
3. **Substation Off-Load**: Stored energy in regional lithium-ion micro-arrays is now actively routing back into high-demand apartment towers.

#### 📋 Guidance for Smart Nodes & Households
* **De-congest Peak Demand**: Please defer heavy-load appliances (washing machines, pool filters, dry cycles) until after **19:00 Local Time**.
* **Smart HVAC Offset**: Minor, remote 1.5°C thermostat increments are being applied to state-owned office buildings to conserve regional power.

*Prepared dynamically by NovaCity AI Core based on live regional electrical loads and battery array statuses.*`;
  }

  // 3. Generic Advisory / Draft
  if (containsAdvisory) {
    return `### 📢 MUNICIPAL PUBLIC ADVISORY DRAFT

**Subject:** General Operational Update & Civic Alignment  
**Target Audience:** Registered NovaCity Smart Citizens  
**Issued by:** Central AI Core & Municipal Command  

---

#### 📡 System Status Briefing
In accordance with your active urban planning parameters, NovaCity is currently maintaining **optimal performance metrics**:
* **Green Canopy Density**: \`${params.greenSpaceRatio}%\` — currently providing clean air and localized ambient temperature cooling.
* **Autonomous Transit Frequency**: Running at a \`${params.publicTransitFrequency} minute\` dispatch interval, successfully keeping traffic congestion delays minimized by approximately \`${result.trafficImpact || "-12.5%"}\`.
* **Vertical Height Ceiling**: Confirmed and enforced at a max of \`${params.buildingHeightLimits} meters\`.

#### 🚧 Active Planning Projects
* **Smart Grid Calibration**: Active load monitoring is keeping power grid capacity safe at \`${result.gridLoadImpact || "78% Capacity"}\`.
* **Eco-Roof Compliance**: System is reviewing building footprints to expand green zones.

#### 📋 Citizen Action Required
Please ensure your smart home nodes are configured to sync daily. If you encounter any local utility or road maintenance issues, report them immediately through the **NovaCity Reporting Hub**.

*Created by NovaCity Client-Side NLP Engine (Offline Fallback).*`;
  }

  // 4. Creators / Developers
  const isAskingAboutCreators = 
    (lowerMessage.includes("who") && (lowerMessage.includes("made") || lowerMessage.includes("built") || lowerMessage.includes("created") || lowerMessage.includes("developed") || lowerMessage.includes("design"))) ||
    lowerMessage.includes("creator") || 
    lowerMessage.includes("members") || 
    lowerMessage.includes("team") || 
    lowerMessage.includes("developer") ||
    lowerMessage.includes("who is behind");

  if (isAskingAboutCreators) {
    return `### 🏆 NovaCity Creators & Development Team
This state-of-the-art NovaCity Smart City OS digital twin was designed and engineered by an outstanding development team:

1. **Dipender, Divyam**
   * **Role**: Lead Developers
   * **Responsibilities**: Full-stack engineering (React/Vite frontend + Express backend), integration of high-performance \`@google/genai\` models, custom simulation algorithms, and aesthetic glass-morphic styling.

2. **Shreya**
   * **Role**: Content & Database Specialist
   * **Responsibilities**: Curating rich educational study material, organizing comprehensive municipal guidelines, and designing the persistent database schemas.

3. **Prakhar**
   * **Role**: Analyst & Documentarian
   * **Responsibilities**: Drafting detailed technical specifications, project structure diagrams, and delivering the high-impact PowerPoint presentation (PPT).`;
  }

  // 5. API Limits, Reset Times & Quota
  const isAskingAboutLimits = 
    lowerMessage.includes("limit") || 
    lowerMessage.includes("reset") || 
    lowerMessage.includes("quota") || 
    lowerMessage.includes("exhausted") || 
    lowerMessage.includes("429") || 
    lowerMessage.includes("rate limit") || 
    lowerMessage.includes("daily limit");

  if (isAskingAboutLimits) {
    return `### 🛑 Gemini API Quota & Limit Reset Information

As the central NovaCity AI Core, here is the official diagnostic status regarding API limits and quota windows:

* **Rate Limits (Free Tier)**: The Gemini Free Tier has a rate limit of **15 Requests Per Minute (RPM)** and **1,500 Requests Per Day (RPD)**.
* **When Will My Limit Reset?**:
  - **Minute-level Rate Limit**: Resets automatically **every 60 seconds** after your last call.
  - **Daily-level Quota Limit**: Resets globally at **00:00 UTC** (which is **05:30 AM Indian Standard Time - IST**).
* **System Resilience**: If you encounter a 429 quota error, our **NovaCity Dynamic Local Fallback Engine** immediately takes over. It simulates realistic, context-aware smart city responses, ensuring zero interruption to your simulation metrics and dashboard panels!`;
  }

  // 6. PUBG / BGMI Ban Inquiries
  const isAskingAboutPubg = 
    lowerMessage.includes("pubg") || 
    lowerMessage.includes("bgmi") || 
    lowerMessage.includes("ban");

  if (isAskingAboutPubg) {
    return `### 🎮 Digital Recreation & PUBG Ban Status Report

While my central processing cores are primarily designed for optimizing smart-grid loads and municipal water routes, I have pulled our digital recreation records regarding game regulations:

* **Zoning & Regulatory Action**: PlayerUnknown's Battlegrounds (PUBG) has been banned or restricted in several national grids (including India, where it was later refactored and re-released as BGMI - Battlegrounds Mobile India) due to digital security, data privacy policies, and screen-time guidelines.
* **NovaCity Digital Twin Simulation**: In our sustainable urban plan for 2030, high-bandwidth gaming lines are allocated dynamically. Localized digital recreation zones in District 7 are equipped with solar-powered, low-latency micro-servers. This supports competitive esports hubs without compromising emergency communication or energy grids!`;
  }

  // 7. Water / Leakage / Pipe / Utility specific questions (without advisory)
  if (containsWater) {
    return `### 🚰 Water Distribution & Hydro-Pressure Telemetry
You queried our hydro-utility distribution layer. Here is the active diagnostic analysis:

* **Flow Integrity Index**: \`98.4%\` nominal pipe lining throughput across major grids.
* **Average Delivery Pressure**: \`4.1 bar\` (within optimal safety margins of 3.5 - 4.5 bar).
* **Automated Safety Shield**: NovaCity's active seismic flow meters measure microscopic ground tremors and anomalous friction noises along primary pipe walls to spot and isolate micro-leakages before a physical crack ruptures.
* **Actionable Insight**: 
  - To generate a complete public notice for municipal channels regarding this topic, type: **"Draft a public advisory for main leakage"** in the chat console!`;
  }

  // 8. Greetings
  const isGreeting = 
    lowerMessage.startsWith("hi") || 
    lowerMessage.startsWith("hello") || 
    lowerMessage.startsWith("hey") || 
    lowerMessage.includes("greetings") ||
    lowerMessage.includes("good morning") ||
    lowerMessage.includes("good afternoon");

  if (isGreeting) {
    return `### 📡 NovaCity AI Core Online
Greetings, Admin. I am the central operating intelligence of NovaCity. 

All diagnostic telemetry channels are stable. How can I assist you with city planning, resource allocation, or active simulations today?

* **Active Parameters**: 
  - Green Space: \`${params.greenSpaceRatio}%\`
  - Transit Interval: \`${params.publicTransitFrequency}m\`
  - Height Ceilings: \`${params.buildingHeightLimits}m\`
* **Forecasted Outlook**: 
  - CO2 Reduction: \`${result.co2Reduction || "-34.5%"}\`
  - Grid Load: \`${result.gridLoadImpact || "78% Capacity"}\``;
  }

  // 9. Green Space
  if (lowerMessage.includes("green") || lowerMessage.includes("park") || lowerMessage.includes("tree") || lowerMessage.includes("forest")) {
    const healthStatus = params.greenSpaceRatio > 50 ? "Superb" : params.greenSpaceRatio > 25 ? "Optimal" : "Critical Under-allocation";
    return `### 🌿 Green Space & Canopy Diagnosis
You queried our urban green canopy allocation. Here are the micro-analytics:

* **Current Canopy Ratio**: \`${params.greenSpaceRatio}%\` (Status: **${healthStatus}**)
* **Environmental Forecast**:
  - Carbon Sequestration rate is currently optimized.
  - Urban heat island offset: **-${(params.greenSpaceRatio * 0.12).toFixed(1)}°C** localized temperature mitigation.
* **AI Core Strategic Advice**: 
  ${params.greenSpaceRatio < 40 
    ? "⚠️ We advise increasing Green Space to at least **40%** to prevent severe runoff and heat pooling in District 3." 
    : "✅ Your current green layout is extremely resilient. Keep focusing on bioswale integration near heavy concrete corridors."}`;
  }

  // 10. Transit / Traffic
  if (lowerMessage.includes("transit") || lowerMessage.includes("bus") || lowerMessage.includes("metro") || lowerMessage.includes("frequency") || lowerMessage.includes("traffic")) {
    const transitStatus = params.publicTransitFrequency < 6 ? "High Efficiency" : params.publicTransitFrequency < 12 ? "Moderate Flow" : "Underperforming Corridor Delay";
    return `### 🚇 Transit Corridors & Commute Diagnostics
Your request for high-frequency public corridors has been simulated:

* **Autonomous Rail Dispatch Intervals**: \`${params.publicTransitFrequency} minutes\` (Rating: **${transitStatus}**)
* **Calculated Traffic Reduction**: \`${result.trafficImpact || "-12.5%"}\`
* **Strategic Optimization**:
  ${params.publicTransitFrequency > 8
    ? "⚠️ A dispatch interval of over 8 minutes is causing localized commuter bottlenecks in District 4. Consider lowering this to **5 minutes** or less."
    : "✅ Sub-6 minute dispatch rates maintain outstanding passenger fluid dynamics and keep commuter line stress below critical thresholds."}`;
  }

  // 11. Height / Buildings
  if (lowerMessage.includes("height") || lowerMessage.includes("building") || lowerMessage.includes("skyline") || lowerMessage.includes("skyscraper")) {
    return `### 🏢 Zoning Limits & Vertical Construction Limits
The current zoning code has been parsed relative to structural albedo coatings:

* **Maximum Permitted Building Height**: \`${params.buildingHeightLimits} meters\`
* **Shadow Footprint Radius**: \`${(params.buildingHeightLimits * 0.45).toFixed(0)}m\` average high-noon calculation.
* **Albedo Surface Optimization**: \`${params.optimizeAlbedo ? "ACTIVE (Highly Reflective Coatings)" : "INACTIVE (Heat Island Risk)"}\`
* **Structural Engineering Advice**:
  - Vertical construction over **300m** generates a higher localized shadow vortex, but maximizes ground-level green space.
  - Albedo coatings are essential at your current heights to keep building envelopes from overloading regional chiller loops.`;
  }

  // 12. Grid / Power / Energy
  if (lowerMessage.includes("load") || lowerMessage.includes("grid") || lowerMessage.includes("electricity") || lowerMessage.includes("power") || lowerMessage.includes("solar") || lowerMessage.includes("energy")) {
    return `### ⚡ Regional Power Grid & Renewable Load Balancer
A diagnostic trace has been completed for all electrical junctions:

* **Active Grid Load Status**: \`${result.gridLoadImpact || "78% Capacity"}\`
* **Optimized Solar Albedo Coating**: \`${params.optimizeAlbedo ? "Enabled (+4.2% Grid Relief)" : "Disabled"}\`
* **Actionable Routing**:
  - High solar reflection lowers the power load of HVAC systems.
  - Primary solar cells are routing excess charge into EV Hub B to prevent grid saturation during peak irradiance hours.`;
  }

  // 13. Carbon / CO2
  if (lowerMessage.includes("co2") || lowerMessage.includes("carbon") || lowerMessage.includes("reduction") || lowerMessage.includes("environment")) {
    return `### 🌍 Carbon Footprint & Environmental Index
Our mathematical simulation model has updated the environmental indicators:

* **CO2 Reduction Metric**: \`${result.co2Reduction || "-34.5%"}\`
* **Model Parameters**: \`${result.co2Detail || "Derived from active parameters"}\`
* **Advisory Status**:
  - Urban forests are absorbing carbon at peak capacity.
  - Continue implementing eco-roof mandates to push CO2 reductions past the **-45%** milestone.`;
  }

  // 14. Cost / ROI
  if (lowerMessage.includes("roi") || lowerMessage.includes("financial") || lowerMessage.includes("cost") || lowerMessage.includes("money") || lowerMessage.includes("investment")) {
    return `### 📊 Capital Investment & ROI Forecast
Financial models have completed multi-variable amortization calculations:

* **Estimated Return on Investment**: \`${result.estimatedRoi || "$1.8M"}\`
* **Amortization Period**: \`${result.roiPeriod || "15mo"}\`
* **Capital Allocation**:
  - Infrastructure investments are performing exceptionally due to low transit delay costs.
  - The calculated payback cycle is fully validated under current municipal constraints.`;
  }

  // Generic Dynamic Responder that compiles simulation parameters into a custom operational response
  const actionTopics = [
    "Optimizing solar charging loops on Zone 7 grid terminals.",
    "Drafting public shuttle scheduling updates for active routes.",
    "Updating municipal tree planting initiatives based on soil moisture data.",
    "Testing localized water main pressure metrics to prevent stress leaks."
  ];
  const chosenAction = actionTopics[message.length % actionTopics.length];

  return `### 📡 NovaCity AI Core Operational Update

Thank you for your inquiry: "${message}". Since we are running on local grid backup, I have simulated a custom response based on NovaCity's active telemetry:

* **Grid Stability & Load**: Currently running at \`${result.gridLoadImpact || "78% Capacity"}\`.
* **Resource Allocation**:
  - Green canopy density is at \`${params.greenSpaceRatio}%\` across major sectors.
  - Public autonomous transit frequency is running at a \`${params.publicTransitFrequency} min\` dispatch interval.
  - Height zoning rules are enforced up to \`${params.buildingHeightLimits}m\`.
* **Immediate Local Action**:
  - ${chosenAction}
  - Our system is continuously monitoring traffic, energy, and air index lines. 

*If you are running the platform in standalone offline mode, our dynamic client-side NLP generator handles these strategic assessments instantly!*`;
}
