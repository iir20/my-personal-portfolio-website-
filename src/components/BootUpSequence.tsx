import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Cpu, ShieldCheck, Activity } from "lucide-react";

interface BootUpSequenceProps {
  onBootComplete: () => void;
}

export default function BootUpSequence({ onBootComplete }: BootUpSequenceProps) {
  const [progress, setProgress] = useState(0);
  const [bootStage, setBootStage] = useState(0);
  const [displayLogs, setDisplayLogs] = useState<string[]>([]);

  const logs = [
    "[INIT] RATUL-CYBERDECK v4.26 REGISTERED CODENAME: FREEDOM_LEGACY_71",
    "[BOOT] Loading kernel-rt-6.8.9-cyber-security-core-node...",
    "[SEC] Checking cryptographic file integrity hash... [0x99F4A2C] APPROVED",
    "[DB] Accessing Savar Government College academic node... CONNECTED",
    "[COG] Integrating organic matrices: Botany, Zoology & Psychology modules...",
    "[UI] Allocating grid coordinates & Nothing OS glassmorphic visual shaders...",
    "[SYS] Setting environmental variable: USER=ibne_ratul STATE=hyper_active",
    "[FIREWALL] Synchronizing Intrusion Detection Core & firewall triggers...",
    "[ACCESS] Decrypting holographic virtual clone profile...",
    "[READY] Digital Sanctum prepared. Quantum handshake authenticated."
  ];

  // Increment progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Random incremental hops
        const next = prev + Math.floor(Math.random() * 8) + 1;
        return next > 100 ? 100 : next;
      });
    }, 80);

    return () => clearInterval(progressInterval);
  }, []);

  // Sync log stages with progress
  useEffect(() => {
    const stageCount = Math.floor((progress / 100) * logs.length);
    if (stageCount > bootStage && stageCount <= logs.length) {
      const nextLogs: string[] = [];
      for (let i = 0; i < stageCount; i++) {
        nextLogs.push(logs[i]);
      }
      setDisplayLogs(nextLogs);
      setBootStage(stageCount);
    }
  }, [progress, bootStage]);

  return (
    <div className="fixed inset-0 bg-[#020204] z-50 flex flex-col justify-between p-6 md:p-12 font-mono text-[11px] md:text-xs text-emerald-400 select-none overflow-hidden">
      {/* Background Subtle Scanline Shader */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-40" />

      {/* Top Header Panel */}
      <div className="flex justify-between items-center border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 animate-pulse text-emerald-400" id="boot-terminal-icon" />
          <span className="tracking-widest font-semibold uppercase">SECURE PORTAL INTERFACE v4.26</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-500/60 text-[10px]">
          <span>STATION: Savar, Dhaka, BD</span>
          <span>LATENCY: 5ms</span>
        </div>
      </div>

      {/* Core Logs Grid */}
      <div className="flex-1 my-8 max-w-4xl overflow-y-auto scrollbar-none flex flex-col justify-end space-y-2 font-mono">
        <AnimatePresence initial={false}>
          {displayLogs.map((log, index) => {
            const isWarning = log.includes("[SEC_WARN]") || log.includes("[WARNING]");
            const isInit = log.includes("[INIT]");
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex gap-3 leading-relaxed ${
                  isWarning ? "text-rose-400" : isInit ? "text-cyan-400" : "text-emerald-400/90"
                }`}
              >
                <span className="text-emerald-500/40 select-none">[{index.toString().padStart(2, "0")}]</span>
                <span className="break-all">{log}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {progress < 100 && (
          <div className="flex gap-2 text-emerald-300 animate-pulse mt-2">
            <span>&gt;_</span>
            <span className="typing-cursor">COMPUTING DIGITAL MATRIX...</span>
          </div>
        )}
      </div>

      {/* Bottom Utility Deck */}
      <div className="border-t border-emerald-500/20 pt-6 flex flex-col gap-6 md:gap-0 md:flex-row md:items-center md:justify-between">
        {/* Progress Grid */}
        <div className="flex flex-col gap-2 w-full md:max-w-md">
          <div className="flex justify-between items-center text-xs text-cyan-400 font-semibold mb-1">
            <span className="tracking-widest flex items-center gap-1.5 uppercase">
              <Activity className="h-3 w-3 animate-spin" /> QUANTUM LINK BOOTSTRAP
            </span>
            <span>{progress}%</span>
          </div>
          
          {/* Progress Bar with glowing blocks */}
          <div className="w-full h-2 bg-emerald-990/40 border border-emerald-500/20 rounded-sm overflow-hidden p-[1px]">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] rounded-sm"
              style={{ width: `${progress}%` }}
              layout
            />
          </div>
        </div>

        {/* Enter Prompt */}
        <div className="flex items-center justify-end">
          {progress === 100 ? (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBootComplete}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 border border-emerald-300 text-black font-semibold text-xs rounded-sm cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.4)] tracking-widest uppercase flex items-center gap-2 hover:brightness-110 active:brightness-95 transition-all"
              id="boot-btn-enter"
            >
              <ShieldCheck className="h-4 w-4" /> UNLOCK SYS.DECK
            </motion.button>
          ) : (
            <div className="text-[10px] text-emerald-500/40 tracking-wider">
              ESTABLISHING ENCRYPTED SHELL CONNECTION...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
