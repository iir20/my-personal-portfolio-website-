import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, RefreshCw, X, HelpCircle } from "lucide-react";
import { ChatMessage } from "../types";

interface ChatAssistantProps {
  accentColor: string; // 'green' | 'cyan' | 'purple' | 'amber'
  onClose?: () => void;
}

export default function ChatAssistant({ accentColor, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested quick prompts with rich topics
  const suggestPrompts = [
    { label: "🎖️ Freedom Legacy", text: "Tell me about your grandfather, freedom fighter Md Lalmia Howlader." },
    { label: "🎓 Savar college BSc", text: "What are your major BSc coursework modules at Savar college?" },
    { label: "🎵 MiniLam OS music", text: "Give me information on your Nothing OS music player system, MiniLam." },
    { label: "🔐 Cybersecurity skillset", text: "What is your ethical hacking and penetration test expertise?" }
  ];

  // Initialize with a welcome message from Ratul's system echo
  useEffect(() => {
    setMessages([
      {
        id: "wel-1",
        sender: "system",
        content: `[CYBER_CORE_INIT]: Neural link established with Ratul's virtual holographic assistant echo.
"Hello, visitor. I'm a cryptographic digital clone representing Ismail Ibne Ratul— Bangladeshi cybersecurity engineer, customized Linux user, and creative technologist.
Ask me about my penetration audits, Savar Govt. college studies (Botany, Zoology, Psychology), or my grandfather's 1971 war honor!"`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, []);

  // Autoscroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // API payload mirroring proper history
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error("Connection degraded");

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          content: data.text,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err) {
      // Fallback response with beautiful, offline-friendly diagnostics
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-fail-${Date.now()}`,
            sender: "assistant",
            content: `[QUANTUM_LINK_STANDBY]: Live API key node offline. 
I am falling back to local ROM firmware logs.

I am **Ismail Ibne Ratul**, a 21-year-old developer based in Savar, Dhaka. 
I'm studying BSc at **Savar Government College** (subjects: Botany, Zoology, and Psychology). 
My grandfather **Md Lalmia Howlader** was a heroic 1971 Freedom Fighter from Khulna.

My active repositories include:
- **MiniLam OS**: Cinematic Nothing OS music widgets.
- **Dhoraiya De**: Anti-corruption civic reporting board.
- **Rent Truth BD**: Anti-scam tenancy lookup system.

*Configure 'GEMINI_API_KEY' in the Secrets panel on the top right to restore the real-time AI corridor!*`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }, 800);
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeStyles = () => {
    switch (accentColor) {
      case "cyan":
        return {
          btn: "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]",
          border: "border-cyan-500/20",
          text: "text-cyan-400",
          bg: "bg-cyan-950/10",
          ring: "focus:ring-cyan-500/30"
        };
      case "purple":
        return {
          btn: "bg-purple-500 hover:bg-purple-400 text-black shadow-[0_0_15px_rgba(168,85,247,0.3)]",
          border: "border-purple-500/20",
          text: "text-purple-400",
          bg: "bg-purple-950/10",
          ring: "focus:ring-purple-500/30"
        };
      case "amber":
        return {
          btn: "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]",
          border: "border-amber-500/20",
          text: "text-amber-400",
          bg: "bg-amber-950/10",
          ring: "focus:ring-amber-500/30"
        };
      case "green":
      default:
        return {
          btn: "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]",
          border: "border-emerald-500/20",
          text: "text-emerald-400",
          bg: "bg-emerald-950/10",
          ring: "focus:ring-emerald-500/30"
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={`flex flex-col h-[520px] max-h-screen bg-black/85 backdrop-blur-xl border rounded-md shadow-2xl overflow-hidden relative ${styles.border}`} id="ratul-ai-assistant">
      {/* Dynamic Header */}
      <div className={`p-3.5 border-b flex justify-between items-center ${styles.border}`}>
        <div className="flex items-center gap-2">
          <Sparkles className={`h-4 w-4 animate-[spin_5s_linear_infinite] ${styles.text}`} />
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest text-slate-100 uppercase">RATUL-AI CYBER-CORE</h4>
            <p className="text-[9px] font-mono text-slate-400">STATUS: RE-INTERPOLATOR ONLINE</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1 rounded-full transition-all cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Message Output Grid */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 scrollbar-none font-mono">
        {messages.map((m) => {
          const isSystem = m.sender === "system";
          const isUser = m.sender === "user";

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              {/* Sender Tag */}
              <div className="flex items-center gap-1.5 text-[8px] text-slate-400/80 mb-1 px-1 select-none">
                {isUser ? (
                  <>
                    <span>SECURE_VISITOR</span>
                    <User className="h-2 w-2" />
                  </>
                ) : (
                  <>
                    <Sparkles className={`h-2.5 w-2.5 ${styles.text}`} />
                    <span>{isSystem ? "LOG_ENG_DIAGNOSTICS" : "RATUL_CLONE_ECHO"}</span>
                  </>
                )}
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>

              {/* Chat Bubble container */}
              <div
                className={`max-w-[85%] rounded-sm p-3.5 text-xs font-mono leading-relaxed break-words whitespace-pre-line border ${
                  isUser
                    ? `bg-black/60 border-slate-700/50 text-slate-100`
                    : isSystem
                    ? `bg-emerald-950/10 border-emerald-500/10 text-emerald-400 text-[10px]`
                    : `${styles.bg} ${styles.border} text-slate-200`
                }`}
                style={{
                  boxShadow: !isUser && !isSystem ? "inset 0 0 10px rgba(0,250,150,0.02)" : "none"
                }}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex flex-col items-start animate-pulse">
            <div className="text-[8px] text-slate-500 mb-1 px-1">MODEL_THINKING...</div>
            <div className={`p-3 border rounded-sm text-[10px] text-slate-400 bg-black/40 ${styles.border} flex items-center gap-2`}>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>INTERSECTING SAVAR KERNEL RECORDS...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick chips */}
      <div className={`px-3.5 py-2 border-t flex gap-1.5 overflow-x-auto scrollbar-none select-none ${styles.border}`}>
        {suggestPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.text)}
            disabled={isLoading}
            className={`cursor-pointer px-2.5 py-1 text-[9px] border rounded-[1.5px] transition-all whitespace-nowrap active:scale-95 disabled:opacity-40 select-none ${styles.border} ${styles.bg} ${styles.text} hover:bg-slate-300 hover:text-black hover:border-slate-300`}
            id={`suggest-btn-${idx}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form Deck */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className={`p-3 border-t flex gap-2 items-center bg-black/50 ${styles.border}`}
      >
        <span className={`text-[10px] select-none font-extrabold ${styles.text}`}>&gt;_</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Transmit prompt packet..."
          disabled={isLoading}
          className={`flex-1 bg-black/40 border border-slate-800 text-slate-100 rounded-sm py-2 px-3 text-xs font-mono outline-hidden focus:border-slate-500 transition-all ${styles.ring}`}
          id="ai-terminal-input"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`cursor-pointer p-2 rounded-sm transition-all flex items-center justify-center disabled:opacity-40 disabled:hover:scale-100 active:scale-95 ${styles.btn}`}
          id="ai-send-btn"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
