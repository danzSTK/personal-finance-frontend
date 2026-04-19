# Personal Finance Frontend - GitHub Copilot Instructions

## 🎯 Project Overview

**Personal Finance Frontend** é uma aplicação React + TypeScript para gestão de finanças pessoais, construída com princípios de **Atomic Design**, **Feature-Based Architecture** e **Silicon Valley Best Practices**.

### Tech Stack

- **Build**: Vite 5.x
- **Framework**: React 18.x + TypeScript
- **Routing**: React Router 6.x
- **State**: Zustand (global) + TanStack Query (server)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **UI**: Tailwind CSS + Shadcn/UI
- **Masks**: IMask

---

## 🏗️ Architecture Principles

### 1. Feature-Based Structure

Organize código por **feature** (não por tipo técnico):

```
✅ CORRETO:
features/auth/
  ├── api/
  ├── components/
  ├── hooks/
  ├── stores/
  └── types/

❌ ERRADO:
components/
  ├── AuthForm.tsx
  ├── TransactionCard.tsx
hooks/
  ├── useAuth.ts
  ├── useTransactions.ts
```

**Razão**: Melhor coesão, facilita manutenção e remoção de features.

### 2. Atomic Design

Organize componentes por **complexidade**:

- **Atoms**: Botões, inputs, labels (indivisíveis)
- **Molecules**: Form fields (label + input + error)
- **Organisms**: Forms completos, cards complexos
- **Templates**: Layout structures
- **Pages**: Composição final com data fetching

**Regra de ouro**: Componente **não pode** importar de nível superior na hierarquia.

```typescript
// ✅ Átomo pode usar apenas primitivos
// atoms/Button.tsx
export const Button = ({ children, ...props }) => (
  <button className="..." {...props}>{children}</button>
);

// ✅ Molécula pode usar átomos
// molecules/FormField.tsx
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

// ✅ Organismo pode usar átomos e moléculas
// organisms/LoginForm.tsx
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';

// ❌ Átomo NÃO pode usar molécula
// atoms/Button.tsx
import { FormField } from '../molecules/FormField'; // ERRADO!
```

### 3. Separation of Concerns

```typescript
// ✅ CORRETO: Separação clara de responsabilidades

// API layer (features/auth/api/auth.service.ts)
export const authService = {
  async login(credentials: LoginDto) {
    const { data } = await axios.post('/auth/sign-in', credentials);
    return data;
  }
};

// Store layer (features/auth/stores/auth.store.ts)
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));

// Hook layer (features/auth/hooks/useAuth.ts)
export const useAuth = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe
  });
  return { user, isLoading, isAuthenticated: !!user };
};

// Component layer (features/auth/components/organisms/LoginForm.tsx)
export const LoginForm = () => {
  const loginMutation = useMutation({ mutationFn: authService.login });
  // Apenas UI e composição
};
```

---

## 📁 File Organization Rules

### Component Files

```typescript
// ✅ CORRETO: Um componente por arquivo
// features/auth/components/atoms/Button.tsx
export const Button = () => { ... };

// ✅ CORRETO: Export named, não default
export { Button } from './Button';

// ❌ ERRADO: Múltiplos componentes no mesmo arquivo
export const Button = () => { ... };
export const Input = () => { ... };

// ❌ ERRADO: Export default
export default Button;
```

### Index Files

Use `index.ts` para **exports públicos** da feature:

```typescript
// features/auth/index.ts
export { LoginForm } from './components/organisms/LoginForm';
export { useAuth } from './hooks/useAuth';
export type { AuthUser } from './types';
// NÃO exporte internals (stores, utils privados)
```

### Naming Conventions

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `LoginForm.tsx` |
| Hooks | camelCase com `use` | `useAuth.ts` |
| Stores | camelCase com `Store` | `authStore.ts` |
| Utils | camelCase | `formatCurrency.ts` |
| Types | PascalCase com `Type` suffix | `AuthUser.type.ts` |
| Constants | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |

---

## 🎨 UI/UX Best Practices

### 1. Tailwind + Shadcn/UI

