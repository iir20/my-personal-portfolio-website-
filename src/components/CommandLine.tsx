import { useState, useEffect, useRef } from "react";
import { Search, Navigation, Settings, HelpCircle, Terminal, RefreshCw } from "lucide-react";

interface CommandLineProps {
  onNavigate: (section: string) => void;
  onToggleMatrix: () => void;
  onToggleSound: () => void;
  onChangeAccent: (color: "green" | "cyan" | "purple" | "amber") => void;
  onClose: () => void;
  accentColor: string;
}

export default function CommandLine({
  onNavigate,
  onToggleMatrix,
  onChangeAccent,
  onClose,
  accentColor
}: CommandLineProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Close on click outside or ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const items = [
    { name: "Navigate: Hero Node", type: "nav", desc: "Jump to home digital card", action: () => onNavigate("hero") },
    { name: "Navigate: Dossier File (About)", type: "nav", desc: "View academic BSc stats and family heritage", action: () => onNavigate("about") },
    { name: "Navigate: Security Skill Matrix", type: "nav", desc: "View pentesting and language abilities", action: () => onNavigate("skills") },
    { name: "Navigate: Active Repositories", type: "nav", desc: "Verify MiniLam OS, Dhoraiya De & Rent Truth", action: () => onNavigate("projects") },
    { name: "Navigate: Security SOC Hub", type: "nav", desc: "Run simulated port audit / firewall shields", action: () => onNavigate("soc") },
    { name: "Navigate: Encrypted Comm Deck", type: "nav", desc: "Transmit secure message packets to Ratul", action: () => onNavigate("contact") },
    { name: "Matrix Rain: Toggle Codefall", type: "cmd", desc: "Activate HTML5 canvas matrix rain backdrop", action: () => { onToggleMatrix(); onClose(); } },
    { name: "Accent: Shift Cyberspace Green", type: "color", desc: "Matrix standard #00FF66 themes", action: () => { onChangeAccent("green"); onClose(); } },
    { name: "Accent: Shift Electric Cyan", type: "color", desc: "Modern cyber #00F0FF look", action: () => { onChangeAccent("cyan"); onClose(); } },
    { name: "Accent: Shift Neon Purple", type: "color", desc: "Vibrant synthwave #BD00FF accents", action: () => { onChangeAccent("purple"); onClose(); } },
    { name: "Accent: Shift Industrial Amber", type: "color", desc: "Retro terminal warning orange themes", action: () => { onChangeAccent("amber"); onClose(); } },
    { name: "Heritage Dossier: Md Lalmia Howlader", type: "egg", desc: "Print 1971 Liberation War heroic archives", action: () => { alert("Dossier unlocked: md Lalmia Howlader, grandchild of 1971 freedom fighter md Lalmia Howlader from Khulna. A legacy of bravery."); onClose(); } }
  ];

  // Filter items matching query
  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase())
  );

  const getAccentStyles = () => {
    switch (accentColor) {
      case "cyan": return "border-cyan-500/25 text-cyan-400 focus-within:ring-cyan-500/20";
      case "purple": return "border-purple-500/25 text-purple-400 focus-within:ring-purple-500/20";
      case "amber": return "border-amber-500/25 text-amber-400 focus-within:ring-amber-500/20";
      case "green":
      default: return "border-emerald-500/25 text-emerald-400 focus-within:ring-emerald-500/20";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-[60] flex items-start justify-center p-4 md:p-24 backdrop-blur-md font-mono select-none">
      {/* Backdrop Close layer */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Main Terminal Frame */}
      <div className={`w-full max-w-lg bg-[#040408]/95 border rounded-sm overflow-hidden shadow-2xl relative z-10 p-4 ${getAccentStyles()}`}>
        
        {/* Dynamic Scan decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />

        {/* Search header container */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
          <Search className="h-4 w-4 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type terminal command/shortcut (e.g. rain, cyan, bsc, legacy...)"
            className="flex-1 bg-transparent text-slate-100 text-xs font-mono outline-hidden border-hidden placeholder-slate-400/50"
            id="cmd-palette-search"
          />
          <span className="text-[9px] text-slate-400 border border-slate-700/60 font-semibold px-1.5 py-0.5 rounded-sm select-none">
            ESC
          </span>
        </div>

        {/* Results Stream dropdown */}
        <div className="max-h-72 overflow-y-auto scrollbar-none mt-3 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const selectIcon = () => {
                if (item.type === "nav") return <Navigation className="h-3 w-3 opacity-60" />;
                if (item.type === "color" || item.type === "cmd") return <Settings className="h-3 w-3 opacity-60" />;
                return <Terminal className="h-3.5 w-3.5 opacity-60" />;
              };

              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full text-left p-2 hover:bg-white/5 rounded-sm flex items-center justify-between gap-4 cursor-pointer text-xs font-mono font-medium transition-all group"
                  id={`cmd-item-${idx}`}
                >
                  <div className="flex items-center gap-2.5">
                    {selectIcon()}
                    <div>
                      <div className="text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400/40 uppercase group-hover:text-slate-100 select-none font-mono">
                    EXECUTE &gt;
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <HelpCircle className="h-5 w-5 opacity-40 text-rose-400 animate-bounce" />
              <span>No crypt commands matching "{search}". Clear search matrix.</span>
            </div>
          )}
        </div>

        {/* Dynamic accent footer indicators */}
        <div className="border-t border-white/5 pt-3.5 mt-3 flex justify-between items-center text-[9px] text-slate-400">
          <span>{filtered.length} SECTOR NODES LOADED</span>
          <span>SELECT DIRECTLY ON HANDHELD CONTAINER</span>
        </div>
      </div>
    </div>
  );
}
