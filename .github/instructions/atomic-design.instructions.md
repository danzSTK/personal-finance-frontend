---
applyTo: 'src/features/*/components/**/*.tsx, src/shared/components/**/*.tsx'
description: 'Atomic Design methodology for building scalable component systems'
---

# Atomic Design Principles

Sistema de design baseado na metodologia **Atomic Design** de Brad Frost, organizando componentes em 5 níveis hierárquicos.

---

## 🧬 Hierarquia Atomic Design

```
Atoms (Átomos)
  ↓
Molecules (Moléculas)
  ↓
Organisms (Organismos)
  ↓
Templates
  ↓
Pages
```

---

## ⚛️ 1. Atoms (Átomos)

**Definição**: Blocos de construção básicos. Elementos HTML fundamentais que não podem ser quebrados em partes menores sem perder função.

**Exemplos**: Button, Input, Label, Icon, Avatar, Badge

### Regras para Átomos

✅ **PODE:**
- Usar apenas elementos HTML nativos
- Ter props para variantes visuais (size, variant, color)
- Conter estilos (Tailwind classes)
- Ter estados (hover, focus, disabled)

❌ **NÃO PODE:**
- Importar outros componentes customizados
- Conter lógica de negócio
- Fazer chamadas de API
- Gerenciar estado complexo (apenas UI state local)

### Exemplo de Átomo

```typescript
// ✅ CORRETO: Átomo Button
// src/shared/components/atoms/Button.tsx

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
```

### Mais Exemplos de Átomos

```typescript
// src/shared/components/atoms/Input.tsx
export const Input = ({ ...props }) => (
  <input className="rounded border px-3 py-2" {...props} />
);

// src/shared/components/atoms/Label.tsx
export const Label = ({ children, ...props }) => (
  <label className="text-sm font-medium" {...props}>
    {children}
  </label>
);

// src/shared/components/atoms/Badge.tsx
export const Badge = ({ children, variant = 'default' }) => (
  <span className={cn('rounded-full px-2 py-1 text-xs', {
    'bg-blue-100 text-blue-800': variant === 'default',
    'bg-red-100 text-red-800': variant === 'error',
  })}>
    {children}
  </span>
);
```

---

## 🧪 2. Molecules (Moléculas)

**Definição**: Grupos de átomos funcionando juntos como uma unidade. Ainda são relativamente simples.

**Exemplos**: FormField (Label + Input + Error), SearchBar (Input + Icon + Button), CardHeader (Avatar + Title + Subtitle)

### Regras para Moléculas

✅ **PODE:**
- Combinar múltiplos átomos
- Ter props de configuração
- Gerenciar estado UI simples (open/close, focus)
- Usar custom hooks simples

❌ **NÃO PODE:**
- Importar organismos ou templates
- Fazer chamadas de API
- Conter lógica de negócio complexa
- Gerenciar estado global

### Exemplo de Molécula

```typescript
// ✅ CORRETO: Molécula FormField
// src/shared/components/molecules/FormField.tsx

import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
}

export const FormField = ({
  label,
  name,
  type = 'text',
  error,
  required,
  ...inputProps
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={name}
        name={name}
        type={type}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        {...inputProps}
      />
      
      {error && (
        <span id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </span>
      )}
    </div>
  );
};
```

### Mais Exemplos de Moléculas

```typescript
// src/shared/components/molecules/SearchBar.tsx
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Search } from 'lucide-react';

export const SearchBar = ({ onSearch, placeholder }) => {
  const [value, setValue] = useState('');
  
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
      />
      <Button onClick={() => onSearch(value)}>
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
};

// src/shared/components/molecules/CardHeader.tsx
import { Avatar } from '../atoms/Avatar';

export const CardHeader = ({ avatar, title, subtitle }) => (
  <div className="flex items-center gap-3">
    <Avatar src={avatar} alt={title} />
    <div className="flex-1">
      <h3 className="font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);
```

---

## 🧬 3. Organisms (Organismos)

**Definição**: Componentes complexos formados por moléculas e/ou átomos. Representam seções distintas da interface.

**Exemplos**: LoginForm, TransactionCard, Navbar, DataTable, Sidebar

