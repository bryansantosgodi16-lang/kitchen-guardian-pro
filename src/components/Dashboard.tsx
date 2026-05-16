import { useEffect, useMemo, useState } from "react";
import {
  Shield, ShieldCheck, ShieldAlert, Flame, Cloud, Activity, Fuel,
  Droplets, Bell, BellOff, Power, Radio, CheckCircle2, AlertTriangle,
} from "lucide-react";

type SensorKey = "heat" | "smoke" | "motion" | "gas";

interface SensorState {
  key: SensorKey;
  label: string;
  value: number;
  unit: string;
  threshold: number;
  icon: typeof Flame;
}

export function Dashboard() {
  const [alarmArmed, setAlarmArmed] = useState(true);
  const [motion, setMotion] = useState(false);
  const [sensors, setSensors] = useState<SensorState[]>([
    { key: "heat", label: "Calor", value: 38, unit: "°C", threshold: 70, icon: Flame },
    { key: "smoke", label: "Fumaça", value: 12, unit: "ppm", threshold: 80, icon: Cloud },
    { key: "motion", label: "Movimento", value: 0, unit: "", threshold: 1, icon: Activity },
    { key: "gas", label: "Gás GLP", value: 4, unit: "%LEL", threshold: 20, icon: Fuel },
  ]);
  const [pumpManual, setPumpManual] = useState(false);
  const [logs, setLogs] = useState<{ t: string; msg: string; level: "info" | "warn" | "ok" }[]>([
    { t: now(), msg: "Sistema inicializado", level: "ok" },
  ]);

  // simulate sensor drift
  useEffect(() => {
    const id = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          if (s.key === "motion") return { ...s, value: motion ? 1 : 0 };
          const drift = (Math.random() - 0.45) * (s.key === "heat" ? 2 : 3);
          const next = Math.max(0, s.value + drift);
          return { ...s, value: Number(next.toFixed(1)) };
        }),
      );
    }, 1500);
    return () => clearInterval(id);
  }, [motion]);

  const triggered = useMemo(
    () => sensors.filter((s) => s.key !== "motion" && s.value >= s.threshold),
    [sensors],
  );
  const alarmActive = alarmArmed && triggered.length > 0;

  // Pump logic: if alarm active AND motion sensor is ON, pump waits.
  // Pump activates only when motion turns OFF (or by manual override).
  const pumpAuto = alarmActive && !motion;
  const pumpOn = pumpAuto || pumpManual;
  const pumpHolding = alarmActive && motion;

  // log transitions
  useEffect(() => {
    if (alarmActive) pushLog("Alarme de segurança ATIVADO", "warn");
    else pushLog("Sistema em monitoramento normal", "ok");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarmActive]);
  useEffect(() => {
    if (pumpHolding) pushLog("Bomba em espera — movimento detectado na cozinha", "warn");
    if (pumpAuto) pushLog("Bomba de água ACIONADA automaticamente", "warn");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pumpAuto, pumpHolding]);

  function pushLog(msg: string, level: "info" | "warn" | "ok") {
    setLogs((l) => [{ t: now(), msg, level }, ...l].slice(0, 20));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{
          background:
            "radial-gradient(ellipse at top left, rgba(0,255,136,0.08), transparent 50%), radial-gradient(ellipse at bottom right, rgba(0,255,136,0.05), transparent 50%)",
        }} />
      </div>

      <header className="relative border-b border-border/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2 neon-border">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 neon-text" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-wide">
                COZINHA INDUSTRIAL · MONITORAMENTO
              </h1>
              <p className="text-xs text-muted-foreground">Dashboard em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusPill ok={!alarmActive} okLabel="SEGURO" alertLabel="ALERTA" />
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-card/40 px-3 py-1.5 text-xs">
              <Radio className="h-3.5 w-3.5 neon-text" /> ONLINE
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:gap-6 sm:px-6 lg:grid-cols-3">
        {/* Sensors */}
        <section className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          {sensors.map((s) => {
            const danger = s.key !== "motion" && s.value >= s.threshold;
            const active = s.key === "motion" ? motion : danger;
            return (
              <div key={s.key}
                className={`glass rounded-2xl p-5 transition ${active ? "ring-1 ring-destructive/60" : ""}`}
                style={active ? { boxShadow: "0 0 30px rgba(255,80,80,0.25)" } : undefined}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-2 ${active ? "" : "neon-border"}`}
                      style={active ? { border: "1px solid rgba(255,90,90,0.5)", boxShadow: "0 0 20px rgba(255,80,80,0.35)" } : undefined}>
                      <s.icon className={`h-5 w-5 ${active ? "text-destructive" : "neon-text"}`} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground tracking-widest">SENSOR</div>
                      <div className="text-base font-bold">{s.label}</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest ${
                    active ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"
                  }`}>
                    {s.key === "motion" ? (motion ? "DETECTADO" : "PARADO") : danger ? "CRÍTICO" : "NORMAL"}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="text-3xl font-extrabold tabular-nums">
                    {s.key === "motion" ? (motion ? "1" : "0") : s.value}
                    <span className="ml-1 text-sm text-muted-foreground">{s.unit}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    limite: {s.threshold}{s.unit}
                  </div>
                </div>
                {/* bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all`}
                    style={{
                      width: `${Math.min(100, (s.key === "motion" ? (motion ? 100 : 0) : (s.value / s.threshold) * 100))}%`,
                      background: active ? "linear-gradient(90deg,#ff5a5a,#ff8a3d)" : "linear-gradient(90deg,#00cc6a,#00ff88)",
                      boxShadow: active ? "0 0 12px rgba(255,80,80,0.6)" : "0 0 12px rgba(0,255,136,0.5)",
                    }} />
                </div>
              </div>
            );
          })}
        </section>

        {/* Control panel */}
        <aside className="grid gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              {alarmArmed ? <ShieldCheck className="h-5 w-5 neon-text" /> : <ShieldAlert className="h-5 w-5 text-muted-foreground" />}
              <h2 className="text-sm font-bold tracking-widest neon-text">ALARME DE SEGURANÇA</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{alarmArmed ? (alarmActive ? "DISPARADO" : "ARMADO") : "DESARMADO"}</div>
                <div className="text-xs text-muted-foreground">
                  {alarmActive ? `${triggered.length} sensor(es) acima do limite` : "Tudo sob controle"}
                </div>
              </div>
              <button
                onClick={() => setAlarmArmed((v) => !v)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold tracking-wide transition ${
                  alarmArmed ? "bg-card border border-border" : "neon-btn"
                }`}>
                {alarmArmed ? <><BellOff className="h-4 w-4" /> DESARMAR</> : <><Bell className="h-4 w-4" /> ARMAR</>}
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 neon-text" />
              <h2 className="text-sm font-bold tracking-widest neon-text">SENSOR DE MOVIMENTO</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{motion ? "ATIVO" : "OCIOSO"}</div>
                <div className="text-xs text-muted-foreground">
                  Simula presença de operadores na cozinha
                </div>
              </div>
              <button
                onClick={() => setMotion((v) => !v)}
                className={`rounded-xl px-3 py-2 text-xs font-bold tracking-wide transition ${
                  motion ? "neon-btn" : "bg-card border border-border"
                }`}>
                {motion ? "DESLIGAR" : "LIGAR"}
              </button>
            </div>
          </div>

          <div className={`glass rounded-2xl p-5 ${pumpOn ? "ring-1 ring-primary/60" : ""}`}>
            <div className="mb-3 flex items-center gap-2">
              <Droplets className={`h-5 w-5 ${pumpOn ? "neon-text" : "text-muted-foreground"}`} />
              <h2 className="text-sm font-bold tracking-widest neon-text">BOMBA DE ÁGUA</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {pumpOn ? "ACIONADA" : pumpHolding ? "EM ESPERA" : "DESLIGADA"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {pumpHolding
                    ? "Aguardando movimento cessar para acionar"
                    : pumpAuto
                    ? "Acionada automaticamente pelo alarme"
                    : "Pronta para acionamento"}
                </div>
              </div>
              <button
                onClick={() => setPumpManual((v) => !v)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold tracking-wide transition ${
                  pumpManual ? "neon-btn" : "bg-card border border-border"
                }`}>
                <Power className="h-4 w-4" />
                {pumpManual ? "PARAR" : "MANUAL"}
              </button>
            </div>
            {pumpHolding && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
                Por segurança, a bomba só será ativada quando o sensor de movimento desligar.
              </div>
            )}
          </div>
        </aside>

        {/* Logs */}
        <section className="glass rounded-2xl p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest neon-text">REGISTRO DE EVENTOS</h2>
            <span className="text-[10px] text-muted-foreground">Tempo real</span>
          </div>
          <ul className="divide-y divide-border/40">
            {logs.map((l, i) => (
              <li key={i} className="flex items-center gap-3 py-2 text-sm">
                {l.level === "warn" ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 neon-text" />
                )}
                <span className="text-muted-foreground tabular-nums">{l.t}</span>
                <span>{l.msg}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function StatusPill({ ok, okLabel, alertLabel }: { ok: boolean; okLabel: string; alertLabel: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-widest ${
      ok ? "border border-primary/40 text-primary" : "border border-destructive/60 text-destructive"
    }`} style={ok ? { boxShadow: "0 0 18px rgba(0,255,136,0.25)" } : { boxShadow: "0 0 18px rgba(255,80,80,0.35)" }}>
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-primary" : "bg-destructive"}`}
        style={{ boxShadow: ok ? "0 0 10px #00ff88" : "0 0 10px #ff5a5a" }} />
      {ok ? okLabel : alertLabel}
    </div>
  );
}

function now() {
  const d = new Date();
  return d.toLocaleTimeString("pt-BR", { hour12: false });
}