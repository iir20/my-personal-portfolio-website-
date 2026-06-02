import { useState, useEffect, useRef } from "react";
import { Terminal, Shield, RefreshCw, AlertTriangle, Cpu, CircleCheck } from "lucide-react";
import { LogEntry, SOCStats } from "../types";

interface SOCTerminalProps {
  accentColor: string; // 'green' | 'cyan' | 'purple' | 'amber'
}

export default function SOCTerminal({ accentColor }: SOCTerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<SOCStats>({
    uptime: 0,
    loadAverage: "0.25",
    activeAttacks: 0,
    threatLevel: "STABLE",
    cpuUsage: "12%",
    memUsage: "55%",
    integrityHash: "0x8F9C22B74C3",
    logSample: ""
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isShielding, setIsShielding] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Default cyber security events
  const defaultLogs: string[] = [
    "IDS module initialized on eth0 interface.",
    "BSc Savar College botanical-cyber layer verified.",
    "MD5 cryptographic hashing protocols loaded.",
    "Connection from Node-78 (IP: 103.114.39.26) authenticated via RSA.",
    "Anti-corruption cipher (Dhoraiya De Engine v1) sync completing...",
    "System integrity audit: verified local package hashes against GitHub master.",
    "Blocked brute force attempt on SSH port 22 from sub-net 185.190.140.0/24.",
    "Kernel memory protections verified (OLED_BURN_SAFE kernel patch active)."
  ];

  // Initialize initial log bundle
  useEffect(() => {
    const initialLogs: LogEntry[] = defaultLogs.map((msg, i) => ({
      id: `init-${i}`,
      timestamp: new Date(Date.now() - (10 - i) * 60000).toLocaleTimeString(),
      level: i === 6 ? "WARN" : "INFO",
      node: "RATUL-DECK",
      message: msg
    }));
    setLogs(initialLogs);
  }, []);

  // Poll server for live stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/diagnostics/stats");
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            ...data
          }));

          // Conditionally append new log if server broadcasts one
          if (data.logSample) {
            setLogs((prev) => {
              if (prev.some((l) => l.message === data.logSample)) return prev;
              
              const newLog: LogEntry = {
                id: `live-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                level: data.threatLevel === "ELEVATED" ? "WARN" : "INFO",
                node: "SOC_CORE",
                message: data.logSample
              };
              return [...prev.slice(-15), newLog]; // keep only last 15
            });
          }
        }
      } catch (err) {
        // Safe mock on fail
        setStats((prev) => ({
          ...prev,
          uptime: prev.uptime + 5,
          activeAttacks: Math.floor(Math.random() * 3),
          cpuUsage: Math.floor(Math.random() * 20 + 8) + "%"
        }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Autoscroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isScanning, isShielding]);

  // Command Action 1: Vulnerability Scan simulation
  const runVulnerabilityScan = () => {
    if (isScanning || isShielding) return;
    setIsScanning(true);

    const scanSteps = [
      "Target verified: local_host_node (Arch Cyber Deck)",
      "Checking open ports: 22(SSH) 80(HTTP) 443(HTTPS) 3000(VITE/PROXY)",
      "Analyzing MiniLam OS audio socket protocols for OLED damage triggers",
      "Scanning Dhoraiya De anonymous reports database encryption matrix",
      "Validating Rent Truth BD KYC smart verification signatures...",
      "Penetration audit: checking system vulnerability vectors...",
      "Scan complete. 0 exploitable vectors detected. Uptime persistent."
    ];

    let currentStep = 0;
    // Clear logs partially to show scanning stream
    setLogs((prev) => [
      ...prev,
      {
        id: `scan-start-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: "CRITICAL",
        node: "NMAP_SHELL",
        message: ">>> SYSTEM PENTEST INITIATED: ANALYSIS BOUNDS ACTIVE <<<"
      }
    ]);

    const interval = setInterval(() => {
      if (currentStep < scanSteps.length) {
        setLogs((prev) => [
          ...prev,
          {
            id: `scan-${currentStep}-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: currentStep === 5 ? "SUCCESS" : "INFO",
            node: "NMAP_SHELL",
            message: scanSteps[currentStep]
          }
        ]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 1100);
  };

  // Command Action 2: Hardening Firewall Firewalls simulation
  const reinforceShields = () => {
    if (isScanning || isShielding) return;
    setIsShielding(true);

    const shieldSteps = [
      "Accessing cryptographic routing nodes...",
      "Binding cloud firewalls at coordinates: Savar, Dhaka (latitude: 23.85, longitude: 90.26)",
      "Deploying anti-leak honey-pots to trap anonymous intruders...",
      "Recalculating hash keys honoring MD Lalmia Howlader freedom legacy...",
      "Injecting secure C++ penetration hardening patches...",
      "Firewall quarantine database locked down successfully."
    ];

    let currentStep = 0;
    setLogs((prev) => [
      ...prev,
      {
        id: `shield-start-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: "CRITICAL",
        node: "FW_DOCK",
        message: ">>> SHIELD DEFENSE INITIATED: REINFORCING SYSTEMS <<<"
      }
    ]);

    const interval = setInterval(() => {
      if (currentStep < shieldSteps.length) {
        setLogs((prev) => [
          ...prev,
          {
            id: `shield-${currentStep}-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: "SUCCESS",
            node: "FW_DOCK",
            message: shieldSteps[currentStep]
          }
        ]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsShielding(false);
        setStats((prev) => ({ ...prev, activeAttacks: 0, threatLevel: "STABLE" }));
      }
    }, 1200);
  };

  // Theme support
  const getAccentColorClass = () => {
    switch (accentColor) {
      case "cyan": return { text: "text-cyan-400", border: "border-cyan-500/20", glow: "shadow-[0_0_15px_rgba(6,182,212,0.1)]", bg: "bg-cyan-950/10", tag: "bg-cyan-500/10 text-cyan-300" };
      case "purple": return { text: "text-purple-400", border: "border-purple-500/20", glow: "shadow-[0_0_15px_rgba(168,85,247,0.1)]", bg: "bg-purple-950/10", tag: "bg-purple-500/10 text-purple-300" };
      case "amber": return { text: "text-amber-400", border: "border-amber-500/20", glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]", bg: "bg-amber-950/10", tag: "bg-amber-500/10 text-amber-300" };
      case "green":
      default: return { text: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]", bg: "bg-emerald-950/10", tag: "bg-emerald-500/10 text-emerald-300" };
    }
  };

  const themeClasses = getAccentColorClass();

  return (
    <div className={`p-4 md:p-6 border rounded-md font-mono bg-black/60 backdrop-blur-md relative ${themeClasses.border} ${themeClasses.glow}`} id="soc-cyber-panel">
      {/* Decorative header corners */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${accentColor === 'cyan' ? 'border-cyan-400' : accentColor === 'purple' ? 'border-purple-400' : accentColor === 'amber' ? 'border-amber-400' : 'border-emerald-400'}`} />
      <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${accentColor === 'cyan' ? 'border-cyan-400' : accentColor === 'purple' ? 'border-purple-400' : accentColor === 'amber' ? 'border-amber-400' : 'border-emerald-400'}`} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${accentColor === 'cyan' ? 'border-cyan-400' : accentColor === 'purple' ? 'border-purple-400' : accentColor === 'amber' ? 'border-amber-400' : 'border-emerald-400'}`} />
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${accentColor === 'cyan' ? 'border-cyan-400' : accentColor === 'purple' ? 'border-purple-400' : accentColor === 'amber' ? 'border-amber-400' : 'border-emerald-400'}`} />

      {/* Panel Identification Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-emerald-500/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Shield className={`h-4 w-4 animate-pulse ${themeClasses.text}`} />
          <span className="text-xs md:text-sm tracking-widest font-semibold uppercase text-slate-100">
            SYSTEM INTELLIGENCE SECURITY OPERATION CENTER (SOC)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400/80">
          <span>DECK_HOST: savar-sub-deck</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-[ping_1.5s_infinite]" />
        </div>
      </div>

      {/* Dashboard Diagnostic Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Metric Card 1 */}
        <div className={`p-3 border rounded-sm ${themeClasses.border} ${themeClasses.bg}`}>
          <div className="text-[10px] text-slate-400 tracking-wider">THREAT LEVEL</div>
          <div className={`text-sm md:text-md font-bold mt-1 tracking-widest flex items-center gap-1.5 ${
            stats.threatLevel === "STABLE" ? "text-emerald-400" : "text-rose-400 animate-pulse"
          }`}>
            <AlertTriangle className="h-3 w-3" /> {stats.threatLevel}
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className={`p-3 border rounded-sm ${themeClasses.border} ${themeClasses.bg}`}>
          <div className="text-[10px] text-slate-400 tracking-wider">ACTIVE INTRUSIONS</div>
          <div className="text-sm md:text-md font-bold mt-1 tracking-widest text-slate-100 flex items-center gap-1.5">
            <Cpu className="h-3 w-3 text-cyan-400" /> {stats.activeAttacks} ATTACKVECT
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className={`p-3 border rounded-sm ${themeClasses.border} ${themeClasses.bg}`}>
          <div className="text-[10px] text-slate-400 tracking-wider">CORE MEMORY HEALTH</div>
          <div className="text-sm md:text-md font-bold mt-1 tracking-widest text-slate-100 flex items-center gap-1.5">
            <CircleCheck className="h-3 w-3 text-emerald-400" /> {stats.memUsage} NOMINAL
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className={`p-3 border rounded-sm ${themeClasses.border} ${themeClasses.bg}`}>
          <div className="text-[10px] text-slate-400 tracking-wider">HARDWARE INTEGRITY</div>
          <div className="text-sm md:text-md font-bold mt-1 text-slate-300 font-mono text-[11px] truncate">
            {stats.integrityHash}
          </div>
        </div>
      </div>

      {/* Terminal Output Logs Box */}
      <div className="border border-emerald-500/10 rounded-sm bg-black/80 p-3 h-48 md:h-64 overflow-y-auto mb-4 flex flex-col space-y-2 scrollbar-none" ref={scrollRef}>
        {logs.map((log) => {
          let levelColor = "text-emerald-400/80";
          if (log.level === "WARN") levelColor = "text-rose-400 animate-pulse font-bold";
          if (log.level === "CRITICAL") levelColor = "text-cyan-400 font-extrabold border-y border-dashed border-cyan-400/15 py-1 my-1";
          if (log.level === "SUCCESS") levelColor = "text-emerald-300 font-bold";

          return (
            <div key={log.id} className="text-[10px] flex gap-2 leading-relaxed">
              <span className="text-slate-500/60 font-mono select-none">[{log.timestamp}]</span>
              <span className={`px-1 rounded-[1.5px] ${themeClasses.bg} select-none h-4 inline-flex items-center text-[8px] uppercase border ${themeClasses.border}`}>{log.node}</span>
              <span className={`break-words ${levelColor}`}>{log.message}</span>
            </div>
          );
        })}

        {/* Diagnostic loading feedback */}
        {(isScanning || isShielding) && (
          <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-cyan-400 animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>CONNECTING QUANTUM FIREWALL SYSTEMS, STABILIZING SUB-NET ARCS...</span>
          </div>
        )}
      </div>

      {/* SOC Console Buttons */}
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <button
            onClick={runVulnerabilityScan}
            disabled={isScanning || isShielding}
            className={`cursor-pointer px-3 py-1.5 border border-emerald-500/30 text-[10px] hover:bg-emerald-500/10 text-emerald-400 rounded-sm transition-all flex items-center gap-1.5 disabled:opacity-40 active:scale-95`}
            id="soc-scan-trigger"
          >
            <Terminal className="h-3 w-3" />
            {isScanning ? "PENTESTING LIVE..." : "RUN MALWARE AUDIT"}
          </button>

          <button
            onClick={reinforceShields}
            disabled={isScanning || isShielding}
            className={`cursor-pointer px-3 py-1.5 border border-cyan-500/30 text-[10px] hover:bg-cyan-500/10 text-cyan-400 rounded-sm transition-all flex items-center gap-1.5 disabled:opacity-40 active:scale-95`}
            id="soc-shield-trigger"
          >
            <Shield className="h-3 w-3" />
            {isShielding ? "UPGRADING IP-CHANNELS..." : "REINFORCE FIREWALL"}
          </button>
        </div>

        <div className="text-[9px] text-slate-500 self-center tracking-wider">
          SYSTEM_DECK STATE: {stats.activeAttacks === 0 ? "100% PERSISTENT_VERIFIED" : "MITIGATING_ACTIVE_VECT"}
        </div>
      </div>
    </div>
  );
}