### Regras para Organismos

✅ **PODE:**
- Combinar múltiplas moléculas e átomos
- Conter lógica de negócio
- Fazer chamadas de API (via hooks)
- Gerenciar estado local complexo
- Usar context providers locais

❌ **NÃO PODE:**
- Importar templates ou pages
- Acessar estado global diretamente (use hooks)

### Exemplo de Organismo

```typescript
// ✅ CORRETO: Organismo LoginForm
// src/features/auth/components/organisms/LoginForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/shared/components/atoms/Button';
import { FormField } from '@/shared/components/molecules/FormField';
import { authService } from '../../api/auth.service';
import { loginSchema } from '../../schemas/login.schema';

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Handle success
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      
      <FormField
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />
      
      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};
```

### Mais Exemplos de Organismos

```typescript
// src/features/transactions/components/organisms/TransactionCard.tsx
export const TransactionCard = ({ transaction }) => {
  const { mutate: deleteTransaction } = useMutation(/* ... */);
  
  return (
    <Card>
      <CardHeader
        avatar={transaction.category.icon}
        title={transaction.description}
        subtitle={formatDate(transaction.date)}
      />
      <CardContent>
        <p className="text-2xl font-bold">
          {formatCurrency(transaction.amount)}
        </p>
        <Badge>{transaction.category.name}</Badge>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => deleteTransaction(transaction.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

// src/shared/components/organisms/Navbar.tsx
export const Navbar = () => {
  const { user } = useAuth();
  
  return (
    <nav className="border-b">
      <div className="container flex items-center justify-between h-16">
        <Logo />
        <NavLinks items={navItems} />
        <UserMenu user={user} />
      </div>
    </nav>
  );
};
```

---

## 📄 4. Templates

**Definição**: Layout structures que definem posicionamento de organismos. Sem dados reais, apenas placeholders.

**Exemplos**: DashboardLayout, AuthLayout, SettingsLayout

### Regras para Templates

✅ **PODE:**
- Definir estrutura de layout (grid, flexbox)
- Posicionar organismos
- Usar children/slots pattern
- Ter variantes de layout

❌ **NÃO PODE:**
- Conter dados reais
- Fazer fetch de dados
- Ter lógica de negócio

### Exemplo de Template

```typescript
// ✅ CORRETO: Template DashboardLayout
// src/shared/components/templates/DashboardLayout.tsx

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
}

export const DashboardLayout = ({
  sidebar,
  header,
  content,
  footer,
}: DashboardLayoutProps) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b">{header}</header>
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r overflow-y-auto">
          {sidebar}
        </aside>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {content}
        </main>
      </div>
      
      {/* Footer (opcional) */}
      {footer && (
        <footer className="h-12 border-t flex items-center px-6">
          {footer}
        </footer>
      )}
    </div>
  );
};
```

---

## 📱 5. Pages

**Definição**: Instâncias específicas de templates com dados reais. Onde tudo se junta.

**Exemplos**: DashboardPage, LoginPage, TransactionsPage

### Regras para Pages

✅ **PODE:**
- Usar templates
- Passar dados reais para organismos
- Fazer data fetching
- Gerenciar estado da página
- Usar URL params/query strings

❌ **NÃO PODE:**
- Conter estilos complexos (delegar para componentes)
- Duplicar lógica (extrair para hooks)

### Exemplo de Page

```typescript
// ✅ CORRETO: Page DashboardPage
// src/features/dashboard/pages/DashboardPage.tsx

import { DashboardLayout } from '@/shared/components/templates/DashboardLayout';
import { Navbar } from '@/shared/components/organisms/Navbar';
import { Sidebar } from '@/shared/components/organisms/Sidebar';
import { StatsOverview } from '../components/organisms/StatsOverview';
import { RecentTransactions } from '../components/organisms/RecentTransactions';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../api/dashboard.service';

export const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <DashboardLayout
      header={<Navbar />}
      sidebar={<Sidebar />}
      content={
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <StatsOverview stats={stats} />
          <RecentTransactions />
        </div>
      }
    />
  );
};
```

---

## 📁 Estrutura de Diretórios

