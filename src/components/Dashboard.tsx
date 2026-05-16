import { useEffect, useMemo, useState } from "react";
import {
  Flame, Shield, ShieldAlert, Thermometer, Wind, Activity, Eye,
  Droplets, Plug, Play, Pause, AlertTriangle,
} from "lucide-react";

type SensorKey = "temp" | "smoke" | "gas" | "motion";
interface Sensor {
  key: SensorKey;
  label: string;
  value: number;
  unit: string;
  threshold: number;
  zone: string;
  icon: typeof Thermometer;
}
type ActuatorKey = "vent" | "gasValve" | "pump" | "power";

export function Dashboard() {
  const [mock, setMock] = useState(false);
  const [alarmArmed, setAlarmArmed] = useState(true);
  const [motionOn, setMotionOn] = useState(true);
  const [sensors, setSensors] = useState<Sensor[]>([
    { key: "temp", label: "Temperatura", value: 24, unit: "°C", threshold: 70, zone: "FOGÃO", icon: Thermometer },
    { key: "smoke", label: "Densidade de Fumaça", value: 12, unit: "ppm", threshold: 80, zone: "VENTILAÇÃO", icon: Wind },
    { key: "gas", label: "Gás (GLP)", value: 0.2, unit: "%LEL", threshold: 20, zone: "LINHAS DE GÁS", icon: Flame },
    { key: "motion", label: "Movimento", value: 1, unit: "", threshold: 1, zone: "ÁREA DE PREPARO", icon: Eye },
  ]);
  const [actuators, setActuators] = useState<Record<ActuatorKey, boolean>>({
    vent: true, gasValve: true, pump: false, power: true,
  });

  // mock data drift
  useEffect(() => {
    if (!mock) return;
    const id = setInterval(() => {
      setSensors((prev) => prev.map((s) => {
        if (s.key === "motion") return { ...s, value: motionOn ? 1 : 0 };
        const drift = (Math.random() - 0.4) * (s.key === "temp" ? 3 : s.key === "gas" ? 1 : 5);
        return { ...s, value: Math.max(0, Number((s.value + drift).toFixed(1))) };
      }));
    }, 1500);
    return () => clearInterval(id);
  }, [mock, motionOn]);

  // keep motion sensor synced with toggle
  useEffect(() => {
    setSensors((prev) => prev.map((s) => s.key === "motion" ? { ...s, value: motionOn ? 1 : 0 } : s));
  }, [motionOn]);

  const triggered = useMemo(
    () => sensors.filter((s) => s.key !== "motion" && s.value >= s.threshold),
    [sensors],
  );
  const alarmActive = alarmArmed && triggered.length > 0;

  // Pump rule: alarm ARMED + motion ON => pump waits.
  // Pump activates only when motion turns OFF (with alarm armed/active).
  const pumpHolding = alarmArmed && motionOn;
  const pumpAuto = alarmArmed && !motionOn && (alarmActive || actuators.pump);

  useEffect(() => {
    setActuators((a) => ({ ...a, pump: pumpAuto ? true : a.pump && !pumpHolding }));
    if (pumpHolding) setActuators((a) => ({ ...a, pump: false }));
  }, [pumpAuto, pumpHolding]);

  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* header */}
      <header className="border-b border-border/40 px-4 py-5 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Flame className="h-7 w-7 text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Monitor de Segurança da Cozinha</h1>
              <p className="text-sm text-muted-foreground">Painel da Rede de Sensores Industriais</p>
            </div>
          </div>
          <div className="text-right text-xs neon-text">
            <div>v1.0 • Arduino Bridge</div>
            <div className="text-muted-foreground">{today}</div>
          </div>
        </div>

        <div className="mx-auto mt-5 flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
            alarmActive ? "border-destructive/60 bg-destructive/10" : "border-primary/30 bg-primary/5"
          }`}>
            {alarmActive ? <ShieldAlert className="h-6 w-6 text-destructive" /> : <Shield className="h-6 w-6 neon-text" />}
            <div>
              <div className={`text-base font-bold tracking-wide ${alarmActive ? "text-destructive" : "neon-text"}`}>
                {alarmActive ? "ALERTA" : "NORMAL"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {alarmActive ? `${triggered.length} sensor(es) acima do limite` : "Todos os sistemas operacionais"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setAlarmArmed((v) => !v)}
              className={`rounded-md border px-3 py-2 text-xs font-bold tracking-wide ${
                alarmArmed ? "border-primary/40 neon-text" : "border-border text-muted-foreground"
              }`}>
              {alarmArmed ? "ALARME ARMADO" : "ALARME DESARMADO"}
            </button>
            <button onClick={() => setMock((v) => !v)}
              className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2 text-xs font-bold tracking-wide hover:bg-card">
              {mock ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {mock ? "PAUSAR MOCK" : "INICIAR MOCK"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-8 lg:grid-cols-2">
        {/* Floor plan */}
        <section>
          <h2 className="mb-3 text-xs font-bold tracking-[0.2em] text-muted-foreground">PLANTA</h2>
          <div className="rounded-xl border border-border/60 bg-card/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <Zone title="FOGÃO">
                <ZoneItem icon={<Thermometer className="h-4 w-4 neon-text" />} label={`${sensors[0].value.toFixed(0)}°C`} />
                <ZoneItem icon={<Droplets className={`h-4 w-4 ${actuators.pump ? "neon-text" : "text-muted-foreground"}`} />} label={actuators.pump ? "ON" : "OFF"} />
              </Zone>
              <Zone title="VENTILAÇÃO">
                <ZoneItem icon={<Wind className="h-4 w-4 neon-text" />} label={`${sensors[1].value.toFixed(1)}ppm`} />
                <ZoneItem icon={<Plug className={`h-4 w-4 ${actuators.vent ? "neon-text" : "text-muted-foreground"}`} />} label={actuators.vent ? "ON" : "OFF"} />
              </Zone>
              <Zone title="ÁREA DE PREPARO">
                <ZoneItem icon={<Eye className={`h-4 w-4 ${motionOn ? "neon-text" : "text-muted-foreground"}`} />} label={motionOn ? "1.0" : "0.0"} />
                <ZoneItem icon={<Plug className={`h-4 w-4 ${actuators.power ? "neon-text" : "text-muted-foreground"}`} />} label={actuators.power ? "ON" : "OFF"} />
              </Zone>
              <Zone title="LINHAS DE GÁS">
                <ZoneItem icon={<Flame className="h-4 w-4 neon-text" />} label={`${sensors[2].value.toFixed(1)}%LEL`} />
                <ZoneItem icon={<Activity className={`h-4 w-4 ${actuators.gasValve ? "neon-text" : "text-muted-foreground"}`} />} label={actuators.gasValve ? "ON" : "OFF"} />
              </Zone>
            </div>

            {/* Rule banner */}
            <div className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-xs ${
              pumpHolding ? "border-destructive/50 bg-destructive/10 text-destructive" :
              pumpAuto ? "border-primary/50 bg-primary/10 neon-text" :
              "border-border bg-card/40 text-muted-foreground"
            }`}>
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" />
              <div>
                <strong>Regra de segurança da bomba:</strong>{" "}
                {pumpHolding
                  ? "Alarme armado e movimento detectado — a bomba de água será acionada assim que o sensor de movimento desligar."
                  : pumpAuto
                  ? "Movimento cessado com alarme armado — bomba de água ACIONADA automaticamente."
                  : "Quando o alarme estiver armado e houver movimento, a bomba só liga após o movimento parar."}
              </div>
            </div>
          </div>
        </section>

        {/* Sensors */}
        <section>
          <h2 className="mb-3 text-xs font-bold tracking-[0.2em] text-muted-foreground">SENSORES</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {sensors.map((s) => {
              const danger = s.key !== "motion" && s.value >= s.threshold;
              return (
                <div key={s.key} className={`rounded-xl border p-4 ${
                  danger ? "border-destructive/60 bg-destructive/5" : "border-border bg-card/30"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <s.icon className={`h-5 w-5 ${danger ? "text-destructive" : "neon-text"}`} />
                      <span className="font-bold">{s.label}</span>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-widest ${
                      danger ? "bg-destructive/20 text-destructive" : "bg-primary/15 text-primary"
                    }`}>
                      {danger ? "CRÍTICO" : "SEGURO"}
                    </span>
                  </div>
                  <div className="mt-3 text-3xl font-extrabold tabular-nums">
                    {s.key === "motion" ? (motionOn ? "1.0" : "0.0") : s.value}
                    <span className="ml-1 text-sm text-muted-foreground">{s.unit}</span>
                  </div>
                  <div className="mt-1 text-[10px] tracking-widest text-muted-foreground">ZONA: {s.zone}</div>
                </div>
              );
            })}
          </div>

          <h2 className="mt-6 mb-3 text-xs font-bold tracking-[0.2em] text-muted-foreground">ATUADORES</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActuatorCard
              label="Sistema de Ventilação" icon={<Wind className="h-5 w-5 neon-text" />}
              active={actuators.vent}
              onToggle={() => setActuators((a) => ({ ...a, vent: !a.vent }))}
            />
            <ActuatorCard
              label="Válvula de Gás" icon={<Flame className="h-5 w-5 neon-text" />}
              active={actuators.gasValve}
              onToggle={() => setActuators((a) => ({ ...a, gasValve: !a.gasValve }))}
            />
            <ActuatorCard
              label="Bomba de Água"
              icon={<Droplets className={`h-5 w-5 ${actuators.pump ? "neon-text" : "text-muted-foreground"}`} />}
              active={actuators.pump}
              statusOverride={pumpHolding ? "EM ESPERA" : undefined}
              disabled={pumpHolding}
              onToggle={() => {
                if (pumpHolding) return;
                setActuators((a) => ({ ...a, pump: !a.pump }));
              }}
              hint={pumpHolding ? "Movimento detectado — aguardando." : pumpAuto ? "Acionada pela regra de segurança." : undefined}
            />
            <ActuatorCard
              label="Tomadas Elétricas" icon={<Plug className="h-5 w-5 neon-text" />}
              active={actuators.power}
              onToggle={() => setActuators((a) => ({ ...a, power: !a.power }))}
            />
          </div>

          <div className="mt-4 rounded-lg border border-border bg-card/30 p-3 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-bold tracking-widest text-muted-foreground">SENSOR DE MOVIMENTO</span>
              <button onClick={() => setMotionOn((v) => !v)}
                className={`rounded px-3 py-1 text-[11px] font-bold tracking-wide ${
                  motionOn ? "neon-btn" : "border border-border bg-card text-foreground"
                }`}>
                {motionOn ? "DESLIGAR" : "LIGAR"}
              </button>
            </div>
            <div className="text-muted-foreground">
              Estado atual: <span className={motionOn ? "neon-text font-bold" : "font-bold"}>{motionOn ? "ATIVO" : "OCIOSO"}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Zone({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="mb-3 text-[10px] font-bold tracking-[0.2em] text-muted-foreground">{title}</div>
      <div className="flex items-end justify-center gap-6 py-4">{children}</div>
    </div>
  );
}
function ZoneItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {icon}
      <span className="text-[11px] font-bold tabular-nums">{label}</span>
    </div>
  );
}

function ActuatorCard({
  label, icon, active, onToggle, statusOverride, disabled, hint,
}: {
  label: string; icon: React.ReactNode; active: boolean; onToggle: () => void;
  statusOverride?: string; disabled?: boolean; hint?: string;
}) {
  const status = statusOverride ?? (active ? "ATIVO" : "DESLIGADO");
  const statusClass = statusOverride
    ? "bg-destructive/20 text-destructive"
    : active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">{icon}{label}</div>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-widest ${statusClass}`}>{status}</span>
      </div>
      <button onClick={onToggle} disabled={disabled}
        className={`mt-3 w-full rounded-md px-3 py-2 text-sm font-bold tracking-wide transition ${
          disabled ? "cursor-not-allowed bg-muted/40 text-muted-foreground" :
          active ? "bg-destructive/20 text-destructive hover:bg-destructive/30" :
                   "bg-primary/15 text-primary hover:bg-primary/25"
        }`}>
        {active ? "Desativar" : "Ativar"}
      </button>
      {hint && <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}