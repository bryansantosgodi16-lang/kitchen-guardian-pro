import logo from "@/assets/logo.jpeg";
import { Lock, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background" style={{ animation: "fade-up 0.9s ease-out" }}>
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

      <main className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8 sm:max-w-lg sm:px-6 sm:py-10 md:max-w-xl lg:max-w-2xl">
        <div className="w-full">
          <section className="glass rounded-2xl p-5 sm:rounded-3xl sm:p-8 lg:p-10" style={{ animation: "fade-up 1s ease-out 0.25s both" }}>
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-xl p-2 neon-border"><Shield className="h-5 w-5 sm:h-6 sm:w-6 neon-text" /></div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-wide">ACESSO AO SISTEMA</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Preencha os dados da empresa para acessar o sistema.</p>
              </div>
            </div>

            <h3 className="mb-3 text-sm font-bold tracking-widest neon-text">CREDENCIAIS</h3>
            <div className="mb-2 h-px w-full" style={{ background: "linear-gradient(90deg, rgba(0,255,136,0.6), transparent)" }} />
            <div className="grid gap-4 pt-4">
              <Field label="Email" placeholder="exemplo@empresa.com" type="email" />
              <Field label="Senha" placeholder="••••••••" type="password" />
            </div>

            <button className="neon-btn mt-6 sm:mt-8 flex w-full items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl py-3 sm:py-4 text-base sm:text-lg font-bold tracking-wide">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" /> SALVAR E ACESSAR SISTEMA
            </button>
          </section>
        </div>

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