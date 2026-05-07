import { useState } from "react";
import logo from "@/assets/logo.jpeg";
import { Lock, Thermometer, Cloud, Activity, Fuel, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const sensors = [
  { icon: Thermometer, name: "Sensor de Calor", unit: "°C", color: "#ff5050", values: ["60", "80", "100"] },
  { icon: Cloud, name: "Sensor de Fumaça", unit: "PPM", color: "#3da5ff", values: ["100", "200", "300"] },
  { icon: Activity, name: "Sensor de Movimento", unit: "nível", color: "#a78bfa", values: ["1", "2", "3"] },
  { icon: Fuel, name: "Sensor de Gás (GLP %LEL)", unit: "%LEL", color: "#00ff88", values: ["10", "20", "30"] },
];

export function LoginScreen() {
  const [show] = useState(true);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background" style={{ animation: "fade-up 0.9s ease-out" }}>
      {/* particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute h-1 w-1 rounded-full" style={{
            left: `${(i * 53) % 100}%`,
            background: "#00ff88",
            boxShadow: "0 0 6px #00ff88",
            animation: `particle ${10 + (i % 5) * 3}s linear infinite`,
            animationDelay: `${i * 0.7}s`,
          }} />
        ))}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at top left, rgba(0,255,136,0.08), transparent 50%), radial-gradient(ellipse at bottom right, rgba(0,255,136,0.05), transparent 50%)",
        }} />
      </div>

      <main className="relative mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Logo */}
          <section className="glass flex flex-col items-center justify-center rounded-3xl p-8 text-center" style={{ animation: "fade-up 1s ease-out 0.1s both" }}>
            <div className="relative h-56 w-56 overflow-hidden rounded-full neon-border" style={{ animation: "pulse-neon 3s ease-in-out infinite" }}>
              <img src={logo} alt="Sistema de Segurança" className="h-full w-full object-cover" />
            </div>
            <h1 className="mt-6 text-3xl font-bold leading-tight">
              Sistema de Segurança<br />
              <span className="neon-text">para Cozinha Industrial</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Monitore em tempo real os sensores da sua cozinha industrial e garanta mais segurança para o seu negócio.
            </p>
          </section>

          {/* Right: Form */}
          <section className="glass rounded-3xl p-8" style={{ animation: "fade-up 1s ease-out 0.25s both" }}>
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl p-2 neon-border"><Shield className="h-6 w-6 neon-text" /></div>
              <div>
                <h2 className="text-2xl font-bold tracking-wide">ACESSO AO SISTEMA</h2>
                <p className="text-sm text-muted-foreground">Preencha os dados da empresa e configure os limites dos sensores.</p>
              </div>
            </div>

            <h3 className="mb-3 text-sm font-bold tracking-widest neon-text">DADOS DA EMPRESA</h3>
            <div className="mb-2 h-px w-full" style={{ background: "linear-gradient(90deg, rgba(0,255,136,0.6), transparent)" }} />
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <Field label="Nome da Empresa" placeholder="Digite o nome da empresa" />
              <Field label="Email" placeholder="exemplo@empresa.com" type="email" />
              <Field label="CNPJ" placeholder="00.000.000/0000-00" />
              <Field label="Telefone da Empresa" placeholder="(00) 0000-0000" />
              <div className="sm:col-span-2">
                <Field label="Telefone de Emergência" placeholder="(00) 0000-0000" />
              </div>
            </div>
          </section>
        </div>

        {/* Sensors */}
        <section className="glass mt-8 rounded-3xl p-8" style={{ animation: "fade-up 1s ease-out 0.4s both" }}>
          <h3 className="mb-3 text-sm font-bold tracking-widest neon-text">CONFIGURAÇÃO DOS SENSORES</h3>
          <div className="mb-6 h-px w-full" style={{ background: "linear-gradient(90deg, rgba(0,255,136,0.6), transparent)" }} />
          <div className="space-y-4">
            {sensors.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="rounded-2xl border border-border bg-card/40 p-5 transition-all hover:border-primary/40 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]">
                  <div className="grid items-center gap-4 md:grid-cols-[200px_1fr_1fr_1fr]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: s.color, boxShadow: `0 0 15px ${s.color}40` }}>
                        <Icon className="h-6 w-6" style={{ color: s.color }} />
                      </div>
                      <span className="font-semibold">{s.name}</span>
                    </div>
                    <SensorRange label="ESTÁVEL (VERDE)" color="#00ff88" unit={`Até (${s.unit})`} placeholder={`Ex.: ${s.values[0]}`} />
                    <SensorRange label="ALERTA (AMARELO)" color="#ffd24a" unit={`Até (${s.unit})`} placeholder={`Ex.: ${s.values[1]}`} />
                    <SensorRange label="PERIGO (VERMELHO)" color="#ff5050" unit={`Acima de (${s.unit})`} placeholder={`Ex.: ${s.values[2]}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <button className="neon-btn mt-8 flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold tracking-wide">
            <Lock className="h-5 w-5" /> SALVAR E ACESSAR SISTEMA
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já possui cadastro? <a className="neon-text font-semibold hover:underline" href="#">Fazer login</a>
          </p>
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2"><Shield className="h-4 w-4 neon-text" /> Sistema de Segurança para Cozinha Industrial</div>
          <div className="mt-1">© 2025 - Todos os direitos reservados.</div>
        </footer>
      </main>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      <Input type={type} placeholder={placeholder} className="border-border bg-input/40 focus-visible:ring-primary" />
    </div>
  );
}

function SensorRange({ label, color, unit, placeholder }: { label: string; color: string; unit: string; placeholder: string }) {
  return (
    <div>
      <div className="text-xs font-bold tracking-wider" style={{ color }}>{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{unit}</div>
      <Input placeholder={placeholder} className="mt-1 border-border bg-input/40" />
    </div>
  );
}