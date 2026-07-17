import express from "express";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = 3000;

// Lazy initialization of the Gemini AI Client
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Helper to call generateContent with automatic retry and model fallback when encountering rate limits / 503 high demand
async function generateContentWithRetry(params: { model: string; contents: any; config?: any }, retries = 3, initialDelay = 1000): Promise<any> {
  const ai = getAI();
  
  // Robust list of models to try in sequence to bypass localized high-demand or capacity issues
  const modelsToTry = [
    params.model,
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ].filter((v, i, a) => a.indexOf(v) === i); // Deduplicate maintaining order
  
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let delay = initialDelay;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Bloomfield AI] Querying routing channel via ${modelName}...`);
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || (err?.error && err.error.code);
        const errMessageStr = String(err?.message || err || "").toLowerCase();
        const errStr = String(err || "").toLowerCase();
        
        const isTransient =
          status === 503 ||
          status === 429 ||
          errMessageStr.includes("503") ||
          errMessageStr.includes("429") ||
          errMessageStr.includes("unavailable") ||
          errMessageStr.includes("high demand") ||
          errMessageStr.includes("overloaded") ||
          errMessageStr.includes("quota") ||
          errStr.includes("503") ||
          errStr.includes("429") ||
          errStr.includes("unavailable") ||
          errStr.includes("high demand") ||
          errStr.includes("overloaded") ||
          errStr.includes("quota");

        if (isTransient && attempt < retries) {
          console.log(`[Bloomfield AI] Retrying current channel after short interval...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5; // Exponential backoff
        } else {
          console.log(`[Bloomfield AI] Shifting dynamic routing to fallback channel options`);
          break; // Switch to the next model fallback
        }
      }
    }
  }

  throw lastError || new Error("All available models are currently experiencing high demand.");
}

// Check if Gemini API is available
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "healthy",
    geminiKeyConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

