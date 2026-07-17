import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeType, DesignStyle } from "../types";

interface CinematicIntroProps {
  onComplete: () => void;
  currentTheme: ThemeType;
  currentDesign: DesignStyle;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onComplete,
  currentTheme,
  currentDesign
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [introStep, setIntroStep] = useState(0); // 0: Logo reveal, 1: Municipal Systems, 2: Cyber Grid, 3: Complete
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 1.5x, 2x
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "INITIALIZING NOVACITY OS v4.81...",
    "ESTABLISHING HOST CONNECTION..."
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthetic retro sci-fi sounds using Web Audio API
  const playBeep = (freq: number, type: OscillatorType = "sine", duration = 0.1, vol = 0.05) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(vol, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  // Majestic boot chime synth
  const playBootChime = () => {
    if (!soundEnabled) return;
    playBeep(220, "sawtooth", 0.3, 0.05);
    setTimeout(() => playBeep(330, "triangle", 0.25, 0.04), 100);
    setTimeout(() => playBeep(440, "sine", 0.4, 0.06), 200);
    setTimeout(() => playBeep(659.25, "sine", 0.6, 0.08), 350);
  };

  // Add random funny technical telemetry lines as progress proceeds
  useEffect(() => {
    if (!isPlaying) return;

    const baseLines = [
      "SYNCHRONIZING DISTRICT 1 SOLAR HARVESTERS...",
      "AI ADVISOR CORE: ONLINE & STABILIZED",
      "MUNICIPAL TRANSPORT NETWORKS: SYNCHRONIZED",
      "POTHOLE COGNITIVE TRACKER: DEPLOYED",
      "WATER PRESSURE FLUIDITY GRID: BALANCED",
      "SCANNING GEOSPATIAL MAP SEGMENTS...",
      "SYSTEM RECONCILIATION: PERFECT",
      "READY FOR ADMINISTRATIVE AUTHORITY."
    ];

    const logInterval = setInterval(() => {
      if (progress < 100) {
        const nextLine = baseLines[Math.floor(Math.random() * baseLines.length)];
        setTelemetryLogs(prev => [...prev.slice(-4), nextLine]);
        playBeep(400 + Math.random() * 200, "sine", 0.05, 0.02);
      }
    }, 1200 / speed);

    return () => clearInterval(logInterval);
  }, [progress, isPlaying, speed, soundEnabled]);

  // Main video play progress effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = (0.4 * speed);
        const next = Math.min(100, prev + increment);
        
        // Advance step text based on play percentage
        if (next < 25) setIntroStep(0);
        else if (next < 55) setIntroStep(1);
        else if (next < 85) setIntroStep(2);
        else setIntroStep(3);

        if (next >= 100) {
          setIsPlaying(false);
          playBootChime();
          // Automatically navigate to the dashboard after a short delay to hear the chime
          setTimeout(() => {
            onComplete();
          }, 1200);
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    playBeep(isPlaying ? 200 : 300, "triangle", 0.1, 0.04);
  };

  const handleRestart = () => {
    setProgress(0);
    setIntroStep(0);
    setIsPlaying(true);
    setTelemetryLogs([
      "REBOOTING CINEMATIC SEQUENCE...",
      "RE-ENGAGING GEOSPATIAL GRID LOGO..."
    ]);
    playBootChime();
  };

  // Helper to jump directly to a step
  const handleJumpToStep = (step: number) => {
    setIntroStep(step);
    setIsPlaying(false); // Pause auto-play when user manually overrides
    playBeep(350 + step * 50, "sine", 0.1, 0.04);
    
    // Set appropriate progress target
    if (step === 0) setProgress(12);
    else if (step === 1) setProgress(40);
    else if (step === 2) setProgress(70);
    else setProgress(95);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 overflow-y-auto design-${currentDesign} theme-${currentTheme} bg-slate-950 text-white select-none`}>
      {/* Mesh background and orbital grid decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="mesh-gradient absolute inset-0 opacity-45" />
        <div className="glow-1 absolute" />
        <div className="glow-2 absolute" />
        
        {/* Holographic matrix circles radiating */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/[0.03] rounded-full animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-white/[0.04] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/[0.05] rounded-full pointer-events-none border-dashed animate-spin duration-[60s]" />
      </div>

      {/* Intro layout wrapper */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6 my-auto">
        
        {/* Upper Brand Info Panel */}
        <div className="w-full flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
            <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              NovaCity OS Intro Reel • Live Render Engine
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
              System Boot Sequence
            </span>
          </div>
        </div>

        {/* The Cinematic Player Card Frame */}
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-white/20 glass-card shadow-2xl flex flex-col justify-between p-6">
          
          {/* Top-right real-time video resolution watermarks */}
          <div className="absolute top-4 right-4 flex items-center gap-2 text-[9px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded backdrop-blur">
            <span>21:9 CINEMATIC</span>
            <span className="w-1 h-1 rounded-full bg-indigo-500" />
            <span>HDR 10-BIT</span>
          </div>

          {/* Interactive Laser Scanning Effect */}
          {isPlaying && (
            <div className="absolute left-0 right-0 h-0.5 bg-indigo-400/40 shadow-[0_0_15px_#6366f1] animate-[bounce_3s_infinite] pointer-events-none z-10" />
          )}

          {/* CRT scanline simulation */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.005] to-transparent bg-[length:100%_4px] opacity-75 z-20" />

          {/* Center Cinematic Logo animation */}
          <div className="flex-1 flex flex-col items-center justify-center relative py-6">
            <AnimatePresence mode="wait">
              {introStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Holographic Glowing Crest */}
                  <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping duration-1000" />
                    <div className="absolute inset-2 rounded-full border border-pink-500/40 animate-pulse" />
                    <span className="material-symbols-outlined text-4xl text-indigo-400 animate-spin duration-[15s]">
                      settings_suggest
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-pink-400 to-teal-300 drop-shadow-lg">
                    N O V A C I T Y
                  </h1>
                  <p className="text-xs font-mono tracking-[0.2em] text-slate-400 mt-2">
                    GEOSPATIAL DECISION ROOM v4.8
                  </p>
                </motion.div>
              )}

              {introStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center max-w-md"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <span className="material-symbols-outlined text-emerald-400 text-3xl animate-bounce">
                      energy_savings_leaf
                    </span>
                    <span className="material-symbols-outlined text-cyan-400 text-3xl animate-bounce delay-100">
                      water_drop
                    </span>
                    <span className="material-symbols-outlined text-indigo-400 text-3xl animate-bounce delay-200">
                      electric_car
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white font-sans tracking-tight">
                    INTEGRATED MUNICIPAL FLOWS
                  </h2>
                  <p className="text-xs text-slate-300 mt-2 font-mono leading-relaxed px-4">
                    Optimizing water main pressure nodes, dynamic renewable PV grid reserves, and smart transportation routing under full executive AI oversight.
                  </p>
                </motion.div>
              )}

              {introStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-32 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-400 mb-4 rounded-full animate-pulse" />
                  <h2 className="text-lg md:text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
                    ALIGNING GEO-GRID CHANNELS
                  </h2>
                  <p className="text-[11px] font-mono text-slate-400 tracking-wider uppercase mt-2.5">
                    ESTABLISHING CRYPTO-SECURED EXECUTIVE ACCESS...
                  </p>
                  <div className="flex gap-1.5 justify-center mt-3">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping delay-150" />
                    <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping delay-300" />
                  </div>
                </motion.div>
              )}

              {introStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                    <span className="material-symbols-outlined text-2xl animate-spin duration-1000">sync</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white font-sans tracking-tight">
                    DECRYPTING MUNICIPAL CONTROLS
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    Authenticating executive credentials... Loading dashboard panels now.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lower Cinematic Video Interface: Progress Bar & Real-time Log Ticker */}
          <div className="w-full mt-auto bg-slate-950/80 border border-white/10 rounded-xl p-3.5 backdrop-blur z-30 flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Live Streaming Logs */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
              <div className="font-mono text-[9px] text-slate-400 truncate text-left">
                {telemetryLogs.length > 0 ? (
                  <>
                    <span className="text-indigo-400 font-bold">&gt; </span>
                    {telemetryLogs[telemetryLogs.length - 1]}
                  </>
                ) : (
                  "ESTABLISHING SYSTEM CONNECTION..."
                )}
              </div>
            </div>

            {/* Seamless, Non-clickable Video Progress Bar */}
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                Boot Progress
              </span>
              <div className="w-32 md:w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-400 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-indigo-300 font-bold w-8 text-right">
                {Math.floor(progress)}%
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
