import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AnalyticsViewProps {
  chatHistory: ChatMessage[];
  onSendMessage: (content: string, image?: { data: string; mimeType: string }) => Promise<void>;
  isResponding: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  chatHistory,
  onSendMessage,
  isResponding
}) => {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // States for enhanced features
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat thread on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isResponding]);

  // Clean up any ongoing speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speech-to-Text (Voice Typing) function
  const startVoiceTyping = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      setIsRecording(false);
      if (event.error === "not-allowed") {
        setSpeechError("Microphone permission denied. Please click the microphone lock icon in your browser URL bar to allow microphone access, or ensure permissions are enabled.");
      } else if (event.error === "no-speech") {
        setSpeechError("No speech detected. Please speak clearly into your microphone.");
      } else if (event.error === "network") {
        setSpeechError("Network error. Please check your internet connection.");
      } else {
        setSpeechError(`Speech recognition was interrupted: ${event.error || "Please try again."}`);
      }
      setTimeout(() => setSpeechError(null), 8000);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Text-to-Speech (AI Advisor Read-Aloud) function
  const toggleSpeak = (messageId: string, textContent: string) => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (currentlySpeakingId === messageId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean up markdown markers for cleaner spoken output
    const cleanText = textContent
      .replace(/[\*\#\_\[\]]/g, "")
      .replace(/\-\s/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };
    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    setCurrentlySpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Base64 file reader
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const commaIndex = result.indexOf(",");
      const base64Data = result.substring(commaIndex + 1);
      
      setSelectedImage({
        data: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isResponding) return;

    const messageToSend = inputText.trim() || "Analyze the attached smart city context image and provide operational advice.";
    onSendMessage(messageToSend, selectedImage || undefined);
    setInputText("");
    removeSelectedImage();
  };

  const smartChips = [
    "How can we optimize water grids in District 4?",
    "Model solar potential of District 7.",
    "Draft a public advisory for main leakage.",
    "Draft a civic plan for sustainable transit hubs."
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="h-[calc(100vh-6rem)] flex flex-col text-white"
    >
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">
        
        {/* Left column: AI Core advisor Terminal description (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6 select-none">
          <div className="glass-card border border-white/10 p-6 rounded-2xl shadow-sm flex flex-col h-full justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl font-bold select-none">psychology</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white font-sans text-base">
                    NovaCity AI Advisor
                  </h3>
                  <p className="text-[10px] font-mono font-bold tracking-wider text-pink-400 uppercase">
                    Decision Core v2.4
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Welcome to the urban planning decision-support panel. Supported by generative modeling, this interface lets city operators query data sets, draft community messages, and run impact parameters.
                </p>

                <div className="p-4 rounded-xl bg-indigo-950/40 border border-white/10 text-[11px] leading-relaxed text-slate-300">
                  <p className="font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">spatial_tracking</span>
                    Operational Directives
                  </p>
                  Always cross-validate simulated albedo effects and public notice draft bulletins before resident publication.
                </div>
              </div>
            </div>

            {/* Quick Status items */}
            <div className="space-y-3 pt-6 border-t border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
              <div className="flex justify-between items-center">
                <span>Model Latency</span>
                <span className="text-emerald-400">42ms (Optimal)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>API Connection</span>
                <span className="text-emerald-400">Secured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Chat Console Terminal (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full glass-card border border-white/10 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Chat thread area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <AnimatePresence initial={false}>
              {chatHistory.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3.5 max-w-2xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    {/* Icon/Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 select-none ${
                      isUser 
                        ? "bg-pink-500/10 text-pink-400" 
                        : "bg-indigo-500/10 text-indigo-400"
                    }`}>
                      <span className="material-symbols-outlined text-md font-bold">
                        {isUser ? "account_circle" : "smart_toy"}
                      </span>
                    </div>

                    {/* Chat Bubble container */}
                    <div className={`p-4 rounded-2xl leading-relaxed text-sm shadow-sm ${
                      isUser 
                        ? "bg-pink-500/10 text-slate-200 rounded-tr-none border border-pink-500/20" 
                        : "bg-white/5 text-slate-200 rounded-tl-none border border-white/10"
                    }`}>
                      {/* Uploaded picture display inside chat bubbles */}
                      {msg.image && (
                        <div className="mb-3 max-w-[240px] rounded-lg overflow-hidden border border-white/10 shadow-sm bg-black/20">
                          <img 
                            src={`data:${msg.image.mimeType};base64,${msg.image.data}`} 
                            alt="Uploaded urban context" 
                            className="w-full h-auto object-cover max-h-48"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Simple paragraph splitting or lists formatting support */}
                      <div className="space-y-2">
                        {msg.content.split("\n\n").map((para, pIdx) => {
                          if (para.startsWith("- ") || para.startsWith("* ")) {
                            return (
                              <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1">
                                {para.split("\n").map((li, lIdx) => (
                                  <li key={lIdx}>{li.replace(/^[\s-*-]+/, "")}</li>
                                ))}
                              </ul>
                            );
                          }
                          return <p key={pIdx}>{para}</p>;
                        })}
                      </div>

                      <div className="flex items-center justify-between gap-6 mt-3 pt-2 border-t border-white/5">
                        <p className="text-[9px] font-mono text-slate-500 select-none">
                          {msg.timestamp}
                        </p>
                        
                        {/* Elegant Speak/Stop Read Aloud Option */}
                        <button
                          type="button"
                          onClick={() => toggleSpeak(msg.id, msg.content)}
                          className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer ${
                            currentlySpeakingId === msg.id 
                              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 animate-pulse" 
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {currentlySpeakingId === msg.id ? "volume_off" : "volume_up"}
                          </span>
                          <span>{currentlySpeakingId === msg.id ? "Stop" : "Speak"}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Simulated responding spinner */}
            {isResponding && (
              <div className="flex items-center gap-3 max-w-xl">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-md font-bold animate-spin">autorenew</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/10 text-xs font-semibold text-slate-400 font-mono tracking-wider select-none flex items-center gap-2">
                  NovaCity Advisor core is computing response...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Smart Prompt suggestions row (select-none) */}
          <div className="px-6 py-2 bg-white/5 border-t border-white/10 flex gap-2.5 overflow-x-auto select-none">
            {smartChips.map((chip, idx) => (
              <button
                key={idx}
                disabled={isResponding}
                onClick={() => setInputText(chip)}
                className="whitespace-nowrap bg-indigo-950/40 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:border-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer shadow-sm select-none"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Selected Image Preview Thumbnail */}
          {selectedImage && (
            <div className="px-6 py-2.5 bg-white/5 border-t border-white/10 flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/20 shadow bg-black/20">
                <img 
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                  alt="Attachment preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                </button>
              </div>
              <div className="text-xs text-slate-400">
                <p className="font-bold text-slate-200">Image Attached</p>
                <p className="text-[10px] font-mono">{(selectedImage.data.length * 0.75 / 1024).toFixed(0)} KB • Ready to send</p>
              </div>
            </div>
          )}

          {/* Speech Error Alert Banner */}
          {speechError && (
            <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/20 text-[11px] text-red-400 flex items-center justify-between gap-3 select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-red-400 hover:text-white p-1 rounded hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          )}

          {/* Chat input submit footer */}
          <div className="p-4 bg-white/5 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex gap-2.5 items-center">
              
              {/* Hidden File Input */}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              {/* Upload Pic Action Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isResponding}
                className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white p-3 rounded-xl border border-white/10 cursor-pointer transition-all active:scale-95 flex items-center justify-center relative group"
                title="Upload Photo (Visual Query)"
              >
                <span className="material-symbols-outlined text-md">image</span>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-slate-900 text-slate-200 text-[9px] font-mono px-2 py-1 rounded transition-all whitespace-nowrap shadow border border-white/10 pointer-events-none">
                  Attach Image
                </span>
              </button>

              {/* Speech-to-Text Voice Dictation Button */}
              <button
                type="button"
                onClick={startVoiceTyping}
                disabled={isResponding}
                className={`p-3 rounded-xl border cursor-pointer transition-all active:scale-95 flex items-center justify-center relative group ${
                  isRecording 
                    ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-bold" 
                    : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10"
                }`}
                title={isRecording ? "Listening... Click to stop" : "Voice Dictation"}
              >
                <span className="material-symbols-outlined text-md">
                  {isRecording ? "mic_active" : "mic"}
                </span>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-slate-900 text-slate-200 text-[9px] font-mono px-2 py-1 rounded transition-all whitespace-nowrap shadow border border-white/10 pointer-events-none">
                  {isRecording ? "Stop Dictation" : "Voice Typing"}
                </span>
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isResponding}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/25 outline-none text-white placeholder:text-slate-500"
                placeholder={isRecording ? "Listening closely... Speak now" : "Ask NovaCity AI Advisor..."}
              />
              <button
                type="submit"
                disabled={isResponding || (!inputText.trim() && !selectedImage)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer transition-colors disabled:opacity-50 select-none flex items-center justify-center"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
