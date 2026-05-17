import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck, Flame, Cloud, Activity, Fuel, Droplets, Power, Zap,
  Wind, Bell, AlertTriangle, CheckCircle2, Radio, Clock,
} from "lucide-react";
import kitchenPlan from "@/assets/kitchen-plan.jpg";

type SensorKey = "heat" | "smoke" | "gas" | "motion";

interface Sensor {
  key: SensorKey;
  label: string;
  short: string;
  unit: string;
  value: number;
  threshold: number;
  zone: string;
  icon: typeof Flame;
  // position on plan (percent)
  x: number;
  y: number;
}

interface LogEntry {
  t: string;
  msg: string;
  level: "info" | "warn" | "ok" | "danger";
}

const initialSensors: Sensor[] = [
  { key: "heat",   label: "Sensor de Calor",      short: "Calor",     unit: "°C",   value: 32, threshold: 70, zone: "Fogão Industrial",  icon: Flame,    x: 22, y: 38 },
  { key: "smoke",  label: "Sensor de Fumaça",     short: "Fumaça",    unit: "ppm",  value: 18, threshold: 80, zone: "Área de Cocção",    icon: Cloud,    x: 50, y: 30 },
  { key: "gas",    label: "Sensor de Gás (GLP)",  short: "Gás GLP",   unit: "%LEL", value: 4,  threshold: 20, zone: "Central de Gás",    icon: Fuel,     x: 22, y: 70 },
  { key: "motion", label: "Sensor de Movimento", short: "Movimento", unit: "",     value: 0,  threshold: 1,  zone: "Área de Preparo",   icon: Activity, x: 55, y: 70 },
];

