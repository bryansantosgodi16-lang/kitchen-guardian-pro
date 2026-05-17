Remover o cabeçalho do card de acesso em `src/components/LoginScreen.tsx`:

- Apagar o `<div className="mb-6 flex items-start gap-3">...</div>` que contém o ícone Shield, o título "ACESSO AO SISTEMA" e o subtítulo "Preencha os dados da empresa...".
- Manter o restante intacto: título "CREDENCIAIS", linha neon, campos Email/Senha e botão "SALVAR E ACESSAR SISTEMA".
- Se `Shield` deixar de ser usado no topo, ele continua sendo usado no footer, então o import permanece.