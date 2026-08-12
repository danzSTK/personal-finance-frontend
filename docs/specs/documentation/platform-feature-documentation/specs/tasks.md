---
area: documentation
feature: platform-feature-documentation
type: spec-tasks
status: current
related:
  - ./requirements.md
  - ./design.md
  - ./decisions.md
---

# Tarefas — padrão documental de features da plataforma

## Regra de execução

Nenhuma tarefa abaixo começa antes da aprovação explícita de
`requirements.md`, `design.md` e deste arquivo. A documentação de outros módulos
não pode ser adicionada a esta entrega sem atualizar escopo e obter nova
aprovação.

## 0. Aprovação e inventário

- [x] 0.1 Revisar e aprovar a spec com o usuário.
- [x] 0.2 Inventariar novamente specs, docs auth, source auth e integrações
      backend antes da migração.
- [x] 0.3 Registrar mudanças de escopo/estrutura em `decisions.md`.

## 1. Criar a skill local

- [x] 1.1 Executar `init_skill.py platform-feature-documentation` em
      `.agents/skills` com recurso `references` e metadata de interface.
- [x] 1.2 Escrever `SKILL.md` conciso com triggers e workflow imperativo.
- [x] 1.3 Criar `references/documentation-files.md` com contratos dos três
      arquivos e frontmatter.
- [x] 1.4 Gerar/revisar `agents/openai.yaml`.
- [x] 1.5 Executar `quick_validate.py` e corrigir todos os erros.
- [x] 1.6 Fazer um uso de validação contra uma feature auth existente e ajustar
      instruções se o resultado for ambíguo.

## 2. Atualizar governança do repositório

- [x] 2.1 Adicionar a skill e a documentação viva às regras de `AGENTS.md`.
- [x] 2.2 Explicitar diferença entre spec de implementação e documentação viva.
- [x] 2.3 Explicitar atualização obrigatória na mesma entrega de mudanças de
      fluxo, dependência, endpoint, componente ou decisão.

## 3. Normalizar specs de auth

- [x] 3.1 Migrar `auth-feature` para `auth/core/specs`.
- [x] 3.2 Migrar `auth-shell-v2` para
      `auth/authenticated-shell-v2/specs`.
- [x] 3.3 Migrar `email-verification` para
      `auth/email-verification/specs`.
- [x] 3.4 Criar arquivos ausentes com status histórico/reconstruído, sem
      inventar aprovação.
- [x] 3.5 Corrigir links e marcar contratos antigos incompatíveis com cookies
      HttpOnly/`GET /users/me` como históricos.

## 4. Normalizar demais specs legadas sem documentar módulos

- [x] 4.1 Migrar as duas specs de accounts para features separadas.
- [x] 4.2 Migrar a spec responsive de categories para seu módulo.
- [x] 4.3 Migrar a spec monolítica da tela de transactions.
- [x] 4.4 Manter transfer no caminho atual e preservar status/aprovação.
- [x] 4.5 Validar que a migração não criou documentação viva de accounts,
      categories ou transactions.

## 5. Documentar authentication

- [x] 5.1 Criar as árvores `decisions/`, `flow/` e `components/` de sign-in.
- [x] 5.2 Criar as árvores `decisions/`, `flow/` e `components/` de sign-up.
- [x] 5.3 Criar as árvores `decisions/`, `flow/` e `components/` de OAuth Google.
- [x] 5.4 Reconciliar formulários, schemas, redirects, cookies, errors e
      componentes reutilizados.

## 6. Documentar fluxos complementares de auth

- [x] 6.1 Criar documentação de email verification.
- [x] 6.2 Criar documentação de providers.
- [x] 6.3 Criar documentação de sessions/logout/refresh.
- [x] 6.4 Criar documentação de profile, username e avatar.
- [x] 6.5 Criar documentação do authenticated shell, routing e settings.

## 7. Documentar change-password

- [x] 7.1 Migrar os documentos atuais para as três árvores obrigatórias.
- [x] 7.2 Após implementação, revisar contra código/testes e mudar para
      `current`.
- [x] 7.3 Registrar provider gate, política, confirmação, endpoint, erros,
      retry, sessão pós-sucesso e componentes próprios/reutilizados.
- [x] 7.4 Relacionar decisões de change-password às decisões de sessions,
      providers e authentication.

## 8. Validar cobertura e coerência

- [x] 8.1 Conferir presença de todos os arquivos esperados.
- [x] 8.2 Conferir links relativos e ausência de referências a caminhos removidos.
- [x] 8.3 Conferir matriz completa de endpoints de auth.
- [x] 8.4 Buscar contratos obsoletos em documentos `current`.
- [x] 8.5 Verificar que decisões contraditórias possuem relação de substituição.
- [x] 8.6 Verificar que components distingue próprios, shared e cross-feature.
- [x] 8.7 Gerar resumo de cobertura e gaps restantes do módulo auth.

## 9. Validação final

- [x] 9.1 Executar `git diff --check`.
- [x] 9.2 Executar lint/build se código ou configuração forem alterados.
- [x] 9.3 Revisar critérios de aceite da spec.
- [x] 9.4 Atualizar status das tasks e decisões conforme a execução real.

## Evidências de conclusão

- Skill criada pelo `init_skill.py`, aplicada sobre auth e aprovada pelo
  `quick_validate.py`.
- Formato corrigido durante a execução: documentação viva usa diretórios
  `decisions/`, `flow/` e `components/`; cada decisão possui `Problema`,
  `Decisão` e `Consequência`.
- 29 documentos vivos de auth: 11 decisões, 9 fluxos e 9 documentos de
  componentes, todos `current` e com links relativos válidos.
- Sign-in, sign-up, OAuth Google, email verification, providers, sessions,
  profile, authenticated shell e change-password estão cobertos.
- Sete specs legadas foram normalizadas; cada destino contém os quatro arquivos
  obrigatórios e status histórico/reconstruído explícito. Transfer permaneceu em
  seu módulo e teve apenas links relativos corrigidos.
- Todas as famílias de endpoints constantes de auth aparecem em `flow/`.
- Nenhuma documentação viva foi criada para accounts, categories ou
  transactions.
- Buscas por contratos obsoletos confirmaram apenas negações explícitas de
  Bearer/storage, token em query e `/auth/me` nos documentos atuais.
- Todos os links Markdown/frontmatter resolvem e `git diff --check` passa.
- `npm run lint` e `npm run build` não foram repetidos: esta spec alterou apenas
  Markdown, `AGENTS.md` e a skill local; os checks já haviam passado na entrega
  imediatamente anterior de auth.

## Gaps conhecidos

- `notifications` e `preferences` permanecem placeholders do authenticated
  shell, não features documentadas como implementadas.
- Profile continua fisicamente em `src/features/auth`, embora consuma o módulo
  backend `users`; a decisão atual registra esse limite para uma extração futura.
- Specs históricas preservam intenção antiga e não são fonte operacional; a
  documentação viva e os contratos backend atuais prevalecem.
