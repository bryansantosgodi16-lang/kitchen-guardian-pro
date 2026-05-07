import { useEffect, useState } from "react";
import logo from "@/assets/logo.jpeg";
import { Flame, Cloud, Activity, Fuel, Lock } from "lucide-react";

export function IntroAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),   // glow on
      setTimeout(() => setPhase(2), 1200),  // scanner + sensors
      setTimeout(() => setPhase(3), 3200),  // lock pulse
      setTimeout(() => setPhase(4), 4400),  // expand
      setTimeout(() => onDone(), 5600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const sensors = [
    { icon: Flame, label: "Calor", angle: -90 },
    { icon: Cloud, label: "Fumaça", angle: 0 },
    { icon: Activity, label: "Movimento", angle: 90 },
    { icon: Fuel, label: "Gás GLP", angle: 180 },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background">
      {/* tech smoke bg */}
      <div className="absolute inset-0 opacity-60" style={{
        background: "radial-gradient(ellipse at 30% 40%, rgba(0,255,136,0.08), transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(0,200,120,0.06), transparent 50%)",
      }} />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: 300, height: 300,
          left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`,
          background: "radial-gradient(circle, rgba(0,255,136,0.05), transparent 70%)",
          animation: `float-smoke ${8 + i}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }} />
      ))}

      <div className="relative flex min-h-screen items-center justify-center">
        <div
          className="relative"
          style={{
            animation: phase >= 4 ? "zoom-expand 1.2s ease-in forwards" : undefined,
          }}
        >
          {/* Sensor dots */}
          {sensors.map((s, i) => {
            const r = 180;
            const rad = (s.angle * Math.PI) / 180;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full neon-border"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  background: "rgba(10,20,15,0.8)",
                  opacity: phase >= 2 ? 1 : 0,
                  animation: phase >= 2 ? `sensor-pop 0.5s ease-out ${i * 0.15}s both` : undefined,
                }}
              >
                <Icon className="h-5 w-5 neon-text" />
              </div>
            );
          })}

          {/* Rotating ring */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 340, height: 340,
              border: "2px dashed rgba(0,255,136,0.5)",
              animation: phase >= 1 ? "spin-slow 8s linear infinite" : undefined,
              opacity: phase >= 1 ? 1 : 0,
              transition: "opacity 0.8s",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 300, height: 300,
              border: "3px solid #00ff88",
              boxShadow: "0 0 40px rgba(0,255,136,0.7), inset 0 0 40px rgba(0,255,136,0.3)",
              opacity: phase >= 1 ? 1 : 0,
              transition: "opacity 1s",
            }}
          />

          {/* Logo */}
          <div
            className="relative h-64 w-64 overflow-hidden rounded-full"
            style={{
              animation: phase >= 1 ? "pulse-neon 2.5s ease-in-out infinite" : undefined,
              transform: phase >= 3 ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.8s ease-out",
            }}
          >
            <img src={logo} alt="Logo" className="h-full w-full object-cover" />

            {/* Scanner line */}
            {phase >= 2 && phase < 4 && (
              <div
                className="absolute inset-x-0 h-1"
                style={{
                  background: "linear-gradient(90deg, transparent, #00ff88, transparent)",
                  boxShadow: "0 0 20px #00ff88, 0 0 40px #00ff88",
                  animation: "scan 1.8s linear infinite",
                }}
              />
            )}

            {/* Lock pulse overlay */}
            {phase >= 3 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full p-4" style={{
                  background: "radial-gradient(circle, rgba(0,255,136,0.6), transparent 70%)",
                  animation: "pulse-neon 1s ease-in-out infinite",
                }}>
                  <Lock className="h-12 w-12" style={{ color: "#00ff88", filter: "drop-shadow(0 0 10px #00ff88)" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}