// Endpoint: AI Smart City Advisor Chat (General Q&A, analytics, recommendations)
app.post("/api/gemini/advisor", async (req, res) => {
  const { message, history = [], image, alerts, simulationParams, simulationResult } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {

    const lowerMessage = message.toLowerCase();
    const isAskingAboutCreators = 
      (lowerMessage.includes("who") && (lowerMessage.includes("made") || lowerMessage.includes("built") || lowerMessage.includes("created") || lowerMessage.includes("developed") || lowerMessage.includes("design"))) ||
      lowerMessage.includes("creator") || 
      lowerMessage.includes("members") || 
      lowerMessage.includes("team") || 
      lowerMessage.includes("developer") ||
      lowerMessage.includes("who is behind");

    if (isAskingAboutCreators) {
      return res.json({
        reply: `### 🏆 Bloomfield Creators & Development Team
This state-of-the-art Bloomfield Environmental & Civic OS digital twin was designed and engineered by an outstanding development team:

1. **Dipender, Divyam**
   * **Role**: Lead Developers
   * **Responsibilities**: Full-stack engineering (React/Vite frontend + Express backend), integration of high-performance \`@google/genai\` models, custom simulation algorithms, and aesthetic glass-morphic styling.

2. **Shreya**
   * **Role**: Content & Database Specialist
   * **Responsibilities**: Curating rich educational study material, organizing comprehensive municipal guidelines, and designing the persistent database schemas.

3. **Prakhar**
   * **Role**: Analyst & Documentarian
   * **Responsibilities**: Drafting detailed technical specifications, project structure diagrams, and delivering the high-impact PowerPoint presentation (PPT).`
      });
    }

    // 2. Pre-check: API Limits, Reset Times & Quota Questions
    const isAskingAboutLimits = 
      lowerMessage.includes("limit") || 
      lowerMessage.includes("reset") || 
      lowerMessage.includes("quota") || 
      lowerMessage.includes("exhausted") || 
      lowerMessage.includes("429") || 
      lowerMessage.includes("rate limit") || 
      lowerMessage.includes("daily limit");

    if (isAskingAboutLimits) {
      return res.json({
        reply: `### 🛑 Gemini API Quota & Limit Reset Information

As the central Bloomfield AI Core, here is the official diagnostic status regarding API limits and quota windows:

* **Rate Limits (Free Tier)**: The Gemini Free Tier has a rate limit of **15 Requests Per Minute (RPM)** and **1,500 Requests Per Day (RPD)**.
* **When Will My Limit Reset?**:
  - **Minute-level Rate Limit**: Resets automatically **every 60 seconds** after your last call.
  - **Daily-level Quota Limit**: Resets globally at **00:00 UTC** (which is **05:30 AM Indian Standard Time - IST**).
* **System Resilience**: If you encounter a 429 quota error, our **Bloomfield Dynamic Local Fallback Engine** immediately takes over. It simulates realistic, context-aware smart city responses, ensuring zero interruption to your simulation metrics and dashboard panels!`
      });
    }

    // 3. Pre-check: PUBG / Mobile Gaming Ban Inquiries
    const isAskingAboutPubg = 
      lowerMessage.includes("pubg") || 
      lowerMessage.includes("bgmi") || 
      lowerMessage.includes("ban");

    if (isAskingAboutPubg) {
      return res.json({
        reply: `### 🎮 Digital Recreation & PUBG Ban Status Report

While my central processing cores are primarily designed for optimizing smart-grid loads and municipal water routes, I have pulled our digital recreation records regarding game regulations:

* **Zoning & Regulatory Action**: PlayerUnknown's Battlegrounds (PUBG) has been banned or restricted in several national grids (including India, where it was later refactored and re-released as BGMI - Battlegrounds Mobile India) due to digital security, data privacy policies, and screen-time guidelines.
* **Bloomfield Digital Twin Simulation**: In our sustainable urban plan for 2030, high-bandwidth gaming lines are allocated dynamically. Localized digital recreation zones in District 7 are equipped with solar-powered, low-latency micro-servers. This supports competitive esports hubs without compromising emergency communication or energy grids!`
      });
    }

    const ai = getAI();
    
    // Structure context system instruction
    let systemInstruction = `You are "Bloomfield AI Core", the intelligent central nervous system and executive advisor of Bloomfield (a state-of-the-art sustainable smart city).
You assist city administrators (such as Lead Strategist Dr. Aris Thorne or Supervisor Admin Unit 01) with:
1. Spatial analysis & resource routing
2. Renewable energy grid optimization (Solar/Wind integration)
3. Civic infrastructure tracking (potholes, water mains, traffic sensors)
4. Carbon footprint/CO2 reduction targets and ROI metrics

If the user uploads an image, analyze it thoroughly as part of your smart city advisory role. For example, identify anomalies, report statistics, or outline action items.

If the user asks who made this website, who developed it, or about the project members, you must answer with:
Members & Roles:
1. Dipender, Divyam - Front-End Development, Back-end Development, AI Model Development(Coding part), Model Testing, Analysis, Model Integration
2. Shreya - Study Material(Content), Database 
3. Prakhar - Documentation, PPT, Project File

CRITICAL REQUIREMENT - HANDLING UNRELATED TOPICS:
If the user asks any question that is NOT related to Bloomfield, this website, its developers/creators, its simulation parameters, its urban metrics, or its smart city features, you MUST respond with a variation of:
"No, I am sorry, but I do not know about this topic. As the Bloomfield central AI Core, I only have access to information regarding this website, the Bloomfield Smart City OS digital twin, our developers, and local urban simulation parameters."
Do NOT answer general knowledge, programming, history, cooking, sports, humor, or other unrelated questions. For any question not based on the site, say no and say you do not know about it. For all questions based on the site, you must answer completely, intelligently, and accurately.

Be professional, objective, highly analytical, and concise. Use realistic data and terminology like "District 4 Water Grid", "EV Hub B rerouting", "Adaptive LED mesh network". Keep formatting clean and highly scannable using brief markdown bullet points. Do not mention that you are a language model or refer to system bounds. Speak as a direct live API interface of Bloomfield OS.`;

    if (alerts && Array.isArray(alerts)) {
      systemInstruction += `\n\n[LIVE TELEMETRY - ACTIVE CIVIL STATUS & INCIDENTS]:\n` + 
        alerts.map((a: any) => `- [${(a.status || 'unknown').toUpperCase()}] ID: ${a.id || 'N/A'}, Category: ${a.category || 'N/A'}, Title: "${a.title || 'N/A'}" in ${a.district || 'N/A'}: ${a.description || 'N/A'} (${a.time || 'N/A'})`).join("\n");
    }

    if (simulationParams && simulationResult) {
      systemInstruction += `\n\n[LIVE PARAMETERS & SIMULATION INSIGHTS]:\n` +
        `- Green Space Ratio: ${simulationParams.greenSpaceRatio || 0}%\n` +
        `- Public Transit Frequency: Every ${simulationParams.publicTransitFrequency || 0} minutes\n` +
        `- Building Height Limits: ${simulationParams.buildingHeightLimits || 0} meters\n` +
        `- Albedo Mitigation Coating: ${simulationParams.optimizeAlbedo ? "Enabled" : "Disabled"}\n` +
        `Environmental and Financial impact based on these parameters:\n` +
        `- CO2 Reduction/Change: ${simulationResult.co2Reduction || 'N/A'} (${simulationResult.co2Detail || 'N/A'})\n` +
        `- Financial ROI Projected: ${simulationResult.estimatedRoi || 'N/A'} (${simulationResult.roiPeriod || 'N/A'} duration, ${simulationResult.roiDetail || 'N/A'})\n` +
        `- Congestion & Traffic Impact: ${simulationResult.trafficImpact || 'N/A'} (${simulationResult.trafficDetail || 'N/A'})\n` +
        `- Grid Load Impact: ${simulationResult.gridLoadImpact || 'N/A'}`;
    }

    // Setup chat or simple generateContent with image support
    const chatHistory = history.map((h: any) => {
      const parts: any[] = [];
      if (h.image && h.image.data && h.image.mimeType) {
        parts.push({
          inlineData: {
            mimeType: h.image.mimeType,
            data: h.image.data
          }
        });
      }
      parts.push({ text: h.content });
      return {
        role: h.role === "assistant" ? "model" : "user",
        parts
      };
    });

    const userParts: any[] = [];
    if (image && image.data && image.mimeType) {
      userParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
    }
    userParts.push({ text: message });

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: [
        ...chatHistory,
        { role: "user", parts: userParts }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "No response received from Bloomfield AI Core.";
    res.json({ reply });
  } catch (err: any) {
    console.log("[Advisor Engine Info] Transitioning to local simulation backup channel");
    
    // Parse context and formulate a highly detailed, personalized, professional mock response
    const msgLower = message.toLowerCase();
    
    // Determine if the query is related to the site, its creators, or its features
    const isSiteRelated = 
      // Greetings & identity & help
      msgLower.includes("hi") || msgLower.includes("hello") || msgLower.includes("hey") || 
      msgLower.includes("greetings") || msgLower.includes("morning") || msgLower.includes("afternoon") ||
      msgLower.includes("help") || msgLower.includes("guide") || msgLower.includes("how to use") || 
      msgLower.includes("capabilities") || msgLower.includes("what can you do") || msgLower.includes("who are you") ||
      msgLower.includes("what is this") || msgLower.includes("about this") || msgLower.includes("site") ||
      msgLower.includes("website") || msgLower.includes("platform") || msgLower.includes("app") ||
      msgLower.includes("novacity") || msgLower.includes("nova city") ||
      msgLower.includes("system") || msgLower.includes("operational") || msgLower.includes("status") ||
      msgLower.includes("map") || msgLower.includes("3d") || msgLower.includes("view") || msgLower.includes("panel") ||
      
      // Creators / Developers
      msgLower.includes("creator") || msgLower.includes("developer") || msgLower.includes("team") ||
      msgLower.includes("member") || msgLower.includes("author") || msgLower.includes("built") ||
      msgLower.includes("made") || msgLower.includes("created") || msgLower.includes("designed") ||
      msgLower.includes("who is behind") || msgLower.includes("dipender") || msgLower.includes("divyam") ||
      msgLower.includes("shreya") || msgLower.includes("prakhar") ||
      
      // Core parameters, sliders, simulation & planning
      msgLower.includes("green") || msgLower.includes("park") || msgLower.includes("tree") ||
      msgLower.includes("forest") || msgLower.includes("canopy") || msgLower.includes("space") ||
      msgLower.includes("transit") || msgLower.includes("traffic") || msgLower.includes("bus") ||
      msgLower.includes("metro") || msgLower.includes("rail") || msgLower.includes("train") ||
      msgLower.includes("shuttle") || msgLower.includes("commute") || msgLower.includes("frequency") ||
      msgLower.includes("interval") || msgLower.includes("congest") || msgLower.includes("delay") ||
      msgLower.includes("building") || msgLower.includes("height") || msgLower.includes("ceiling") ||
      msgLower.includes("limit") || msgLower.includes("skyline") || msgLower.includes("skyscraper") ||
      msgLower.includes("architecture") || msgLower.includes("zoning") ||
      msgLower.includes("albedo") || msgLower.includes("coating") || msgLower.includes("reflect") ||
      msgLower.includes("cool asphalt") || msgLower.includes("surfacing") || msgLower.includes("roof") ||
      msgLower.includes("sustainable") || msgLower.includes("sustainability") || msgLower.includes("urban") ||
      msgLower.includes("city") || msgLower.includes("digital twin") || msgLower.includes("simulation") ||
      msgLower.includes("parameter") || msgLower.includes("temp") || msgLower.includes("temperature") ||
      msgLower.includes("weather") || msgLower.includes("forecast") || msgLower.includes("diagnostic") ||
      msgLower.includes("telemetry") ||
      
      // Simulation metrics & outcomes
      msgLower.includes("co2") || msgLower.includes("carbon") || msgLower.includes("reduction") ||
      msgLower.includes("emissions") || msgLower.includes("environment") || msgLower.includes("pollution") ||
      msgLower.includes("roi") || msgLower.includes("cost") || msgLower.includes("money") ||
      msgLower.includes("financial") || msgLower.includes("budget") || msgLower.includes("investment") ||
      msgLower.includes("payback") || msgLower.includes("return") ||
      msgLower.includes("grid") || msgLower.includes("electricity") || msgLower.includes("power") ||
      msgLower.includes("energy") || msgLower.includes("battery") || msgLower.includes("solar") ||
      msgLower.includes("wind") || msgLower.includes("substation") || msgLower.includes("generator") ||
      msgLower.includes("load") || msgLower.includes("capacity") ||
      
      // Incidents, reports, policies
      msgLower.includes("water") || msgLower.includes("leak") || msgLower.includes("pipe") ||
      msgLower.includes("burst") || msgLower.includes("main") || msgLower.includes("hydro") ||
      msgLower.includes("sewage") || msgLower.includes("drain") || msgLower.includes("flood") ||
      msgLower.includes("runoff") || msgLower.includes("bioswale") ||
      msgLower.includes("alert") || msgLower.includes("incident") || msgLower.includes("report") ||
      msgLower.includes("hub") || msgLower.includes("complaint") || msgLower.includes("pothole") ||
      msgLower.includes("safety") || msgLower.includes("emergency") || msgLower.includes("seismic") ||
      msgLower.includes("advisory") || msgLower.includes("draft") || msgLower.includes("notice") ||
      msgLower.includes("warning") || msgLower.includes("announcement") || msgLower.includes("bulletin") ||
      msgLower.includes("policy") || msgLower.includes("policies") || msgLower.includes("shaving") ||
      msgLower.includes("mandate") || msgLower.includes("arterial") || msgLower.includes("shaping") ||
      
      // Miscellaneous pre-coded topics
      msgLower.includes("pubg") || msgLower.includes("bgmi") || msgLower.includes("ban") ||
      msgLower.includes("quota") || msgLower.includes("429") || msgLower.includes("limit") ||
      msgLower.includes("rate");

    let dynamicReply = "";
    
    if (!isSiteRelated) {
      dynamicReply = `No, I am sorry, but I do not know about this topic. As the Bloomfield central AI Core, I can only answer questions and assist you with topics directly related to this website, its creators, its simulation parameters, and its environmental & civic OS features.

Please ask me a question related to our municipal systems, such as:
* **Creators & Team**: "Who built this website?" or "Who is Dipender/Divyam/Shreya/Prakhar?"
* **Zoning Sliders & Parameters**: "What is our current Green Space Ratio?" or "Explain the public transit frequency limits"
* **Real-time Simulation Outcomes**: "Show me our estimated ROI" or "How is CO2 reduction calculated?"
* **Civic Alerts & Advisories**: "Draft a public advisory for main leakage" or "Tell me about water main burst reports"`;
    } else if (msgLower.includes("water") || msgLower.includes("leak") || msgLower.includes("pipe") || msgLower.includes("burst")) {
      dynamicReply = `### District 4 Water Grid Incident Analysis
In response to your query regarding the water main infrastructure in District 4, here is our localized strategic modeling:

* **Isolation Successful**: Valve isolation controls on Sector 4-B were successfully actuated to stabilize pressure dropages across immediate lines.
* **Crews Dispatched**: Bloomfield Engineering Crew Unit 4 is active on site. Scheduled repair time is estimated at 3 hours.
* **Smart Drainage**: Runoff is being successfully routed into the newly installed District 4 bioswales, mitigating localized street flooding.
* **Advisory Recommendation**: Prepare a low-priority public advisory instructing households in immediate surrounding blocks (Blocks 10-15) to minimize high-flow usage until pressure normalization is complete.`;
    } else if (msgLower.includes("solar") || msgLower.includes("energy") || msgLower.includes("grid") || msgLower.includes("power") || msgLower.includes("wind") || msgLower.includes("electricity") || msgLower.includes("generator")) {
      dynamicReply = `### Renewable Grid & Energy Distribution Analysis
Bloomfield high-density electrical grids are currently operating under the following localized optimization matrices:

* **Solar Highlands Peak**: District 7 Solar Highlands is operating at 94% generating capacity. Excess generation is being successfully directed to central lithium-iron storage cells.
* **EV Hub Routing**: Dynamic power routing to EV Hub B has been initiated to absorb 1.2MW of excess solar leakage during peak midday irradiance.
* **Grid Stability**: Main line stability stands at 98.4%. Adaptive LED mesh networks are configured to dim by 10% in non-critical zones to preserve emergency margins.
* **Strategic Recommendation**: Keep the current albedo coating optimization enabled to reduce HVAC thermal stress across commercial flat-roof sectors.`;
    } else if (msgLower.includes("notice") || msgLower.includes("bulletin") || msgLower.includes("draft") || msgLower.includes("warn") || msgLower.includes("advisory")) {
      dynamicReply = `### Smart Notice Draft Bulletin
Here is a pre-formatted draft public advisory compiled from active civic telemetry:

* **Title**: **CIVIC ADVISORY: Scheduled Utility Maintenance in District 4**
* **Primary Notification**: Scheduled infrastructure restoration is currently underway. Operations are moving in full alignment with municipal speed guidelines.
* **Resident Action Items**:
  1. Conserve water/power in affected areas during the repair window.
  2. Follow local detour signs around emergency vehicles.
  3. Report any secondary pressure drops or grid anomalies via Bloomfield Reporting Hub.
* **Expected Resolution**: Operations are estimated to reach full clearance in 4 hours.`;
    } else {
      dynamicReply = `### Bloomfield OS Central Advisory Report
Based on your administrative query ("${message}"), our local analytical backup engine has compiled the following strategic summary:

* **Telemetry Status**: Primary systems are nominal. Active alerts in District 4 are being managed with high operational priority.
* **Simulation Balance**: Modern zoning metrics indicate that a Green Space Ratio of ${simulationParams?.greenSpaceRatio || 42}% paired with public transit frequencies of every ${simulationParams?.publicTransitFrequency || 5} minutes produces an optimal CO2 offset curve.
* **Strategic Guideline**: Continue monitoring real-time load distribution. Rerouting EV charging station queues is recommended during solar generation dips.`;
    }
    
    res.json({ reply: dynamicReply });
  }
});

// Endpoint: AI-Powered Simulation Engine (Calculates impact dynamically based on sliders)
app.post("/api/gemini/simulate", async (req, res) => {
  try {
    const { greenSpaceRatio, publicTransitFrequency, buildingHeightLimits, optimizeAlbedo } = req.body;

    const ai = getAI();

    const prompt = `Analyze the environmental and urban impact for the following Bloomfield parameters:
- Green Space Ratio: ${greenSpaceRatio}%
- Public Transit Frequency: ${publicTransitFrequency} minutes
- Building Height Limits: ${buildingHeightLimits} meters
- Optimize Albedo Effect: ${optimizeAlbedo ? "Enabled" : "Disabled"}

Generate a highly precise and detailed smart-city impact forecast in JSON format containing:
1. co2Reduction: A percentage string representing estimated CO2 reduction (must be a negative change like "-28.4%").
2. co2Detail: A brief sentence explaining the environmental driver.
3. estimatedRoi: A percentage string representing estimated ROI (e.g., "14.2%").
4. roiPeriod: A timeframe string (e.g., "18mo", "12mo", "24mo").
5. roiDetail: A brief explanation of the financial driver.
6. trafficImpact: A string representing traffic reduction (e.g., "-12 min avg trip" or "-15 min").
7. trafficDetail: A brief explanation of the transit driver.
8. recommendation: A 2-sentence optimization recommendation from the central AI.
9. riskAssessment: A brief threat or risk consideration.
10. gridLoadImpact: Expected grid capacity change (e.g., "82% Capacity").

Make sure values are realistic, mathematically aligned with the parameters (e.g. higher transit frequency reduces traffic transit time, larger green space ratio reduces CO2 and helps albedo, etc.).`;

    const response = await generateContentWithRetry({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            co2Reduction: { type: Type.STRING },
            co2Detail: { type: Type.STRING },
            estimatedRoi: { type: Type.STRING },
            roiPeriod: { type: Type.STRING },
            roiDetail: { type: Type.STRING },
            trafficImpact: { type: Type.STRING },
            trafficDetail: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            riskAssessment: { type: Type.STRING },
            gridLoadImpact: { type: Type.STRING },
          },
          required: [
            "co2Reduction", "co2Detail", "estimatedRoi", "roiPeriod", 
            "roiDetail", "trafficImpact", "trafficDetail", "recommendation",
            "riskAssessment", "gridLoadImpact"
          ],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.log("[Simulation Engine] Shifting to localized forecasting fallback state");
    // Return fallback realistic calculations if API is unavailable or throws
    const { greenSpaceRatio, publicTransitFrequency, buildingHeightLimits, optimizeAlbedo } = req.body;
    
    // Deterministic simulation calculations for robust fallback
    const co2Val = -10 - (greenSpaceRatio * 0.3) - (20 - publicTransitFrequency) * 0.5 - (optimizeAlbedo ? 3.5 : 0);
    const roiVal = 5 + (greenSpaceRatio * 0.1) + (200 - buildingHeightLimits) * 0.04 + (optimizeAlbedo ? 2.1 : 0);
    const trafficMinutes = Math.round(-4 - (20 - publicTransitFrequency) * 0.7);

    res.json({
      co2Reduction: `${co2Val.toFixed(1)}%`,
      co2Detail: "Enhanced urban forestry coupled with frequent zero-emission transit loops substantially curbs atmospheric particulate accumulation.",
      estimatedRoi: `${roiVal.toFixed(1)}%`,
      roiPeriod: "18mo",
      roiDetail: "Long-term heating savings from Albedo optimization offsets higher municipal transit operational costs.",
      trafficImpact: `${trafficMinutes} min`,
      trafficDetail: "Autonomous high-frequency shuttle corridors minimize private transit usage, yielding smoother throughput.",
      recommendation: "Excellent balance of parameters. Increase the Green Space Ratio further to optimize the Albedo insulation benefits in Zone 7.",
      riskAssessment: "Higher capital expenditure for initial fleet procurement of autonomous transit units.",
      gridLoadImpact: "82% Cap."
    });
  }
});

// Endpoint: AI Public Notice Drafter
app.post("/api/gemini/notice", async (req, res) => {
  try {
    const { incidentType, district, impactScope, priority } = req.body;
    if (!incidentType || !district) {
      return res.status(400).json({ error: "incidentType and district are required." });
    }

    const ai = getAI();

    const prompt = `Draft an official public civic notice for the following urban incident:
- Incident: ${incidentType}
- District: ${district}
- Impact Scope: ${impactScope || "Local neighborhood"}
- Priority: ${priority || "Medium"}

Generate a JSON object containing:
1. title: A professional, clear header (e.g. "CIVIC ADVISORY: Water Infrastructure Repair in District 4")
2. lead: A 1-sentence overview.
3. details: A 3-sentence detailed description of the incident, timelines, and affected zones.
4. actionItems: An array of 3 specific instructions for residents (e.g. "Conserve water", "Avoid intersection").
5. estimatedResolution: Time/date frame (e.g., "18:00 UTC").`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lead: { type: Type.STRING },
            details: { type: Type.STRING },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            estimatedResolution: { type: Type.STRING },
          },
          required: ["title", "lead", "details", "actionItems", "estimatedResolution"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (err: any) {
    console.log("[Notice Engine] Shifting to localized notice compiler fallback state");
    const { incidentType, district, impactScope } = req.body;
    res.json({
      title: `CIVIC NOTICE: Scheduled ${incidentType} - ${district}`,
      lead: `Bloomfield utilities division has scheduled maintenance and repairs in your district.`,
      details: `In order to address the reported ${incidentType} in ${district}, municipal engineering crews have been dispatched. Minor service disruptions are expected within a ${impactScope || "2-block radius"}.`,
      actionItems: [
        "Follow local detour signs and slow down around municipal crew vehicles.",
        "Report any secondary pressure drops or grid abnormalities via Reporting Hub.",
        "Keep non-essential power or water usage to a minimum during the repair window."
      ],
      estimatedResolution: "4 Hours From Dispatch"
    });
  }
});

// Integrate Vite Middleware
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server, // Bind Vite's HMR WebSocket handler to our HTTP server
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Bloomfield Full-Stack Server listening at http://localhost:${PORT}`);
  });
}

startServer();
