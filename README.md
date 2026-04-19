# Personal Finance App - Frontend

Frontend da aplicação de finanças pessoais desenvolvido com Vite, React e TypeScript.

## 🚀 Stack Tecnológica

- **Vite 5.x** - Build tool e dev server
- **React 18.x** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **React Router 6.x** - Roteamento
- **TanStack Query** - Gerenciamento de estado assíncrono
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **IMask** - Máscaras de input
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/UI** - Componentes UI

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Configuração da aplicação
│   ├── providers/         # Context providers (React Query, etc)
│   ├── routes/           # Configuração de rotas
│   └── App.tsx           # Componente raiz
│
├── features/             # Features organizadas por domínio (DDD-like)
│   ├── auth/            # Feature de autenticação
│   │   ├── api/        # Chamadas API
│   │   ├── components/ # Componentes (Atomic Design)
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   ├── organisms/
│   │   │   └── templates/
│   │   ├── hooks/      # React hooks customizados
│   │   ├── stores/     # Zustand stores
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Funções utilitárias
│   │
│   └── _template/      # Template para novas features
│
├── shared/             # Código compartilhado
│   ├── components/    # Componentes globais (Atomic Design)
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── hooks/        # Hooks compartilhados
│   ├── lib/         # Shadcn components
│   ├── utils/       # Utilitários (formatters, masks, etc)
│   ├── config/      # Configurações (axios, env)
│   └── types/       # Types globais
│
└── assets/          # Assets estáticos
```

## 🎨 Atomic Design

O projeto segue a metodologia Atomic Design:

- **Atoms**: Componentes básicos (Button, Input, Label)
- **Molecules**: Combinações simples de atoms (FormField, SearchBar)
- **Organisms**: Componentes complexos (LoginForm, Navigation)
- **Templates**: Layouts de página (LoginTemplate, DashboardTemplate)
- **Pages**: Páginas completas com dados reais

## 🛠️ Scripts Disponíveis

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview

# Lint
npm run lint

# Format com Prettier
npm run format
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080/api
```

### Configurações do Vite

O Vite está configurado com:
- Path alias `@/` apontando para `src/`
- Proxy para `/api` redirecionando para `http://localhost:8080`
- Porta do dev server: 3000

## 🔐 Autenticação

O sistema de autenticação inclui:

- Login com email/senha
- Refresh token automático
- Proteção de rotas
- Interceptor Axios para injetar token
- Persistência do estado de auth (localStorage)

## 📦 Principais Bibliotecas

### Gerenciamento de Estado

- **Zustand**: Estado global (auth, user)
- **TanStack Query**: Cache e sincronização de dados do servidor
  - Retry: 1 tentativa
  - Stale time: 5 minutos
  - Refetch on window focus: desabilitado

### Formulários e Validação

- **React Hook Form**: Gerenciamento performático de formulários
- **Zod**: Schemas de validação type-safe
- **IMask**: Máscaras para inputs (CPF, telefone, moeda, etc)

### UI Components (Shadcn/UI)

Componentes pré-configurados:
- Button
- Input
- Label
- Card
- Toast
- E mais...

Adicione novos componentes com:
```bash
npx shadcn-ui@latest add [component-name]
```

## 🎯 Boas Práticas

1. **Colocação**: Organize código por feature, não por tipo
2. **Atomic Design**: Mantenha componentes modulares e reutilizáveis
3. **Type Safety**: Use TypeScript em todos os arquivos
4. **Validação**: Sempre valide inputs com Zod
5. **Error Handling**: Trate erros em todas as chamadas API
6. **Código Limpo**: Use ESLint e Prettier

## 🔧 Adicionando uma Nova Feature

1. Copie o template em `src/features/_template`
2. Renomeie para o nome da feature
3. Implemente os tipos em `types/`
4. Crie serviços API em `api/`
5. Configure stores Zustand em `stores/`
6. Crie hooks customizados em `hooks/`
7. Desenvolva componentes seguindo Atomic Design
8. Adicione rotas em `src/app/routes/`

## 📝 Exemplo de Componente

```tsx
// src/features/example/components/organisms/ExampleForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/lib/button'
import { Input } from '@/shared/lib/input'

const schema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
})

export function ExampleForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Input {...register('name')} />
      <Button type="submit">Enviar</Button>
    </form>
  )
}
```

## 🤝 Contribuindo

1. Siga a estrutura de pastas definida
2. Mantenha os padrões de código (ESLint/Prettier)
3. Adicione types para todo código TypeScript
4. Documente componentes e funções complexas
5. Teste suas alterações

## 📄 Licença

MIT