```typescript
// ✅ CORRETO: Combine Shadcn com customizações
import { Button } from '@/shared/lib/ui/button';

<Button variant="default" size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
  Login
</Button>

// ✅ Use cn() para merge de classes
import { cn } from '@/shared/utils/cn';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

### 2. Responsive Design

```typescript
// ✅ Mobile-first approach
<div className="
  flex flex-col gap-4        // Mobile (default)
  md:flex-row md:gap-6       // Tablet
  lg:gap-8                   // Desktop
">
```

### 3. Accessibility

```typescript
// ✅ CORRETO: Sempre adicione aria-labels e keyboard support
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label="Close dialog"
  className="..."
>

// ✅ Use semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>
```

---

## 🔐 Authentication Patterns

### Protected Routes

```typescript
// app/routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
};
```

### Axios Interceptors

```typescript
// shared/config/axios.ts
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios(error.config);
    }
    throw error;
  }
);
```

---

## 📦 State Management

### When to Use What?

| Use Case | Tool | Example |
|----------|------|---------|
| Server state | TanStack Query | User data, transactions |
| Global client state | Zustand | Theme, sidebar open/close |
| Local component state | useState | Form inputs, toggles |
| Form state | React Hook Form | Login form, create transaction |

### TanStack Query Patterns

```typescript
// ✅ CORRETO: Queries para GET
const { data, isLoading, error } = useQuery({
  queryKey: ['transactions', filters],
  queryFn: () => transactionService.list(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// ✅ CORRETO: Mutations para POST/PUT/DELETE
const createMutation = useMutation({
  mutationFn: transactionService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    toast.success('Transaction created!');
  },
});
```

### Zustand Patterns

```typescript
// ✅ CORRETO: Store pequena e focada
interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
}));

// ❌ ERRADO: Store gigante com tudo
// Prefira múltiplas stores pequenas
```

---

## 🧪 Testing Guidelines

### Unit Tests (Vitest)

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('returns authenticated user', async () => {
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

---

## 🚀 Performance

### Code Splitting

```typescript
// ✅ Lazy load pages
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'));

<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Memoization

```typescript
// ✅ Use useMemo para cálculos pesados
const expensiveValue = useMemo(
  () => calculateComplexValue(data),
  [data]
);

// ✅ Use useCallback para funções em props
const handleClick = useCallback(
  () => { /* ... */ },
  [dependency]
);
```

---

## 📝 TypeScript Best Practices

### Type Safety

```typescript
// ✅ CORRETO: Tipos explícitos em APIs
interface LoginDto {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
}

export const login = async (dto: LoginDto): Promise<AuthResponse> => {
  const { data } = await axios.post<AuthResponse>('/auth/sign-in', dto);
  return data;
};

// ❌ ERRADO: any ou tipos implícitos
export const login = async (dto: any) => { ... }
```

### Shared Types

```typescript
// shared/types/api.type.ts
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}
```

---

## 🎯 Form Handling

### React Hook Form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    // Type-safe data
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
};
```

---

## 🌍 Environment Variables

```typescript
// shared/config/env.ts
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
} as const;

// Usage
import { env } from '@/shared/config/env';
axios.defaults.baseURL = env.apiUrl;
```

---

## ⚠️ Common Pitfalls to Avoid

❌ **Don't:**
- Use `any` type
- Export default components
- Mix business logic in components
- Fetch data directly in components (use React Query)
- Duplicate code between features
- Ignore accessibility
- Commit sensitive data

✅ **Do:**
- Use TypeScript strict mode
- Keep components small (<200 lines)
- Extract reusable logic to hooks
- Use composition over inheritance
- Write tests for critical paths
- Follow DRY principle
- Use semantic HTML

---

## 📚 Quick Reference

### Import Aliases

```typescript
@/            → src/
@/features    → src/features
@/shared      → src/shared
@/assets      → src/assets
```

### Commands

```bash
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview build
npm run lint        # ESLint
npm run format      # Prettier
npm test           # Run tests
```

---

**Last Updated**: 2026-04-05  
**Version**: 1.0.0