export function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors);
  const [now, setNow] = useState<Date | null>(null);
  const startedAt = useRef<number>(Date.now());
  const [uptime, setUptime] = useState("0h 00m 00s");
  const [emergency, setEmergency] = useState(false);
  const [actuators, setActuators] = useState({
    ventilation: false,
    gasValve: false, // closed = false
    waterPump: false,
    power: true,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    setMounted(true);
    startedAt.current = Date.now();
    setNow(new Date());
    pushLog("Sistema inicializado", "ok");
  }, []);

  // clock & uptime
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      const d = new Date();
      setNow(d);
      const s = Math.floor((Date.now() - startedAt.current) / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setUptime(`${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`);
    }, 1000);
    return () => clearInterval(id);
  }, [mounted]);

  // sensor drift
  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          if (s.key === "motion") {
            return { ...s, value: Math.random() > 0.85 ? 1 : 0 };
          }
          const base =
            s.key === "heat" ? 32 : s.key === "smoke" ? 18 : 4;
          const noise = (Math.random() - 0.45) * (s.key === "heat" ? 2 : 1.5);
          const next = Math.max(0, base + noise + (s.value - base) * 0.6);
          return { ...s, value: Number(next.toFixed(1)) };
        })
      );
    }, 1500);
    return () => clearInterval(id);
  }, [mounted]);

  const alerts = useMemo(
    () => sensors.filter((s) => s.key !== "motion" && s.value >= s.threshold * 0.8),
    [sensors]
  );
  const critical = useMemo(
    () => sensors.filter((s) => s.key !== "motion" && s.value >= s.threshold),
    [sensors]
  );

  const systemStatus: "NORMAL" | "ALERTA" | "PERIGO" = emergency || critical.length
    ? "PERIGO"
    : alerts.length
    ? "ALERTA"
    : "NORMAL";

  function pushLog(msg: string, level: LogEntry["level"]) {
    setLogs((l) =>
      [
        {
          t: new Date().toLocaleTimeString("pt-BR", { hour12: false }),
          msg,
          level,
        },
        ...l,
      ].slice(0, 30)
    );
  }

  function toggleActuator(k: keyof typeof actuators, msg: string) {
    setActuators((a) => {
      const next = { ...a, [k]: !a[k] };
      pushLog(`${msg}: ${next[k] ? "ATIVADO" : "DESATIVADO"}`, "info");
      return next;
    });
  }

  function triggerEmergency() {
    setEmergency(true);
    setActuators({ ventilation: true, gasValve: false, waterPump: true, power: false });
    pushLog("EMERGÊNCIA acionada manualmente — protocolo de segurança ativo", "danger");
    setTimeout(() => setEmergency(false), 6000);
  }

  const dateStr = mounted && now
    ? now.toLocaleDateString("pt-BR")
    : "";
  const timeStr = mounted && now
    ? now.toLocaleTimeString("pt-BR", { hour12: false })
    : "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{
          background:
            "radial-gradient(ellipse at top left, rgba(0,255,136,0.08), transparent 55%), radial-gradient(ellipse at bottom right, rgba(0,80,255,0.08), transparent 55%)",
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.6) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      {/* HEADER */}
      <header className="relative border-b border-primary/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight neon-text">
              Sistema de Segurança para Cozinha Industrial
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">
              Painel de Monitoramento de Sensores Industriais
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground tabular-nums" suppressHydrationWarning>
            <span className="mr-3">{dateStr}</span>
            <span className="neon-text">{timeStr}</span>
          </div>
        </div>
      </header>

      {/* TOP STATUS BAR */}
      <div className="mx-auto grid max-w-[1600px] gap-4 px-6 py-5 md:grid-cols-3">
        <StatusCard
          status={systemStatus}
          subtitle={
            systemStatus === "NORMAL" ? "Todos os sistemas operacionais"
            : systemStatus === "ALERTA" ? "Atenção em sensores monitorados"
            : "Risco crítico detectado"
          }
        />
        <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full" style={{ animation: "pulse-neon 2s ease-in-out infinite" }} />
            <div className="relative rounded-full neon-border p-3">
              <Clock className="h-5 w-5 neon-text" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary tracking-widest">ON</span>
              <span className="text-sm md:text-base font-bold tracking-wider neon-text">MONITORAMENTO ATIVO</span>
            </div>
            <p className="text-xs text-muted-foreground tracking-wider">24 HORAS POR DIA</p>
          </div>
        </div>
        <button
          onClick={triggerEmergency}
          className={`group relative overflow-hidden rounded-2xl border border-destructive/60 bg-destructive/10 px-5 py-4 text-left transition hover:bg-destructive/20 ${emergency ? "animate-pulse" : ""}`}
          style={{ boxShadow: "0 0 30px rgba(255,80,80,0.3), inset 0 0 30px rgba(255,80,80,0.1)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] tracking-widest text-destructive/80">PROTOCOLO</div>
              <div className="text-xl font-extrabold text-destructive">EMERGÊNCIA</div>
            </div>
            <div className="rounded-xl border border-destructive/60 bg-destructive/20 p-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </button>
      </div>

      {/* MAIN GRID */}
      <main className="relative mx-auto grid max-w-[1600px] gap-5 px-6 pb-6 lg:grid-cols-12">
        {/* Kitchen plan */}
        <section className="glass rounded-2xl p-5 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-[0.25em] text-muted-foreground">
              COZINHA INDUSTRIAL — PLANTA BAIXA
            </h2>
            <span className="rounded-md border border-primary/30 px-2 py-0.5 text-[10px] tracking-widest neon-text">LIVE</span>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-primary/20" style={{ boxShadow: "inset 0 0 40px rgba(0,255,136,0.08)" }}>
            <img
              src={kitchenPlan}
              alt="Planta baixa da cozinha industrial vista de cima"
              className="block w-full select-none"
              width={1280}
              height={832}
              loading="lazy"
              draggable={false}
            />
            {/* scan line */}
            <div className="pointer-events-none absolute inset-x-0 h-12" style={{
              background: "linear-gradient(180deg, transparent, rgba(0,255,136,0.18), transparent)",
              animation: "scan 5s linear infinite",
            }} />
            {/* sensor overlays */}
            {sensors.map((s) => {
              const danger = s.key !== "motion" && s.value >= s.threshold;
              const warn = s.key !== "motion" && s.value >= s.threshold * 0.8 && !danger;
              const tone = danger ? "destructive" : warn ? "yellow" : "primary";
              return <SensorPin key={s.key} sensor={s} tone={tone} />;
            })}
          </div>

          {/* legend */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Legend color="#00ff88" label="VERDE: ESTÁVEL" desc="Tudo normal" />
            <Legend color="#ffd84d" label="AMARELO: ALERTA" desc="Atenção necessária" />
            <Legend color="#ff5a5a" label="VERMELHO: PERIGO" desc="Ação imediata requerida" />
          </div>
        </section>

        {/* Sensors panel */}
        <section className="lg:col-span-5 space-y-4">
          <div className="text-[11px] tracking-[0.25em] text-muted-foreground">
            SENSORES — MONITORAMENTO EM TEMPO REAL
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sensors.map((s) => (
              <SensorCard key={s.key} sensor={s} />
            ))}
          </div>

          <div className="pt-2 text-[11px] tracking-[0.25em] text-muted-foreground">
            ATUADORES / SISTEMAS
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ActuatorCard
              icon={Wind}
              label="Sistema de Ventilação"
              active={actuators.ventilation}
              onToggle={() => toggleActuator("ventilation", "Ventilação")}
              activeLabel="Desativar"
              inactiveLabel="Ativar"
            />
            <ActuatorCard
              icon={Fuel}
              label="Válvula de Gás"
              active={actuators.gasValve}
              onToggle={() => toggleActuator("gasValve", "Válvula de Gás")}
              activeLabel="Fechar Válvula"
              inactiveLabel="Abrir Válvula"
            />
            <ActuatorCard
              icon={Droplets}
              label="Bomba de Água"
              active={actuators.waterPump}
              onToggle={() => toggleActuator("waterPump", "Bomba de Água")}
              activeLabel="Desligar"
              inactiveLabel="Ativar"
            />
            <ActuatorCard
              icon={Zap}
              label="Tomadas de Energia"
              active={actuators.power}
              onToggle={() => toggleActuator("power", "Energia")}
              activeLabel="Desligar"
              inactiveLabel="Ligar"
            />
          </div>
        </section>

        {/* Alerts */}
        <section className="glass rounded-2xl p-5 lg:col-span-5">
          <h2 className="mb-3 text-xs font-bold tracking-[0.25em] text-muted-foreground">
            ALERTAS ATIVOS
          </h2>
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center" style={{ boxShadow: "inset 0 0 30px rgba(0,255,136,0.1)" }}>
              <ShieldCheck className="mx-auto mb-2 h-7 w-7 neon-text" />
              <div className="font-bold neon-text">Nenhum alerta ativo</div>
              <div className="text-xs text-muted-foreground">Todos os sensores operando em níveis normais</div>
            </div>
          ) : (
            <ul className="space-y-2">
              {alerts.map((a) => {
                const danger = a.value >= a.threshold;
                return (
                  <li key={a.key}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                      danger ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
                    }`}>
                    <AlertTriangle className="h-4 w-4 flex-none" />
                    <div className="flex-1">
                      <div className="font-bold">{a.label}</div>
                      <div className="text-xs opacity-80">{a.zone} · {a.value}{a.unit} (limite {a.threshold}{a.unit})</div>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest">
                      {danger ? "CRÍTICO" : "ATENÇÃO"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Logs */}
        <section className="glass rounded-2xl p-5 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-[0.25em] text-muted-foreground">REGISTRO DE EVENTOS</h2>
            <span className="text-[10px] text-muted-foreground tracking-widest" suppressHydrationWarning>
              {logs.length} entradas
            </span>
          </div>
          <ul className="max-h-72 space-y-1 overflow-auto pr-2">
            {logs.map((l, i) => (
              <li key={i} className="flex items-center gap-3 rounded-md border border-border/40 bg-card/30 px-3 py-2 text-sm">
                {l.level === "danger" ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : l.level === "warn" ? (
                  <Bell className="h-4 w-4 text-yellow-400" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 neon-text" />
                )}
                <span className="text-muted-foreground tabular-nums text-xs" suppressHydrationWarning>{l.t}</span>
                <span className="flex-1">{l.msg}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative border-t border-primary/20 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1600px] gap-4 px-6 py-4 md:grid-cols-3 text-sm">
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground">STATUS DO SISTEMA</div>
            <div className={`font-extrabold ${systemStatus === "NORMAL" ? "neon-text" : systemStatus === "ALERTA" ? "text-yellow-400" : "text-destructive"}`}>
              {systemStatus}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground">TEMPO ATIVO</div>
            <div className="font-bold tabular-nums" suppressHydrationWarning>{uptime}</div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground">ÚLTIMA ATUALIZAÇÃO</div>
            <div className="font-bold tabular-nums neon-text" suppressHydrationWarning>{timeStr || "—"}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function StatusCard({ status, subtitle }: { status: "NORMAL" | "ALERTA" | "PERIGO"; subtitle: string }) {
  const color =
    status === "NORMAL" ? "#00ff88" :
    status === "ALERTA" ? "#ffd84d" :
    "#ff5a5a";
  const Icon = status === "NORMAL" ? ShieldCheck : status === "ALERTA" ? Bell : AlertTriangle;
  return (
    <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4"
      style={{ boxShadow: `0 0 30px ${color}33, inset 0 0 30px ${color}10` }}>
      <div className="rounded-xl p-3" style={{ border: `1px solid ${color}55`, boxShadow: `0 0 20px ${color}55` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <div className="text-xl font-extrabold tracking-wider" style={{ color, textShadow: `0 0 10px ${color}aa` }}>
          {status}
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}

function SensorPin({ sensor, tone }: { sensor: Sensor; tone: "primary" | "yellow" | "destructive" }) {
  const colors = {
    primary:     { ring: "rgba(0,255,136,0.6)", text: "#00ff88", bg: "rgba(0,255,136,0.08)" },
    yellow:      { ring: "rgba(255,216,77,0.6)", text: "#ffd84d", bg: "rgba(255,216,77,0.08)" },
    destructive: { ring: "rgba(255,90,90,0.7)", text: "#ff5a5a", bg: "rgba(255,90,90,0.1)" },
  }[tone];
  const Icon = sensor.icon;
  const display = sensor.key === "motion" ? (sensor.value ? "1" : "0") : sensor.value;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${sensor.x}%`, top: `${sensor.y}%` }}
    >
      {/* pulse */}
      <span
        className="absolute inset-0 -z-10 rounded-full"
        style={{
          background: colors.text,
          opacity: 0.25,
          filter: "blur(14px)",
          animation: "pulse-neon 2.4s ease-in-out infinite",
        }}
      />
      <div
        className="flex min-w-[120px] flex-col gap-1 rounded-lg border px-2 py-1.5 text-[10px] backdrop-blur"
        style={{
          background: colors.bg,
          borderColor: colors.ring,
          boxShadow: `0 0 16px ${colors.ring}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <Icon className="h-3 w-3" style={{ color: colors.text }} />
          <span className="font-bold text-white/90">{sensor.label}</span>
        </div>
        <div className="text-[10px] text-white/70 tabular-nums">
          {display}{sensor.unit}
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors.text, boxShadow: `0 0 6px ${colors.text}` }} />
          <span className="font-bold tracking-widest" style={{ color: colors.text }}>
            {tone === "destructive" ? "PERIGO" : tone === "yellow" ? "ALERTA" : "ESTÁVEL"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SensorCard({ sensor }: { sensor: Sensor }) {
  const danger = sensor.key !== "motion" && sensor.value >= sensor.threshold;
  const warn = sensor.key !== "motion" && sensor.value >= sensor.threshold * 0.8 && !danger;
  const tone = danger ? "destructive" : warn ? "yellow" : "primary";
  const colors = {
    primary:     { text: "#00ff88", border: "rgba(0,255,136,0.3)", glow: "rgba(0,255,136,0.25)" },
    yellow:      { text: "#ffd84d", border: "rgba(255,216,77,0.4)", glow: "rgba(255,216,77,0.25)" },
    destructive: { text: "#ff5a5a", border: "rgba(255,90,90,0.5)", glow: "rgba(255,90,90,0.3)" },
  }[tone];
  const Icon = sensor.icon;
  const display = sensor.key === "motion" ? (sensor.value ? "DETECTADO" : "—") : sensor.value;
  const pct = sensor.key === "motion"
    ? (sensor.value ? 100 : 0)
    : Math.min(100, (sensor.value / sensor.threshold) * 100);

  return (
    <div className="glass rounded-2xl p-4" style={{ boxShadow: `0 0 24px ${colors.glow}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: colors.text }} />
          <span className="text-sm font-bold">{sensor.label}</span>
        </div>
        <span
          className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-widest"
          style={{ borderColor: colors.border, color: colors.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors.text, boxShadow: `0 0 6px ${colors.text}` }} />
          {tone === "destructive" ? "PERIGO" : tone === "yellow" ? "ALERTA" : "ESTÁVEL"}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1 tabular-nums">
        <span className="text-2xl font-extrabold" style={{ color: colors.text, textShadow: `0 0 10px ${colors.text}80` }}>
          {display}
        </span>
        {sensor.unit && <span className="text-xs text-muted-foreground">{sensor.unit}</span>}
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: colors.text,
            boxShadow: `0 0 10px ${colors.text}`,
          }}
        />
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        {sensor.key === "heat" && "Temperatura ambiente"}
        {sensor.key === "smoke" && "Densidade de fumaça"}
        {sensor.key === "gas" && "Gás Liquefeito de Petróleo"}
        {sensor.key === "motion" && "Detecção de movimento"}
        <br />
        Zona: {sensor.zone}
      </div>
    </div>
  );
}

function ActuatorCard({
  icon: Icon, label, active, onToggle, activeLabel, inactiveLabel,
}: {
  icon: typeof Flame; label: string; active: boolean; onToggle: () => void;
  activeLabel: string; inactiveLabel: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${active ? "neon-text" : "text-muted-foreground"}`} />
          <span className="text-sm font-bold">{label}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest ${
          active ? "bg-primary/15 text-primary border border-primary/40" : "bg-muted text-muted-foreground border border-border"
        }`}>
          {active ? "ATIVADO" : "DESATIVADO"}
        </span>
      </div>
      <button
        onClick={onToggle}
        className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-bold tracking-widest transition ${
          active ? "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20" : "neon-btn"
        }`}
      >
        <span className="inline-flex items-center gap-2 justify-center">
          <Power className="h-3.5 w-3.5" />
          {active ? activeLabel : inactiveLabel}
        </span>
      </button>
    </div>
  );
}

function Legend({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/30 px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <div>
        <div className="text-[11px] font-bold tracking-widest" style={{ color }}>{label}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
