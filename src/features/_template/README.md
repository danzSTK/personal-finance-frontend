# Feature Template

Este é um template para criar novas features no projeto.

## Como usar

1. Copie esta pasta `_template`
2. Renomeie para o nome da sua feature (ex: `transactions`, `budgets`, etc)
3. Atualize os tipos em `types/index.ts`
4. Implemente os serviços API em `api/index.ts`
5. Configure o store Zustand em `stores/index.ts` (se necessário)
6. Crie hooks customizados em `hooks/index.ts`
7. Desenvolva componentes seguindo Atomic Design em `components/`

## Estrutura

```
feature-name/
├── api/              # Serviços de API
├── components/       # Componentes (Atomic Design)
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── hooks/           # React hooks customizados
├── stores/          # Zustand stores
├── types/           # TypeScript types
└── utils/           # Funções utilitárias
```

## Convenções

- Use nomes descritivos e em inglês
- Mantenha componentes pequenos e focados
- Sempre adicione tipos TypeScript
- Documente código complexo
- Use hooks do React Query para dados assíncronos
- Use Zustand para estado local da feature (se necessário)
