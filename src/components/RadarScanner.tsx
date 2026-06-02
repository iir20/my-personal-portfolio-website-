import { useEffect, useRef } from "react";

interface RadarScannerProps {
  accentColor: string; // 'green' | 'cyan' | 'purple' | 'amber'
}

interface Target {
  x: number;
  y: number;
  angle: number;
  distance: number;
  opacity: number;
  label: string;
}

export default function RadarScanner({ accentColor }: RadarScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    // Fixed internal size for perfect scaling
    const size = 260;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const radius = size / 2 - 10;

    // Blinding targets in relative coords (polar distance & angle)
    const targets: Target[] = [
      { x: 0, y: 0, angle: 0.8, distance: 0.4, opacity: 0, label: "IP_231.12" },
      { x: 0, y: 0, angle: 2.3, distance: 0.75, opacity: 0, label: "BOT_TRT" },
      { x: 0, y: 0, angle: 4.1, distance: 0.55, opacity: 0, label: "NODE_SVR" },
      { x: 0, y: 0, angle: 5.5, distance: 0.3, opacity: 0, label: "HONEY_PK" }
    ];

    // Compute absolute xy for targets
    targets.forEach((t) => {
      t.x = center + Math.cos(t.angle) * (radius * t.distance);
      t.y = center + Math.sin(t.angle) * (radius * t.distance);
    });

    // Color definitions
    const colors = {
      cyan: { hex: "#00F0FF", rgb: "0, 240, 255" },
      purple: { hex: "#BD00FF", rgb: "189, 0, 255" },
      amber: { hex: "#F59E0B", rgb: "245, 158, 11" },
      green: { hex: "#00FF66", rgb: "0, 255, 102" }
    };
    
    const activeColor = colors[accentColor] || colors.green;

    const draw = () => {
      // Clear with slight transparency for a fading retro look
      ctx.fillStyle = "rgba(4, 4, 8, 1)";
      ctx.fillRect(0, 0, size, size);

      // 1. Draw grid background circles
      ctx.strokeStyle = `rgba(${activeColor.rgb}, 0.15)`;
      ctx.lineWidth = 1;

      // Draw concentric rings
      [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(center, center, radius * ratio, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 2. Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(center - radius, center);
      ctx.lineTo(center + radius, center);
      ctx.moveTo(center, center - radius);
      ctx.lineTo(center, center + radius);
      ctx.stroke();

      // 3. Draw outer angle ticks
      ctx.strokeStyle = `rgba(${activeColor.rgb}, 0.25)`;
      ctx.font = "8px monospace";
      ctx.fillStyle = `rgba(${activeColor.rgb}, 0.5)`;
      ctx.textAlign = "center";
      
      for (let d = 0; d < 360; d += 45) {
        const rad = (d * Math.PI) / 180;
        const x1 = center + Math.cos(rad) * radius;
        const y1 = center + Math.sin(rad) * radius;
        const x2 = center + Math.cos(rad) * (radius - 5);
        const y2 = center + Math.sin(rad) * (radius - 5);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 4. Update targets (collision with sweep line & fadeout)
      targets.forEach((t) => {
        // Calculate the difference in angles (0 to 2PI)
        const diff = Math.abs(sweepAngle - t.angle) % (Math.PI * 2);
        const threshold = 0.05; // angle scan thickness
        
        if (diff < threshold || Math.abs(diff - Math.PI * 2) < threshold) {
          t.opacity = 1.0; // fully charged as beam passes
        } else {
          t.opacity -= 0.01; // slow decay
          if (t.opacity < 0) t.opacity = 0;
        }

        // Draw active targets
        if (t.opacity > 0) {
          // Glow arc
          ctx.beginPath();
          ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${activeColor.rgb}, ${t.opacity})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(t.x, t.y, 10 * (1 - t.opacity + 0.1), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${activeColor.rgb}, ${t.opacity * 0.4})`;
          ctx.stroke();

          // Target labels
          ctx.font = "7px font-mono, monospace";
          ctx.fillStyle = `rgba(${activeColor.rgb}, ${t.opacity * 0.7})`;
          ctx.fillText(t.label, t.x, t.y - 8);
        }
      });

      // 5. Draw sweeping scanner line
      const sweepX = center + Math.cos(sweepAngle) * radius;
      const sweepY = center + Math.sin(sweepAngle) * radius;

      // Draw sweeping ray gradient using multiple lines with smaller opacity
      const gradientResolution = 24;
      for (let j = 0; j < gradientResolution; j++) {
        const tailAngle = sweepAngle - (j * Math.PI) / 180;
        const tailX = center + Math.cos(tailAngle) * radius;
        const tailY = center + Math.sin(tailAngle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = `rgba(${activeColor.rgb}, ${0.4 * (1 - j / gradientResolution)})`;
        ctx.lineWidth = j === 0 ? 1.5 : 1;
        ctx.stroke();
      }

      // Sweeper center pivot beacon
      ctx.beginPath();
      ctx.arc(center, center, 3, 0, Math.PI * 2);
      ctx.fillStyle = activeColor.hex;
      ctx.fill();

      // Slow rotation increment
      sweepAngle = (sweepAngle + 0.015) % (Math.PI * 2);
    };

    const animate = () => {
      draw();
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [accentColor]);

  return (
    <div className="relative flex items-center justify-center p-3 rounded-md bg-black/40 border border-emerald-500/10 shadow-inner">
      {/* Outer Hologram Overlay */}
      <div className="absolute inset-4 rounded-full border border-dashed border-emerald-500/5 animate-[spin_40s_linear_infinite] pointer-events-none" />
      <canvas ref={canvasRef} className="block w-full max-w-[200px] h-auto" />
    </div>
  );
}