```
src/
├── shared/
│   └── components/
│       ├── atoms/
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Label.tsx
│       │   └── Badge.tsx
│       │
│       ├── molecules/
│       │   ├── FormField.tsx
│       │   ├── SearchBar.tsx
│       │   └── CardHeader.tsx
│       │
│       ├── organisms/
│       │   ├── Navbar.tsx
│       │   ├── Sidebar.tsx
│       │   └── DataTable.tsx
│       │
│       └── templates/
│           ├── DashboardLayout.tsx
│           ├── AuthLayout.tsx
│           └── SettingsLayout.tsx
│
└── features/
    ├── auth/
    │   └── components/
    │       ├── atoms/           # Átomos específicos de auth
    │       ├── molecules/       # Moléculas específicas
    │       ├── organisms/       # LoginForm, SignupForm
    │       └── templates/       # AuthPageTemplate
    │
    └── transactions/
        └── components/
            ├── molecules/       # TransactionRow
            ├── organisms/       # TransactionCard, TransactionForm
            └── pages/           # TransactionsPage
```

---

## ✅ Checklist: Como Classificar um Componente?

### É um Átomo?
- [ ] Usa apenas elementos HTML nativos?
- [ ] Não importa outros componentes customizados?
- [ ] Não tem lógica de negócio?
- [ ] Pode ser usado isoladamente?

### É uma Molécula?
- [ ] Combina 2+ átomos?
- [ ] Ainda é relativamente simples?
- [ ] Não faz chamadas de API?
- [ ] Não importa organismos?

### É um Organismo?
- [ ] Combina moléculas e/ou átomos?
- [ ] Tem lógica de negócio?
- [ ] Pode fazer chamadas de API?
- [ ] Representa uma seção completa da UI?

### É um Template?
- [ ] Define estrutura de layout?
- [ ] Usa slots/children pattern?
- [ ] Não contém dados reais?
- [ ] Pode ser reutilizado em múltiplas pages?

### É uma Page?
- [ ] Usa um template?
- [ ] Contém dados reais?
- [ ] Faz data fetching?
- [ ] Representa uma rota específica?

---

## ⚠️ Erros Comuns

### ❌ Átomo importando Molécula

```typescript
// ❌ ERRADO
// atoms/Button.tsx
import { Tooltip } from '../molecules/Tooltip'; // Violação!

export const Button = () => (
  <Tooltip content="Click me">
    <button>...</button>
  </Tooltip>
);

// ✅ CORRETO: Inverter composição
// molecules/TooltipButton.tsx
import { Button } from '../atoms/Button';
import { Tooltip } from '../atoms/Tooltip'; // Ambos átomos agora

export const TooltipButton = () => (
  <Tooltip content="Click me">
    <Button>...</Button>
  </Tooltip>
);
```

### ❌ Molécula com Lógica de Negócio

```typescript
// ❌ ERRADO
// molecules/UserCard.tsx
export const UserCard = ({ userId }) => {
  const { data } = useQuery(['user', userId], fetchUser); // API call!
  
  return <Card>...</Card>;
};

// ✅ CORRETO: Mover para organismo
// organisms/UserCard.tsx
export const UserCard = ({ userId }) => {
  const { data } = useQuery(['user', userId], fetchUser);
  
  return (
    <Card>
      <UserCardContent user={data} /> {/* Molécula recebe dados */}
    </Card>
  );
};

// molecules/UserCardContent.tsx
export const UserCardContent = ({ user }) => (
  <div>
    <Avatar src={user.avatar} />
    <h3>{user.name}</h3>
  </div>
);
```

---

## 🎯 Benefícios do Atomic Design

✅ **Reusabilidade**: Componentes pequenos são facilmente reutilizados  
✅ **Consistência**: Design system emergente naturalmente  
✅ **Testabilidade**: Componentes isolados são fáceis de testar  
✅ **Manutenibilidade**: Hierarquia clara facilita refatoração  
✅ **Escalabilidade**: Fácil adicionar novos componentes  
✅ **Documentação**: Estrutura auto-documentada  

---

**Referências:**
- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)

**Última atualização**: 2026-04-05
