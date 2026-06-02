import { useEffect, useRef } from "react";

interface MatrixRainProps {
  isActive: boolean;
  accentColor: string; // hex color or color identifier: 'cyan' | 'green' | 'purple' | 'amber'
}

export default function MatrixRain({ isActive, accentColor }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix characters
    const katakana = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890XYZ★☆☠⚡☣";
    const alphabet = katakana.split("");

    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);

    // Initialize drops
    let rainDrops: number[] = [];
    const initDrops = () => {
      columns = Math.floor(canvas.width / fontSize);
      rainDrops = [];
      for (let x = 0; x < columns; x++) {
        rainDrops[x] = Math.floor(Math.random() * -100);
      }
    };

    initDrops();

    // Map themes to hex
    const getAccentRGB = (theme: string) => {
      switch (theme) {
        case "cyan":
          return "0, 240, 255";
        case "purple":
          return "189, 0, 255";
        case "amber":
          return "245, 158, 11";
        case "green":
        default:
          return "0, 255, 102";
      }
    };

    const draw = () => {
      if (!isActive) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Slightly transparent black to create trail effect
      ctx.fillStyle = "rgba(2, 2, 4, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const colorRGB = getAccentRGB(accentColor);
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        
        // Randomly make the head char white or light neon, others normal neon
        const yPos = rainDrops[i] * fontSize;
        if (Math.random() > 0.98) {
          ctx.fillStyle = "#ffffff";
        } else {
          ctx.fillStyle = `rgba(${colorRGB}, 0.85)`;
        }

        ctx.fillText(text, i * fontSize, yPos);

        // Reset drop back to top after it exits window with randomized trigger
        if (yPos > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }

        rainDrops[i]++;
      }
    };

    const interval = 33; // ~30 fps is extremely smooth and saves battery
    let lastTime = 0;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const elapsed = time - lastTime;

      if (elapsed > interval) {
        draw();
        lastTime = time;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isActive, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
        isActive ? "opacity-[0.14]" : "opacity-0"
      }`}
      style={{ zIndex: 0 }}
      id="matrix-rain-canvas"
    />
  );
}
