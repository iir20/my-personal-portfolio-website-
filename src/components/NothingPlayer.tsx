import { useState, useRef, useEffect } from "react";
import { Play, Pause, Music, Disc, Volume2, Sparkles } from "lucide-react";

export default function NothingPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const loopIntervalIdRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const waveOffsetRef = useRef(0);

  // Play/mute control
  const togglePlay = () => {
    if (isPlaying) {
      stopEngine();
    } else {
      startEngine();
    }
  };

  const startEngine = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.5); // safe pleasant volume
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Deep synth arpeggio notes (Nothing OS cool tech scale: C-Eb-G-Bb-C)
      const arpeggio = [130.81, 155.56, 196.00, 233.08, 261.63, 196.00]; // C3 -> Eb3 -> G3 -> Bb3 -> C4 -> G3
      let noteIndex = 0;

      const triggerOscillator = () => {
        if (!ctx || ctx.state === "closed") return;

        try {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const noteGain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(arpeggio[noteIndex % arpeggio.length], ctx.currentTime);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(800, ctx.currentTime);
          filter.Q.setValueAtTime(5, ctx.currentTime);

          // Envelope
          noteGain.gain.setValueAtTime(0, ctx.currentTime);
          noteGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
          noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start();
          osc.stop(ctx.currentTime + 0.5);

          noteIndex++;
        } catch (e) {
          // bypass safe
        }
      };

      triggerOscillator();
      const interval = setInterval(triggerOscillator, 250); // fast arpeggio loop
      loopIntervalIdRef.current = interval;

      setIsPlaying(true);
    } catch (err) {
      console.warn("Nothing OS Synthesizer startup failed.", err);
    }
  };

  const stopEngine = () => {
    const ctx = audioCtxRef.current;
    const gain = gainNodeRef.current;

    if (ctx && gain) {
      try {
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

        setTimeout(() => {
          if (loopIntervalIdRef.current) clearInterval(loopIntervalIdRef.current);
          ctx.close();
          audioCtxRef.current = null;
          setIsPlaying(false);
        }, 220);
      } catch (e) {
        setIsPlaying(false);
      }
    }
  };

  // Rhythm reactive canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 160;
    canvas.height = 40;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "rgba(4, 4, 8, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw dot matrix line grid background
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let x = 0; x < canvas.width; x += 4) {
        for (let y = 0; y < canvas.height; y += 4) {
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Draw responsive arpeggio audio waves
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = isPlaying ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.25)";

      const amplitude = isPlaying ? 12 : 3;
      const frequency = isPlaying ? 0.08 : 0.03;

      for (let x = 0; x < canvas.width; x++) {
        // Sine wave calculations
        const y = canvas.height / 2 + Math.sin(x * frequency + waveOffsetRef.current) * amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Slow scroll wave translation
      waveOffsetRef.current += isPlaying ? 0.16 : 0.04;
      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (loopIntervalIdRef.current) clearInterval(loopIntervalIdRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [isPlaying]);

  return (
    <div className="p-3 border border-stone-800 rounded-lg bg-[#0e0e12] flex items-center justify-between gap-3 text-stone-200 mt-3 font-mono">
      {/* Speaker Driver Icon */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Disc className={`h-8 w-8 text-stone-500 ${isPlaying ? "animate-spin" : "opacity-65"}`} style={{ animationDuration: "5s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Volume2 className="h-3 w-3 text-white" />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-white tracking-widest flex items-center gap-1 uppercase">
            <Music className="h-2.5 w-2.5 animate-pulse" /> MINILAM_SYNTH
          </div>
          <p className="text-[8px] text-stone-400">NOTHING OS SYNTHWAVE-RT</p>
        </div>
      </div>

      {/* Reactive wave Canvas */}
      <canvas ref={canvasRef} className="rounded-sm flex-1 hidden sm:block max-w-[120px] h-9" />

      {/* Start button */}
      <button
        onClick={togglePlay}
        className="cursor-pointer h-7 w-7 rounded-full bg-white text-black hover:bg-stone-200 active:scale-95 transition-all flex items-center justify-center shadow-lg"
        title="Synthesize MiniLam arpeggios"
        id="minilam-play-btn"
      >
        {isPlaying ? (
          <Pause className="h-3 w-3 fill-current text-black" />
        ) : (
          <Play className="h-3 w-3 fill-current text-black ml-0.5" />
        )}
      </button>
    </div>
  );
}
