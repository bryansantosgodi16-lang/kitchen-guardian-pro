import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IntroAnimation } from "@/components/IntroAnimation";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Sistema de Segurança para Cozinha Industrial" },
      { name: "description", content: "Monitoramento em tempo real de calor, fumaça, movimento e gás GLP para cozinhas industriais." },
    ],
  }),
});

function Index() {
  const [showIntro, setShowIntro] = useState(true);
  return (
    <>
      <Dashboard />
      {showIntro && <IntroAnimation onDone={() => setShowIntro(false)} />}
    </>
  );
}
