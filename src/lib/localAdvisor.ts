import { SimulationParams, SimulationResult } from "../types";

export function getLocalAdvisorResponse(
  message: string,
  params: SimulationParams,
  result: SimulationResult
): string {
  const lowerMessage = message.toLowerCase();

  // 1. Creators / Developers
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

  // 2. API Limits, Reset Times & Quota
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

  // 3. PUBG / BGMI Ban Inquiries
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

  // 4. Greetings
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

  // 5. Parameter & Metric Queries
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

  if (lowerMessage.includes("load") || lowerMessage.includes("grid") || lowerMessage.includes("electricity") || lowerMessage.includes("power") || lowerMessage.includes("solar") || lowerMessage.includes("energy")) {
    return `### ⚡ Regional Power Grid & Renewable Load Balancer
A diagnostic trace has been completed for all electrical junctions:

* **Active Grid Load Status**: \`${result.gridLoadImpact || "78% Capacity"}\`
* **Optimized Solar Albedo Coating**: \`${params.optimizeAlbedo ? "Enabled (+4.2% Grid Relief)" : "Disabled"}\`
* **Actionable Routing**:
  - High solar reflection lowers the power load of HVAC systems.
  - Primary solar cells are routing excess charge into EV Hub B to prevent grid saturation during peak irradiance hours.`;
  }

  if (lowerMessage.includes("co2") || lowerMessage.includes("carbon") || lowerMessage.includes("reduction") || lowerMessage.includes("environment")) {
    return `### 🌍 Carbon Footprint & Environmental Index
Our mathematical simulation model has updated the environmental indicators:

* **CO2 Reduction Metric**: \`${result.co2Reduction || "-34.5%"}\`
* **Model Parameters**: \`${result.co2Detail || "Derived from active parameters"}\`
* **Advisory Status**:
  - Urban forests are absorbing carbon at peak capacity.
  - Continue implementing eco-roof mandates to push CO2 reductions past the **-45%** milestone.`;
  }

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
