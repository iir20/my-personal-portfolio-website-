import { useState, useEffect, useRef, FormEvent } from "react";
import { 
  Terminal, ShieldAlert, Cpu, Award, Zap, Github, Facebook, Instagram, 
  Send, ExternalLink, Command, Sparkles, Code, Globe, Layers, BookOpen, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Components
import BootUpSequence from "./components/BootUpSequence";
import MatrixRain from "./components/MatrixRain";
import AudioSynthesizer from "./components/AudioSynthesizer";
import RadarScanner from "./components/RadarScanner";
import SOCTerminal from "./components/SOCTerminal";
import ChatAssistant from "./components/ChatAssistant";
import CommandLine from "./components/CommandLine";
import NothingPlayer from "./components/NothingPlayer";
import AdminPanel from "./components/AdminPanel";

// Firebase integration handlers
import { db } from "./lib/firebase";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";


// Types
import { Project, Skill, LogEntry } from "./types";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [accentColor, setAccentColor] = useState<"green" | "cyan" | "purple" | "amber">("green");
  const [matrixActive, setMatrixActive] = useState(true);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Admin and CMS state configurations
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [dynamicConfig, setDynamicConfig] = useState<any>(null);
  const [dynamicProjects, setDynamicProjects] = useState<any[]>([]);
  const [dynamicSkills, setDynamicSkills] = useState<any[]>([]);
  const [dynamicCV, setDynamicCV] = useState<any>(null);

  // Real-time Firestore synchronizer on app boots
  useEffect(() => {
    if (!booted) return;

    const loadDynamicData = async () => {
      try {
        const configDoc = await getDoc(doc(db, "portfolio", "config"));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setDynamicConfig(data);
          if (data.themeColor) {
            setAccentColor(data.themeColor);
          }
        }

        const projectsSnap = await getDocs(collection(db, "projects"));
        if (!projectsSnap.empty) {
          setDynamicProjects(projectsSnap.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() })));
        }

        const skillsSnap = await getDocs(collection(db, "skills"));
        if (!skillsSnap.empty) {
          setDynamicSkills(skillsSnap.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() })));
        }

        // Fetch dynamic CV config document if it exists
        const cvDoc = await getDoc(doc(db, "portfolio", "cv"));
        if (cvDoc.exists()) {
          setDynamicCV(cvDoc.data());
        }

        // Increment and save Page Visit telemetry hit inside Firestore
        await addDoc(collection(db, "analytics"), {
          timestamp: new Date().toISOString(),
          page: "index",
          visitorIp: "103.114.39.26",
          userAgent: navigator.userAgent
        });
      } catch (err) {
        console.warn("Firestore not bootstrapped yet or is offline. Using default configuration indices.");
      }
    };

    loadDynamicData();
  }, [booted]);

  // Hero ticker typing loop
  const roles = [
    "CYBER SECURITY SPECIALIST",
    "CREATIVE DEVELOPER",
    "FUTURISTIC SYSTEM ARCHITECT",
    "LINUX POWER USER"
  ];
  const [roleText, setRoleText] = useState("");
  const [roleIdx, setRoleIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // GitHub Stats
  const [ghStats, setGhStats] = useState({
    followers: 12,
    repos: 18,
    stars: 42,
    avatar: "https://avatars.githubusercontent.com/u/100412845?v=4"
  });

  // Project Interactive States
  const [corruptionTarget, setCorruptionTarget] = useState("");
  const [isAnalyzingCorruption, setIsAnalyzingCorruption] = useState(false);
  const [corruptionReport, setCorruptionReport] = useState<string | null>(null);

  const [rentAddress, setRentAddress] = useState("");
  const [isAuditingRent, setIsAuditingRent] = useState(false);
  const [rentReport, setRentReport] = useState<any | null>(null);

  // Contact Form State
  const [codename, setCodename] = useState("");
  const [secureEmail, setSecureEmail] = useState("");
  const [commsChannel, setCommsChannel] = useState("SECURE_SSH");
  const [transmissionPayload, setTransmissionPayload] = useState("");
  const [txStatus, setTxStatus] = useState<"IDLE" | "ROUTING" | "ENCRYPTING" | "TRANSMID" | "ERR">("IDLE");
  const [txLogs, setTxLogs] = useState<string[]>([]);
  const [packetSignature, setPacketSignature] = useState("");

  // Refs for scroll jumping
  const heroRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const skillsRef = useRef<HTMLElement | null>(null);
  const projectsRef = useRef<HTMLElement | null>(null);
  const socRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);

  // Typing effect ticking
  useEffect(() => {
    if (!booted) return;

    let timer: any;
    const currentFullText = roles[roleIdx];
    const typingSpeed = isDeleting ? 30 : 70;

    if (!isDeleting && roleText === currentFullText) {
      // pause on full string before delete
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && roleText === "") {
      setIsDeleting(false);
      setRoleIdx((prev) => (prev + 1) % roles.length);
    } else {
      timer = setTimeout(() => {
        setRoleText((prev) =>
          isDeleting
            ? currentFullText.substring(0, prev.length - 1)
            : currentFullText.substring(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [roleText, isDeleting, roleIdx, booted]);

  // Fetch true statistics from the proxy
  useEffect(() => {
    if (!booted) return;

    const getGHStats = async () => {
      try {
        const res = await fetch("/api/github/stats");
        if (res.ok) {
          const data = await res.json();
          setGhStats({
            followers: data.profile?.followers || 12,
            repos: data.profile?.public_repos || 18,
            stars: data.starsCount || 42,
            avatar: data.profile?.avatar_url || "https://avatars.githubusercontent.com/u/100412845?v=4"
          });
        }
      } catch (err) {
        // safe bypass defaults loaded
      }
    };

    getGHStats();

    // Setup global binding for Cmd/Ctrl+K palette trigger
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [booted]);

  // Handle section clicking scroll jump
  const scrollTo = (sectionId: string) => {
    setActiveSection(sectionId);
    let targetRef;
    if (sectionId === "hero") targetRef = heroRef;
    if (sectionId === "about") targetRef = aboutRef;
    if (sectionId === "skills") targetRef = skillsRef;
    if (sectionId === "projects") targetRef = projectsRef;
    if (sectionId === "soc") targetRef = socRef;
    if (sectionId === "contact") targetRef = contactRef;

    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Accent mapping helpers
  const getAccentStyles = () => {
    switch (accentColor) {
      case "cyan":
        return {
          glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
          border: "border-cyan-500/25",
          text: "text-cyan-400RGB",
          rawText: "text-cyan-400",
          bg: "bg-cyan-500",
          gLine: "from-cyan-500/20 to-transparent",
          chip: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
        };
      case "purple":
        return {
          glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
          border: "border-purple-500/25",
          text: "text-purple-400RGB",
          rawText: "text-purple-400",
          bg: "bg-purple-500",
          gLine: "from-purple-500/20 to-transparent",
          chip: "bg-purple-500/10 border-purple-500/20 text-purple-300"
        };
      case "amber":
        return {
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
          border: "border-amber-500/25",
          text: "text-amber-400RGB",
          rawText: "text-amber-400",
          bg: "bg-amber-500",
          gLine: "from-amber-500/20 to-transparent",
          chip: "bg-amber-500/10 border-amber-500/20 text-amber-300"
        };
      case "green":
      default:
        return {
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
          border: "border-emerald-500/25",
          text: "text-emerald-400RGB",
          rawText: "text-emerald-400",
          bg: "bg-emerald-500",
          gLine: "from-emerald-500/20 to-transparent",
          chip: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
        };
    }
  };

  const styleSet = getAccentStyles();

  // Dhoraiya De Interactive Anti-Corruption Tracer simulation
  const handleTraceCorruption = () => {
    if (!corruptionTarget.trim() || isAnalyzingCorruption) return;
    setIsAnalyzingCorruption(true);
    setCorruptionReport(null);

    setTimeout(() => {
      const riskScore = Math.floor(Math.random() * 65) + 30; // high score for corruption trace
      setCorruptionReport(`[ANONYMOUS_REPORT_FILED]
Target Agent/Sector: "${corruptionTarget.substring(0, 45)}"
Anonymity Level: RSA-4096 Shield (Verified)
Civic Threat Risk Evaluator: ${riskScore}% Corruption Likelihood.
Telemetry Signature: Crypt-packet submitted to citizen audits registry database node. Moderation triggers engaged.`);
      setIsAnalyzingCorruption(false);
    }, 1200);
  };

  // Rent Truth BD Interactive Scam Auditor simulation
  const handleAuditRent = () => {
    if (!rentAddress.trim() || isAuditingRent) return;
    setIsAuditingRent(true);
    setRentReport(null);

    setTimeout(() => {
      const scamProbability = Math.floor(Math.random() * 15); // usually safe base
      setRentReport({
        score: scamProbability,
        status: scamProbability > 10 ? "SUSPICIOUS" : "VALIDATED",
        registry: "BD Housing Security Node #44",
        details: "AI verified title registry coordinates against landmark geolocation data."
      });
      setIsAuditingRent(false);
    }, 1400);
  };

  // Secure Transmission payload transmitter
  const transmitMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!codename || !secureEmail || !transmissionPayload || txStatus !== "IDLE") return;

    setTxStatus("ROUTING");
    setTxLogs(["[ROUTING] Binding secure IP routes to Savar server quantum deck...", "[ROUTING] Connected to port 3000 handshake responder... OK"]);

    setTimeout(() => {
      setTxStatus("ENCRYPTING");
      setTxLogs((prev) => [...prev, "[ENCRYPT] Encrypting packet body via RSA-4096...", `[ENCRYPT] MD5 matching freedom legacy Md Lalmia Howlader coordinate hash...`]);

      setTimeout(async () => {
        try {
          const res = await fetch("/api/contact/transmit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender: codename,
              email: secureEmail,
              frequency: commsChannel,
              message: transmissionPayload
            })
          });

          if (res.ok) {
            const data = await res.json();
            setTxStatus("TRANSMID");
            setPacketSignature(data.packetSignature);
            setTxLogs((prev) => [...prev, `[SUCCESS] Secure packet delivered successfully! Signature Code: ${data.packetSignature}`]);
            
            // Post package direct to Firestore contacts collection matching schema rules
            try {
              await addDoc(collection(db, "contacts"), {
                sender: codename || "ANONYMOUS_SENDER",
                email: secureEmail || "no_email@safemail.net",
                frequency: commsChannel || "SECURE_SSH",
                message: transmissionPayload,
                timestamp: new Date().toISOString()
              });
              setTxLogs((prev) => [...prev, "[SUCCESS] Secure message mapped to live cloud database catalog. Handshake complete."]);
            } catch (fireErr: any) {
              console.warn("Local sandbox cached message instead of live write:", fireErr);
            }
          } else {
            throw new Error();
          }
        } catch (err) {
          setTxStatus("ERR");
          setTxLogs((prev) => [...prev, "[FATAL_SEC] Handshake failed. Container fallback active."]);
        }
      }, 1200);
    }, 1000);
  };

  if (!booted) {
    return <BootUpSequence onBootComplete={() => setBooted(true)} />;
  }

  if (isAdminMode) {
    return (
      <div className="relative min-h-screen bg-[#020204] text-[#ecefed] selection:bg-white/10 overflow-x-hidden font-sans p-4 md:p-8">
        <header className="mb-6 border-b border-white/5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <span className={`text-[10px] font-mono font-bold ${styleSet.rawText}`}>Ω</span>
            <span className="text-xs font-mono font-bold tracking-widest text-[#f3f4f6]">IIR_SYS.DECK_ADMIN_CENTER</span>
          </div>
          <button
            onClick={() => setIsAdminMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-mono text-zinc-400 border border-zinc-700/50 bg-zinc-800/20 hover:text-white hover:bg-zinc-700/20 transition-all cursor-pointer rounded-sm"
          >
            &lt; Return to Deck
          </button>
        </header>
        <AdminPanel accentColor={accentColor} onBackToApp={() => setIsAdminMode(false)} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020204] text-slate-100 selection:bg-white/10 overflow-x-hidden font-sans">
      {/* 1. Matrix Background fall */}
      <MatrixRain isActive={matrixActive} accentColor={accentColor} />

      {/* Modern scanline flicker */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20 z-40" />

      {/* Floating System Bar & Ambient Dock Controls */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/60 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative h-6 w-6 flex items-center justify-center rounded-sm bg-white/5 border border-white/10 select-none">
            <span className={`text-[10px] font-mono font-bold ${styleSet.rawText}`}>Ω</span>
            <div className="absolute inset-0 rounded-sm border border-emerald-500/10 animate-ping opacity-30" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#f3f4f6]">
              IIR_SYS.DECK
            </span>
            <span className="hidden sm:inline-block ml-2 text-[9px] font-mono text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded-[1.5px] select-none bg-black/40">
              U_STABLE
            </span>
          </div>
        </div>

        {/* Central command shortcut and top ambient sound switch */}
        <div className="flex items-center gap-2">
          {/* Audio synthezier toggle */}
          <AudioSynthesizer accentColor={accentColor} />

          {/* Secure lock trigger button for hidden Admin controls */}
          <button
            onClick={() => setIsAdminMode(true)}
            className="flex items-center gap-1.5 px-2.0 md:px-2.5 py-1 text-[11px] font-mono text-red-400 border border-red-500/10 bg-red-500/5 rounded-sm hover:bg-red-500/10 hover:border-red-500/35 transition-all cursor-pointer"
            title="Open Hidden Admin operating center"
            id="admin-lock-btn"
          >
            <ShieldAlert className="h-3.5 w-3.5 animate-pulse" />
            <span className="hidden sm:inline">ADMIN DECK</span>
          </button>

          {/* Shortcut indicator */}
          <button 
            onClick={() => setIsCommandOpen(true)}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono text-slate-400 border border-white/5 bg-white/5 rounded-sm hover:border-slate-400/40 transition-all cursor-pointer hover:bg-white/10"
            id="global-palette-trigger"
          >
            <Command className="h-3 w-3" />
            <span>PRESS CMD+K</span>
          </button>
        </div>
      </header>

      {/* Dynamic Navigation Column (Nothing Phone Inspired Deck layout) */}
      <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/75 backdrop-blur-xl border border-white/5 px-2 py-1.5 rounded-full shadow-2xl flex items-center gap-0.5 select-none md:gap-1.5" id="haptic-floating-dock">
        {[
          { id: "hero", label: "NODE" },
          { id: "about", label: "DOSSIER" },
          { id: "skills", label: "SKILLS" },
          { id: "projects", label: "REPOS" },
          { id: "soc", label: "SOC_SEC" },
          { id: "contact", label: "COMM" }
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollTo(sec.id)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase transition-all duration-300 cursor-pointer ${
              activeSection === sec.id
                ? "bg-white text-black font-semibold shadow-md scale-105"
                : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
            }`}
            id={`dock-nav-${sec.id}`}
          >
            {sec.label}
          </button>
        ))}
        <div className="h-4 w-[1px] bg-white/10 mx-1 sm:block hidden" />
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`hidden sm:flex p-1.5 rounded-full border cursor-pointer hover:bg-white hover:text-black transition-all ${
            isChatOpen ? "bg-white text-black border-white" : "text-white bg-transparent border-white/10"
          }`}
          title="Toggle AI Companion Assistant"
          id="dock-chat-toggle"
        >
          <Sparkles className="h-3 w-3 animate-pulse" />
        </button>
      </aside>

      {/* CORE PORTFOLIO CONTAINER GRID */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-24 md:space-y-36 pb-32">
        
        {/* ======================================= */}
        {/* 1. HERO SECTION                         */}
        {/* ======================================= */}
        <section ref={heroRef} id="section-hero" className="min-h-[75vh] flex flex-col justify-center items-center relative text-center">
          
          {/* Accent Color quick presets floating widget */}
          <div className="absolute top-0 right-0 p-1 bg-[#101015]/40 border border-white/5 rounded-sm flex items-center gap-2 text-[9px] font-mono select-none">
            <span className="text-slate-400 pl-1.5">DECK COLOR:</span>
            <div className="flex gap-1.5 pr-1.5">
              {(["green", "cyan", "purple", "amber"] as const).map((col) => (
                <button
                  key={col}
                  onClick={() => setAccentColor(col)}
                  className={`h-3.0 w-3.0 rounded-full border transition-all cursor-pointer ${
                    col === "green" ? "bg-emerald-500" : col === "cyan" ? "bg-cyan-500" : col === "purple" ? "bg-purple-500" : "bg-amber-500"
                  } ${accentColor === col ? "border-white scale-120 shadow-md" : "border-transparent hover:scale-110"}`}
                  title={`Shade: ${col}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6 max-w-4xl flex flex-col items-center">
            {/* Pulsing Hologram Logo compass */}
            <div className="relative mb-4 flex items-center justify-center select-none cursor-default" id="holo-hologram-avatar">
              <svg className="w-28 h-28 opacity-75" viewBox="0 0 100 100">
                {/* Outermost dotted dial */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,3" className="text-slate-600 animate-[spin_60s_linear_infinite]" />
                {/* Secondary compass indicators */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="80,10,32,12" className={`${styleSet.rawText} animate-[spin_35s_linear_infinite]`} style={{ animationDirection: "reverse" }} />
                {/* Central organic node */}
                <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-700 animate-pulse" />
                <path d="M 50 12 L 50 20 M 50 80 L 50 88 M 12 50 L 20 50 M 80 50 L 88 50" stroke="currentColor" strokeWidth="0.75" className="text-slate-500" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${styleSet.rawText}`} />
                <circle cx="50" cy="50" r="4" fill="currentColor" className="text-white select-none animate-ping" />
              </svg>
              {/* Floating stats tag */}
              <div className="absolute -bottom-2 px-2 py-0.5 border border-white/10 rounded-[1.5px] text-[8px] tracking-widest font-mono bg-[#0c0c10] text-[#a1a1aa]">
                SECURE_ID: IIR20
              </div>
            </div>

            {/* Custom display heading layout */}
            <div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase mb-2">
                HOLOGRAPHIC DIGITAL DATABASE NODE
              </div>
              <h1 className="text-4xl md:text-6xl font-sans font-extrabold tracking-tight text-white uppercase select-none">
                {dynamicConfig?.heroName || "Ismail Ibne Ratul"}
              </h1>
            </div>

            {/* Sub-role slider typing overlay */}
            <div className="h-6 md:h-8 flex items-center justify-center">
              <span className={`text-sm md:text-md font-mono font-bold tracking-widest ${styleSet.rawText}`}>
                {dynamicConfig?.heroTitle || roleText}
                <span className="animate-[pulse_1s_infinite] ml-1">_</span>
              </span>
            </div>

            {/* Short authentic biography intro */}
            <p className="text-xs md:text-sm text-slate-400 font-mono leading-relaxed max-w-2xl">
              {dynamicConfig?.heroBio || "A passionate Bangladeshi tech enthusiast exploring penetration testing, Linux configuration scripts, machine learning neural models, adaptive user-integ layouts, and modern full-stack infrastructures from Savar, Dhaka."}
            </p>

            {/* Direct Social Media Anchors */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 my-4" id="social-node-hub">
              {[
                { label: "GITHUB", icon: <Github className="h-3 w-3" />, url: "https://github.com/iir20" },
                { label: "FACEBOOK", icon: <Facebook className="h-3 w-3" />, url: "https://www.facebook.com/iibnaratul" },
                { label: "INSTAGRAM", icon: <Instagram className="h-3 w-3" />, url: "https://www.instagram.com/iibne_ratul" },
                { label: "TELEGRAM", icon: <Layers className="h-3.5 w-3.5" />, url: "https://t.me/IibneRatul" }
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 border border-white/5 hover:border-slate-200 rounded-sm text-slate-400 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 bg-black/30"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            {/* Interactive Boot Hero CTA widgets */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full justify-center">
              <button
                onClick={() => scrollTo("projects")}
                className={`cursor-pointer px-5 py-3 rounded-sm font-semibold tracking-wider text-xs font-mono select-none uppercase transition-all duration-300 flex items-center justify-center gap-2 ${styleSet.bg} text-black ${styleSet.glow} hover:brightness-110 active:scale-95`}
                id="hero-explore-cta"
              >
                <Code className="h-3.5 w-3.5" strokeWidth={2.5} />
                <span>EXPLORE PROJECTS REGISTER</span>
              </button>

              {dynamicCV ? (
                <a
                  href={dynamicCV.downloadUrl}
                  download={dynamicCV.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer px-5 py-3 rounded-sm border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-emerald-300 bg-emerald-500/5 text-xs font-mono select-none uppercase transition-all flex items-center justify-center gap-2 active:scale-95"
                  id="hero-cv-cta"
                >
                  <Send className="h-3 w-3" />
                  <span>DOWNLOAD ACTIVE CV (v{dynamicCV.version})</span>
                </a>
              ) : (
                <button
                  onClick={() => {
                    const fallbackUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                    const anchor = document.createElement("a");
                    anchor.href = fallbackUrl;
                    anchor.download = "Ismail_Ibne_Ratul_CV.pdf";
                    anchor.target = "_blank";
                    document.body.appendChild(anchor);
                    anchor.click();
                    document.body.removeChild(anchor);
                  }}
                  className="cursor-pointer px-5 py-3 rounded-sm border border-slate-700 hover:border-white text-slate-300 hover:text-white bg-black/40 text-xs font-mono select-none uppercase transition-all flex items-center justify-center gap-2 active:scale-95"
                  id="hero-cv-cta"
                >
                  <Send className="h-3 w-3" />
                  <span>DOWNLOAD SCHEMATIC CV</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ======================================= */}
        {/* 2. ABOUT SECTION / STORY DOSSIER       */}
        {/* ======================================= */}
        <section ref={aboutRef} id="section-about" className="space-y-12">
          {/* Header */}
          <div className="border-b border-white/5 pb-4 flex justify-between items-baseline">
            <h2 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight uppercase">
              [01] SYSTEM_DOSSIER: BIOGRAPHY & LEGACY
            </h2>
            <span className="text-[10px] font-mono text-slate-500">INDEX: CLASSIFIED_IIR</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Story Timeline dossier */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-4 md:p-6 rounded-md bg-black/40 border border-white/5 space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-[#f3f4f6] font-mono text-stroke-neon uppercase">
                  THE EVOLUTIONARY NODE ROUTE
                </h3>
                
                {/* Segment 1 */}
                <div className="border-l-2 border-emerald-500/20 pl-4 space-y-1 py-1">
                  <div className="text-[10px] font-mono text-emerald-400">2010 - 2020: INITIAL LAUNCH</div>
                  <h4 className="text-xs font-bold text-slate-200">Early Cybernetic Obsessions</h4>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    Developed a robust fascination with computerized grids, custom custom operating rigs, and open-source networks since early childhood.
                  </p>
                </div>

                {/* Segment 2 */}
                <div className="border-l-2 border-cyan-500/20 pl-4 space-y-1 py-1">
                  <div className="text-[10px] font-mono text-cyan-400">2021: CRITICAL NODE: SSC (GPA 3.33)</div>
                  <h4 className="text-xs font-bold text-slate-200">Hard-Code Launchpad</h4>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    Passing his SSC Exams marked the transition to serious engineering. Began analyzing operational scripts, penetration frameworks, and writing backend algorithms.
                  </p>
                </div>

                {/* Segment 3 */}
                <div className="border-l-2 border-purple-500/20 pl-4 space-y-1 py-1">
                  <div className="text-[10px] font-mono text-purple-400">2022: PROFESSIONAL GRAPHIC GRADIENT</div>
                  <h4 className="text-xs font-bold text-slate-200">3-Month UX Prototyping Module</h4>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    Successfully completed an intensive Professional Graphic Design certification course, establishing a pristine visual layout aesthetic visible in customized Nothing OS widgets.
                  </p>
                </div>

                {/* Segment 4 */}
                <div className="border-l-2 border-amber-500/20 pl-4 space-y-1 py-1">
                  <div className="text-[10px] font-mono text-amber-400">2024 - PRESENT: HSE COMPLETED & Savar college BSc</div>
                  <h4 className="text-xs font-bold text-slate-200">Savar Government College BSc Track</h4>
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                    Passed HSC with GPA 3.67. Now pursuing a Bachelor of Science (BSc) at Savar Govt College, Dhaka, specializing in:
                  </p>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-[1.5px]">BOTANY</span>
                    <span className="text-[9px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-[1.5px]">ZOOLOGY</span>
                    <span className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-[1.5px]">PSYCHOLOGY</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono italic mt-1 leading-relaxed">
                    "Cognitive biological pathways directly translate to organic user experience paradigms and neuro-cybersecurity architectures."
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Honor Legacy Md Lalmia Howlader */}
            <div className="lg:col-span-5 space-y-6">
              {/* Grandfather Honour Card */}
              <div className="p-4 md:p-6 border border-rose-500/20 rounded-md bg-rose-950/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 text-[8px] text-rose-500 font-bold border border-rose-500/10 bg-black/40">
                  HERITAGE_ARCHIVE
                </div>
                
                <h3 className="text-xs font-extrabold tracking-widest text-rose-400 font-mono flex items-center gap-1.5 uppercase mb-3">
                  <Award className="h-3.5 w-3.5 animate-pulse" /> 1971 LIBERATION WAR INHERITANCE
                </h3>
                
                <p className="text-sm font-sans font-extrabold text-slate-200 leading-relaxed uppercase tracking-wide">
                  Md Lalmia Howlader
                </p>
                <p className="text-[10px] font-mono text-rose-400/80 mb-2">
                  VALIANT FREEDOM FIGHTER NODE — KHULNA SECTOR, BANGLADESH
                </p>

                <p className="text-[11px] text-slate-300 font-mono leading-relaxed py-2 border-y border-rose-500/10 mb-2.5">
                  “I am the deeply proud and respectful grandchild of **Md Lalmia Howlader**, a veteran fighter who put his life on the line in 1971 for the sovereign independence of Bangladesh. This lineage drives our technical systems security efforts to preserve national safety and secure the digital borders of our state.”
                </p>

                <div className="text-[9px] font-mono text-slate-500">
                  VERIFIED PROTOCOL CERT: SEC-REV-71-BD
                </div>
              </div>

              {/* Cognitive Science bio box */}
              <div className={`p-4 md:p-6 border rounded-md bg-black/40 space-y-3.5 ${styleSet.border}`}>
                <h3 className="text-xs font-bold font-mono tracking-widest text-[#f3f4f6] uppercase">
                  COGNITIVE INTERSECTION MODULE
                </h3>
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                  Ratul's specific education in **Botany** (cellular organic models), **Zoology** (kinetic state networks), and **Psychology** (human behaviors) merges natural cognitive designs into cybersecurity penetration, helping visualize hacker patterns and deploy human-centric, OLED protective software environments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================= */}
        {/* 3. SKILLS SECTION                         */}
        {/* ======================================= */}
        <section ref={skillsRef} id="section-skills" className="space-y-12">
          {/* Header */}
          <div className="border-b border-white/5 pb-4 flex justify-between items-baseline">
            <h2 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight uppercase">
              [02] SKILL_MATRIX: SECURITY & ARCHITECTURES
            </h2>
            <span className="text-[10px] font-mono text-slate-500">DIAGNOSTIC: ACTIVE_AUDIT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Visual radar widget on left side */}
            <div className="md:col-span-5 space-y-6">
              <div className="p-4 rounded-md border border-white/5 bg-black/40 text-center flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-3 block">
                  NEURAL COMPASS RADAR DIAGNOSTIC
                </span>
                
                {/* Map dynamic Sweep */}
                <RadarScanner accentColor={accentColor} />

                <div className="text-[9px] font-mono text-slate-500 mt-3 text-left w-full space-y-1.5">
                  <p>&gt; Sweeping subnets for rogue activity nodes...</p>
                  <p>&gt; Saving custom Arch Linux kernels profiles... APPROVED</p>
                </div>
              </div>
            </div>

            {/* Glowing active skill list card on right side */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Cyber Penetration Testing", level: 90, cat: "Cyber Security", text: "Vulnerability analysis, firewalls auditing" },
                { name: "Arch Linux / Bash Script", level: 95, cat: "Systems & OS", text: "Kernel optimization, automation pipeline" },
                { name: "Ethical Hacking Routine", level: 88, cat: "Cyber Security", text: "Port analysis, protocol stress testing" },
                { name: "React / TypeScript Stack", level: 84, cat: "Languages", text: "Interactive glassmorphic state components" },
                { name: "Python / Scripting", level: 86, cat: "Languages", text: "Network diagnostics, AI model loaders" },
                { name: "Kotlin / Java Mobile", level: 78, cat: "Languages", text: "MiniLam audio adapters, material systems" },
                { name: "Graphic design / UI UX", level: 85, cat: "Design & UX", text: "Figma schematics, Nothing OS monochromacy" },
                { name: "C++ / Systems Core", level: 75, cat: "Languages", text: "Low-end hardware drivers, memory caches" }
              ].map((skill, index) => {
                const getSkillStyle = () => {
                  if (skill.cat === "Cyber Security") return "border-rose-500/10 text-rose-400 bg-rose-500/5";
                  if (skill.cat === "Systems & OS") return "border-cyan-500/10 text-cyan-400 bg-cyan-500/5";
                  if (skill.cat === "Languages") return "border-emerald-500/10 text-emerald-400 bg-emerald-500/5";
                  return "border-purple-500/10 text-purple-400 bg-purple-500/5";
                };

                return (
                  <div key={index} className={`p-4 border rounded-md bg-black/40 space-y-2.5 transition-all duration-300 hover:border-slate-400/20`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">{skill.name}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-[1.5px] border select-none uppercase tracking-widest leading-none bg-[#0e0e13] border-white/5 text-slate-300">
                        {skill.level}%
                      </span>
                    </div>

                    {/* Progress tracking line */}
                    <div className="w-full h-1 bg-[#101015] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-slate-300`}
                        style={{ width: `${skill.level}%`, opacity: 0.8 }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400/90 font-mono leading-relaxed">{skill.text}</p>
                  </div>
                );
              })}

              {/* Dynamic skills matrix items */}
              {dynamicSkills.map((skill, index) => (
                <div key={`dyn-${index}`} className="p-4 border border-white/5 rounded-md bg-black/40 space-y-2.5 transition-all duration-300 hover:border-slate-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 uppercase tracking-wide">{skill.name}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-[1.5px] border select-none uppercase tracking-widest leading-none bg-[#0e0e13] text-slate-300 ${styleSet.border}`}>
                      {skill.level}%
                    </span>
                  </div>

                  {/* Progress tracking line */}
                  <div className="w-full h-1 bg-[#101015] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${styleSet.bg}`}
                      style={{ width: `${skill.level}%`, opacity: 0.8 }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-400/90 font-mono leading-relaxed">{skill.metrics || "Active configuration management parameter stats."}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================= */}
        {/* 4. PROJECTS SECTION                       */}
        {/* ======================================= */}
        <section ref={projectsRef} id="section-projects" className="space-y-12">
          {/* Header */}
          <div className="border-b border-white/5 pb-4 flex justify-between items-baseline">
            <h2 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight uppercase">
              [03] REPOSITORIES: CORE INFRASTRUCTURES
            </h2>
            <span className="text-[10px] font-mono text-slate-500">INTEGRITY: GITHUB_MASTER</span>
          </div>

          <div className="space-y-12">
            
            {/* PROJECT 1: MINILAM OS AUDIO CLIENT */}
            <div className="p-4 md:p-6 border border-stone-800 rounded-md bg-[#0a0a0f]/45 hover:border-stone-500/20 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-stone-500/10 border border-stone-500/20 text-stone-300 px-2 py-0.5 rounded-[1.5px] uppercase select-none">
                      AUDIO AUDIO ECOSYSTEM
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">2026</span>
                  </div>
                  <h3 className="text-lg font-sans font-extrabold tracking-tight text-white flex items-center gap-2">
                    MiniLam OS
                    <a href="https://github.com/iir20/MINILAM-A-MUSIC-PLAYER-NOTHING-OS-INSPIRED_2026" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white p-1">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </h3>
                </div>

                <div className="flex gap-4 text-[10px] font-mono text-stone-400">
                  <span>LOC: Kotlin / React</span>
                  <span>BURNSHIELD: ENAB</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-stone-400 font-mono leading-relaxed mb-4">
                A futuristic adaptive cyberpunk audio ecosystem inspired by Nothing OS. Employs a Materials You design, OLED burn-in prevention shields, rhythm-reactive particle visualizer algorithms, and modular ExoPlay controllers.
              </p>

              {/* INTEGRATED RETRO ARPEGGIATOR MELODY SYNTH */}
              <NothingPlayer />

              {/* Feature nodes */}
              <div className="flex flex-wrap gap-2 mt-4">
                {["Materials You Engine", "AI Reactive Widgets", "ExoPlayer Node", "Kotlin + React", "OLED Burn Protection"].map((f) => (
                  <span key={f} className="text-[9px] font-mono border border-stone-800 text-stone-400 px-2 py-1 rounded-sm bg-black/30">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* PROJECT 2: DHORAIYA DE ANONYMOUS CIVIC AUDITOR */}
            <div className="p-4 md:p-6 border border-rose-950/20 rounded-md bg-rose-950/2 hover:border-rose-500/20 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-[1.5px] uppercase select-none">
                      INTELLIGENCE WHISTLEBLOWER
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">ACTIVE</span>
                  </div>
                  <h3 className="text-lg font-sans font-extrabold tracking-tight text-white flex items-center gap-2">
                    Dhoraiya De
                    <a href="https://github.com/iir20/dhoriye-day-" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white p-1">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </h3>
                </div>

                <div className="flex gap-4 text-[10px] font-mono text-rose-400">
                  <span>LOC: Python / SQL</span>
                  <span>ANONYMITY: RSA-4096</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-400 font-mono leading-relaxed mb-4">
                An anonymous whistleblower reporting database designed to combat corruption indexes in Bangladesh. Leverages secure encrypted forms, AI submission moderations, and encrypted metadata sanitizers to safeguard citizens.
              </p>

              {/* INTERACTIVE TRACER MINI-DASHBOARD IN CARD */}
              <div className="p-3 border border-rose-500/10 rounded-sm bg-black/45 space-y-3 font-mono">
                <div className="text-[10px] text-rose-400 font-bold tracking-widest uppercase">
                  SIMULATED CIVIC MALWARE & RISK TRACER
                </div>
                
                <div className="flex gap-2">
                  <input
                    value={corruptionTarget}
                    onChange={(e) => setCorruptionTarget(e.target.value)}
                    placeholder="Enter suspect sector/entity (e.g. Dhaka Registry, Land office...)"
                    className="flex-1 bg-black/40 border border-rose-500/15 text-slate-300 text-xs font-mono py-1.5 px-3 rounded-sm outline-hidden focus:border-rose-500/30"
                    id="corruption-tracer-input"
                  />
                  <button
                    onClick={handleTraceCorruption}
                    disabled={isAnalyzingCorruption || !corruptionTarget.trim()}
                    className="cursor-pointer bg-rose-500 hover:bg-rose-400 px-3 py-1.5 text-black font-semibold text-[10px] rounded-sm uppercase tracking-wide select-none transition-all disabled:opacity-40"
                    id="corruption-tracer-submit"
                  >
                    {isAnalyzingCorruption ? "TRACE ACTIVE..." : "TRIGGER AUDIT"}
                  </button>
                </div>

                {corruptionReport && (
                  <div className="p-2.5 border border-dashed border-rose-500/20 text-[9px] text-rose-400 bg-rose-500/5 leading-relaxed break-words whitespace-pre-line">
                    {corruptionReport}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {["AI Content Moderation", "Metadata Sanitization", "RSA Shielder", "Anonymous DB Keys", "Encrypted Submission Dashboard"].map((f) => (
                  <span key={f} className="text-[9px] font-mono border border-rose-950/20 text-rose-400/80 px-2 py-1 rounded-sm bg-black/30">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* PROJECT 3: RENT TRUTH BD SECURITY REGISTRY */}
            <div className="p-4 md:p-6 border border-cyan-950/20 rounded-md bg-cyan-950/2 hover:border-cyan-500/20 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-[1.5px] uppercase select-none">
                      ESCROW SECURE VERIFICATION
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">2026</span>
                  </div>
                  <h3 className="text-lg font-sans font-extrabold tracking-tight text-white flex items-center gap-2">
                    Rent Truth BD
                    <a href="https://github.com/iir20/Rent-Truth-Bd-" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white p-1">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </h3>
                </div>

                <div className="flex gap-4 text-[10px] font-mono text-cyan-400">
                  <span>LOC: TypeScript / DB</span>
                  <span>VERIFICATION: KYC_ID</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-400 font-mono leading-relaxed mb-4">
                A landlord and rental registry verification ecosystem in Bangladesh. Helps users detect and eliminate rental scams, fake flat announcements, and non-validated agents using official land registration maps and secure escrows.
              </p>

              {/* INTERACTIVE AI FLAT SCAM CHECKER */}
              <div className="p-3 border border-cyan-500/10 rounded-sm bg-black/45 space-y-3 font-mono">
                <div className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">
                  SIMULATED LANDLORD & LISTING AUDITOR
                </div>

                <div className="flex gap-2">
                  <input
                    value={rentAddress}
                    onChange={(e) => setRentAddress(e.target.value)}
                    placeholder="Paste flat coordinate details or Landlord ID (e.g. Savar, Dhaka Post #4)"
                    className="flex-1 bg-black/40 border border-cyan-500/15 text-slate-300 text-xs font-mono py-1.5 px-3 rounded-sm outline-hidden focus:border-cyan-500/30"
                    id="rent-auditor-input"
                  />
                  <button
                    onClick={handleAuditRent}
                    disabled={isAuditingRent || !rentAddress.trim()}
                    className="cursor-pointer bg-cyan-400 hover:bg-cyan-300 px-3 py-1.5 text-black font-semibold text-[10px] rounded-sm uppercase tracking-wide select-none transition-all disabled:opacity-40"
                    id="rent-auditor-submit"
                  >
                    {isAuditingRent ? "MAPPING..." : "RUN AI SCAN"}
                  </button>
                </div>

                {rentReport && (
                  <div className="p-2.5 border border-dashed border-cyan-500/20 text-[9px] text-cyan-400 bg-cyan-500/5 leading-relaxed space-y-1">
                    <p className="font-bold">AUDIT REPORT COMPLETED:</p>
                    <p>Verified Source Registry: {rentReport.registry}</p>
                    <p>Scam Likelihood Quotient: {rentReport.score}% (Status: {rentReport.status})</p>
                    <p>Details: {rentReport.details}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {["Landowner KYC Check", "Secure Escrows Integrations", "Figma Design Archetype", "AI Scam Estimator Metrics", "Civic Dashboard Map"].map((f) => (
                  <span key={f} className="text-[9px] font-mono border border-cyan-950/20 text-cyan-400/80 px-2 py-1 rounded-sm bg-black/30">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* DYNAMIC CMS SEEDED PROJECTS */}
            {dynamicProjects.map((p, idx) => (
              <div key={`proj-${idx}`} className="p-4 md:p-6 border border-stone-850 rounded-md bg-[#0a0a0f]/45 hover:border-slate-500/20 transition-all font-mono">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-[1.5px] uppercase select-none ${styleSet.chip}`}>
                        DYNAMIC REPOSITORY NODE
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">{p.year || "2026"}</span>
                    </div>
                    <h3 className="text-lg font-sans font-extrabold tracking-tight text-white flex items-center gap-2 uppercase">
                      {p.title}
                      {p.github && (
                        <a href={p.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white p-1">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </h3>
                  </div>

                  <div className="flex gap-4 text-[10px] font-mono text-stone-400">
                    <span>LIBC: FIREBASE</span>
                    <span>ACTIVE: SEEDED</span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-stone-400 font-mono leading-relaxed mb-4">
                  {p.description}
                </p>

                {p.features && p.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 select-none">
                    {p.features.map((f) => (
                      <span key={f} className="text-[9px] font-mono border border-stone-800 text-stone-400 px-2 py-1 rounded-sm bg-black/30">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </div>
        </section>

        {/* ======================================= */}
        {/* 5. CYBER SECURITY SOC PANEL              */}
        {/* ======================================= */}
        <section ref={socRef} id="section-soc" className="space-y-12">
          {/* Header */}
          <div className="border-b border-white/5 pb-4 flex justify-between items-baseline">
            <h2 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight uppercase">
              [04] CYBER_SECURITY: SOC DIAGNOSTICS & HARDENING
            </h2>
            <span className="text-[10px] font-mono text-slate-500">IDSSTATE: ACTIVE_FILTER</span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <SOCTerminal accentColor={accentColor} />
          </div>
        </section>

        {/* ======================================= */}
        {/* 6. GITHUB METRICS / CONTRIBUTION BOARD  */}
        {/* ======================================= */}
        <section id="section-github" className="space-y-12">
          {/* Header */}
          <div className="border-b border-white/5 pb-4 flex justify-between items-baseline">
            <h2 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight uppercase">
              [05] METRICS: GITHUB ANALYTIC TELEMETRY
            </h2>
            <span className="text-[10px] font-mono text-slate-500">API: EXTERN_ROUTE_OK</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Github Profile info (dynamic / hard fallback) */}
            <div className="p-4 md:p-5 border border-white/5 rounded-md bg-black/40 text-center flex flex-col items-center justify-center space-y-3.5">
              <div className="relative">
                <img
                  src={ghStats.avatar}
                  alt="Ismail Avatar"
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 rounded-full border border-slate-500/20 skeleton bg-slate-900 shadow-md"
                />
                <span className="absolute bottom-0 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border border-[#020204]" />
              </div>

              <div>
                <h4 className="text-xs font-bold font-mono tracking-widest text-[#f3f4f6]">Ismail Ibne Ratul</h4>
                <p className="text-[10px] text-slate-500 font-mono">@iir20</p>
              </div>

              <div className="text-[9px] text-slate-400 font-mono text-center leading-relaxed max-w-[180px]">
                "Cyber Security Specialist • Creative Developer • Linux Lover"
              </div>
            </div>

            {/* Highlighted Stat 1 */}
            <div className="p-4 md:p-5 border border-white/5 rounded-md bg-black/40 flex flex-col justify-between h-28">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">ACTIVE_REPOS</span>
              <span className="text-3xl font-extrabold tracking-tight text-[#f3f4f6] font-sans pr-1 text-stroke-neon uppercase">{ghStats.repos}</span>
              <span className="text-[8px] font-mono text-slate-500">VERIFIED SUBMODULE BLUEPRINTS</span>
            </div>

            {/* Highlighted Stat 2 */}
            <div className="p-4 md:p-5 border border-white/5 rounded-md bg-black/40 flex flex-col justify-between h-28">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">STARS_EARNED</span>
              <span className="text-3xl font-extrabold tracking-tight text-[#f3f4f6] font-sans pr-1 text-stroke-neon uppercase">{ghStats.stars}</span>
              <span className="text-[8px] font-mono text-slate-500">COMMUNITY ACCREDITATION NODES</span>
            </div>

            {/* Highlighted Stat 3 */}
            <div className="p-4 md:p-5 border border-white/5 rounded-md bg-black/40 flex flex-col justify-between h-28">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">FOLLOWER_NODES</span>
              <span className="text-3xl font-extrabold tracking-tight text-[#f3f4f6] font-sans pr-1 text-stroke-neon uppercase">{ghStats.followers}</span>
              <span className="text-[8px] font-mono text-slate-400/80">CONNECTED REPLICANT ENGINES</span>
            </div>
          </div>
          
          {/* Simulated Contribution Grid */}
          <div className="p-4 md:p-5 border border-white/5 rounded-md bg-black/45">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider">ANNUAL_COMMIT_TIMELINE (MATRIX PERSISTENT)</span>
              <span className="text-[9px] font-mono text-emerald-400">STATUS: OVER_ACTIVE</span>
            </div>
            
            {/* Visual calendar grid of squares */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(8px,1fr))] gap-1">
              {Array.from({ length: 180 }).map((_, index) => {
                // mock contributions levels
                const strength = index % 5 === 0 ? "bg-emerald-950/20 border border-emerald-500/10" : index % 7 === 0 ? "bg-emerald-700/60" : index % 3 === 0 ? "bg-emerald-500" : "bg-emerald-990/20";
                return (
                  <div
                    key={index}
                    className={`h-2.5 rounded-[1px] ${strength}`}
                    title={`Commit log cluster #${index}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono mt-3">
              <span>EST_JULY_2025</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                <div className="h-1.5 w-1.5 bg-emerald-950/40 rounded-[1px]" />
                <div className="h-1.5 w-1.5 bg-emerald-900 rounded-[1px]" />
                <div className="h-1.5 w-1.5 bg-emerald-600 rounded-[1px]" />
                <div className="h-1.5 w-1.5 bg-emerald-400 rounded-[1px]" />
                <span>More</span>
              </div>
              <span>EST_JUNE_2026</span>
            </div>
          </div>
        </section>

        {/* ======================================= */}
        {/* 7. CONTACT SECTION / COMM DECK          */}
        {/* ======================================= */}
        <section ref={contactRef} id="section-contact" className="space-y-12">
          {/* Header */}
          <div className="border-b border-white/5 pb-4 flex justify-between items-baseline">
            <h2 className="text-xl md:text-2xl font-sans font-extrabold tracking-tight uppercase">
              [06] COMM_DECK: TRANSMIT SECURE FREQUENCIES
            </h2>
            <span className="text-[10px] font-mono text-slate-500">FREQUENCY: RSA_SECURE_CHANNEL</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left direct packet coordinates */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-4 md:p-6 border border-white/5 rounded-md bg-black/40 space-y-4">
                <h3 className="text-xs font-bold font-mono tracking-widest text-[#f3f4f6] uppercase">
                  MANUAL TERMINAL FREQUENCIES
                </h3>

                <div className="space-y-3 text-xs font-mono">
                  
                  {/* Email */}
                  <div>
                    <span className="text-slate-400/80 block text-[9.5px]">ENCYPT_FREQ:</span>
                    <a href="mailto:im.ismail.ibna.ratul@gmail.com" className={`font-semibold hover:underline ${styleSet.rawText} text-xs break-all`}>
                      im.ismail.ibna.ratul@gmail.com
                    </a>
                  </div>

                  {/* Location */}
                  <div>
                    <span className="text-slate-400/80 block text-[9.5px]">TERRAIN_COORD:</span>
                    <span className="text-slate-200">Savar, Dhaka, Bangladesh</span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="text-slate-400/80 block text-[9.5px]">SECURITY_STATUS:</span>
                    <span className="text-emerald-400 animate-pulse font-semibold uppercase">● Online</span>
                  </div>
                </div>

                {/* Decorative scanning widget */}
                <div className="pt-2 border-t border-white/5 text-[9px] text-slate-500 space-y-1 md:block hidden font-mono">
                  <p>&gt; SECURE FREQUENCY BAND: SSHv2</p>
                  <p>&gt; SHA-256 HANDSHAKE triggers active.</p>
                </div>
              </div>
            </div>

            {/* Right direct packet transmitter form */}
            <div className="lg:col-span-7">
              <form onSubmit={transmitMessage} className={`p-4 md:p-6 border rounded-md bg-black/45 relative space-y-4 ${styleSet.border}`} id="contact-transmission-deck">
                <h3 className="text-xs font-extrabold tracking-widest text-slate-100 font-mono uppercase mb-1">
                  SECURE PAYLOAD TRANSMITTER
                </h3>

                {/* Grid inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sender code */}
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] text-slate-400 tracking-wider">SECURE_CODENAME *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. VISITOR-X"
                      value={codename}
                      onChange={(e) => setCodename(e.target.value)}
                      disabled={txStatus !== "IDLE"}
                      className="w-full bg-[#030306] border border-white/5 text-slate-100 text-xs py-2 px-3 focus:outline-hidden focus:border-slate-400 rounded-sm"
                      id="tx-codename"
                    />
                  </div>

                  {/* Secure frequency */}
                  <div className="space-y-1.5 font-mono">
                    <label className="text-[10px] text-slate-400 tracking-wider">SENDER_FREQUENCY *</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. visitor@hacker.io"
                      value={secureEmail}
                      onChange={(e) => setSecureEmail(e.target.value)}
                      disabled={txStatus !== "IDLE"}
                      className="w-full bg-[#030306] border border-white/5 text-slate-100 text-xs py-2 px-3 focus:outline-hidden focus:border-slate-400 rounded-sm"
                      id="tx-email"
                    />
                  </div>
                </div>

                {/* Routing frequency dropdown */}
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] text-slate-400 tracking-wider">COMM_FREQUENCY_ROUTING</label>
                  <select
                    value={commsChannel}
                    onChange={(e) => setCommsChannel(e.target.value)}
                    disabled={txStatus !== "IDLE"}
                    className="w-full bg-[#030306] border border-white/5 text-slate-100 text-xs py-2 px-3 focus:outline-hidden focus:border-slate-400 rounded-sm cursor-pointer"
                    id="tx-routing-select"
                  >
                    <option value="SECURE_SSH">SECURE_SSH (Port 22 Routing Protocol)</option>
                    <option value="QUANTUM_HTTPS">QUANTUM_HTTPS (Grip Hash Verified)</option>
                    <option value="ANONYMOUS_ROUTER">ANONYMOUS_ROUTER (Deep Node Masking)</option>
                  </select>
                </div>

                {/* Secure payload msg */}
                <div className="space-y-1.5 font-mono">
                  <label className="text-[10px] text-slate-400 tracking-wider">TRANSMISSION_BODY *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type secure message blueprint node..."
                    value={transmissionPayload}
                    onChange={(e) => setTransmissionPayload(e.target.value)}
                    disabled={txStatus !== "IDLE"}
                    className="w-full bg-[#030306] border border-white/5 text-slate-100 text-xs py-2 px-3 focus:outline-hidden focus:border-slate-400 rounded-sm resize-none"
                    id="tx-message"
                  />
                </div>

                {/* Transmitter Logs window */}
                {txLogs.length > 0 && (
                  <div className="border border-white/5 bg-black/60 p-2.5 h-24 overflow-y-auto space-y-1 text-[8.5px] font-mono text-emerald-400">
                    {txLogs.map((log, index) => (
                      <p key={index}>{log}</p>
                    ))}
                  </div>
                )}

                {/* Send action */}
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div className="text-[9px] text-slate-500 font-mono">
                    * Packet body encrypted via RSA-4096 endpoint.
                  </div>

                  <button
                    type="submit"
                    disabled={txStatus !== "IDLE" || !codename || !secureEmail || !transmissionPayload}
                    className="cursor-pointer bg-white text-black hover:bg-slate-300 px-4 py-2 font-bold tracking-widest text-[10px] uppercase rounded-sm select-none transition-all flex items-center gap-1.5 border border-white active:scale-95 disabled:opacity-40"
                    id="tx-transmit-btn"
                  >
                    <Send className="h-3 w-3" />
                    <span>
                      {txStatus === "IDLE" ? "TRANSMIT PACKET" : txStatus === "TRANSMID" ? "SIGNAL_DELIVERED" : "ROUTING SIGNAL..."}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

      </main>

      {/* Floating dock settings overlay (for Matrix toggles, menu shortcut) */}
      <footer className="w-full border-t border-white/5 py-8 bg-[#04040a] px-4 md:px-8 text-center" id="global-system-footer">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
          <div>
            <span>SYSTEM PERSISTENT NODE AT SAVAR, DHAKA, BD</span>
          </div>

          {/* Matrix toggle controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMatrixActive(!matrixActive)}
              className="hover:text-slate-100 text-[10px] cursor-pointer flex items-center gap-1.5 uppercase"
              id="footer-matrix-toggle"
            >
              <span>MATRIX BACKDROP:</span>
              <span className={matrixActive ? "text-emerald-400" : "text-slate-600"}>
                {matrixActive ? "ENABLED" : "DISABLED"}
              </span>
            </button>

            <span className="text-slate-800">|</span>

            <div>
              <span>© {new Date().getFullYear()} ibne ratul clone</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ======================================= */}
      {/* 8. GLOBAL MODALS (COMMAND LINE / CHAT)   */}
      {/* ======================================= */}

      {/* Global Command palette dialog overlay */}
      <AnimatePresence>
        {isCommandOpen && (
          <CommandLine
            onNavigate={(sec) => scrollTo(sec)}
            onToggleMatrix={() => setMatrixActive(!matrixActive)}
            onToggleSound={() => {}} // sound sync handled on header widget directly
            onChangeAccent={(col) => setAccentColor(col)}
            onClose={() => setIsCommandOpen(false)}
            accentColor={accentColor}
          />
        )}
      </AnimatePresence>

      {/* Interactive AI Companion chat bubble modal */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-mono">
        <AnimatePresence>
          {isChatOpen && (
            <div className="w-[340px] max-w-(--size-xs) shadow-2xl filter drop-shadow-2xl">
              <ChatAssistant
                accentColor={accentColor}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Action Toggle bubble */}
        {!isChatOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className={`cursor-pointer h-12 w-12 rounded-full border flex items-center justify-center bg-[#07070c] cursor-pointer shadow-[0_5px_20px_rgba(0,0,0,0.5)] border-white/5 hover:border-slate-300 text-white relative group`}
            id="floating-chat-trigger"
          >
            <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#020204]" />
            
            {/* Tooltip text */}
            <div className="absolute right-14 text-[9px] tracking-widest leading-none bg-black border border-white/5 text-slate-100 font-mono py-1.5 px-2.5 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none uppercase">
              ACTIVATE DIGITAL CORE AI
            </div>
          </motion.button>
        )}
      </div>

    </div>
  );
}
