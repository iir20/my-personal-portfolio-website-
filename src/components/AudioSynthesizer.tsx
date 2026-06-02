import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Radio } from "lucide-react";

interface AudioSynthesizerProps {
  accentColor: string; // 'green' | 'cyan' | 'purple' | 'amber'
}

export default function AudioSynthesizer({ accentColor }: AudioSynthesizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Nodes refs for safe teardown/gradient fades
  const masterGainRef = useRef<GainNode | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const chimeOscRef = useRef<OscillatorNode | null>(null);
  const timerIdRef = useRef<any>(null);

  const toggleSound = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const startAudio = () => {
    try {
      // Lazy init AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain for smooth fades
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.5); // Warm fade-in
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Lowpass filter to keep the drone warm and prevent piercing highs
      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(150, ctx.currentTime);
      lpFilter.connect(masterGain);

      // Deep Drone (triangle wave for pleasant sub-bass)
      const droneOsc = ctx.createOscillator();
      droneOsc.type = "triangle";
      droneOsc.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 frequency
      droneOsc.connect(lpFilter);
      droneOsc.start();
      droneOscRef.current = droneOsc;

      // Cyber modulated LFO for an outer-space computer hover hum
      const hoverOsc = ctx.createOscillator();
      hoverOsc.type = "sine";
      hoverOsc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
      
      const hoverGain = ctx.createGain();
      hoverGain.gain.setValueAtTime(0.04, ctx.currentTime);
      
      hoverOsc.connect(hoverGain);
      hoverGain.connect(lpFilter);
      hoverOsc.start();

      // Slow resonant filter sweeper (LFO modulating filter frequency)
      const filterLFO = ctx.createOscillator();
      filterLFO.type = "sine";
      filterLFO.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow roll
      
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(45, ctx.currentTime); // sweep bounds
      
      filterLFO.connect(lfoGain);
      lfoGain.connect(lpFilter.frequency);
      filterLFO.start();

      // Generative Digital Sonar ping / heartbeat (simulates security pings)
      const triggerChime = () => {
        if (!ctx || ctx.state === "closed") return;
        
        try {
          const chimeOsc = ctx.createOscillator();
          chimeOsc.type = "sine";
          // Custom pitch based on selected theme
          const pingFreq = accentColor === "purple" ? 523.25 : accentColor === "cyan" ? 587.33 : accentColor === "amber" ? 440.00 : 493.88; // C5, D5, A4, B4
          chimeOsc.frequency.setValueAtTime(pingFreq, ctx.currentTime);

          const chimeGain = ctx.createGain();
          chimeGain.gain.setValueAtTime(0.0, ctx.currentTime);
          chimeGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05); // quick envelope
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5); // long decay decay

          // Low-pass filter for the echo chimes
          const echoFilter = ctx.createBiquadFilter();
          echoFilter.type = "lowpass";
          echoFilter.frequency.setValueAtTime(1200, ctx.currentTime);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(echoFilter);
          echoFilter.connect(masterGain);

          chimeOsc.start();
          chimeOsc.stop(ctx.currentTime + 3);
        } catch (err) {
          // safe bypass
        }
      };

      // Trigger immediately and then on slow interval
      triggerChime();
      const interval = setInterval(triggerChime, 4500);
      timerIdRef.current = interval;

      setIsPlaying(true);
    } catch (e) {
      console.warn("Web Audio API not supported or browser interaction missing.", e);
    }
  };

  const stopAudio = () => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;

    if (ctx && masterGain) {
      try {
        // Fade out gracefully to prevent popping noises
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

        setTimeout(() => {
          if (timerIdRef.current) clearInterval(timerIdRef.current);
          if (droneOscRef.current) droneOscRef.current.stop();
          ctx.close();
          audioCtxRef.current = null;
          setIsPlaying(false);
        }, 320);
      } catch (err) {
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const getThemeText = () => {
    switch (accentColor) {
      case "cyan": return "border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] bg-cyan-950/20";
      case "purple": return "border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)] bg-purple-950/20";
      case "amber": return "border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)] bg-amber-950/20";
      case "green":
      default: return "border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] bg-emerald-950/20";
    }
  };

  return (
    <button
      onClick={toggleSound}
      className={`border rounded-sm px-2.5 py-1 text-[11px] font-mono tracking-wider transition-all duration-300 hover:brightness-110 active:scale-95 flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${getThemeText()}`}
      title="Toggle atmospheric audio feed"
      id="synth-feed-toggle"
    >
      {isPlaying ? (
        <>
          <Radio className="h-3 w-3 text-red-500 animate-[pulse_1.5s_infinite] mr-0.5" />
          <span>SYS_FEED: AUDIO LIVE</span>
          <Volume2 className="h-3.5 w-3.5" />
        </>
      ) : (
        <>
          <span>SYS_FEED: STANDBY</span>
          <VolumeX className="h-3.5 w-3.5 opacity-60" />
        </>
      )}
    </button>
  );
}
