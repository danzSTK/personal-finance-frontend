# Auth Feature - Implementation Tasks

## 📋 Overview

Este documento detalha as tarefas necessárias para implementar a feature de autenticação completa, seguindo a especificação em `design.md`. As tarefas estão organizadas em ordem de dependência.

## 🗂️ Estrutura de Implementação

### Fase 1: Foundation (Types & Configuration)

#### Task 1.1: Criar TypeScript Types
**Prioridade:** Alta | **Estimativa:** 1-2h

**Arquivos:**
- `src/features/auth/types/auth.types.ts`
- `src/features/auth/types/oauth.types.ts`

**Requisitos:**
```typescript
// auth.types.ts
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  providers: AuthProvider[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthProvider {
  provider: 'email' | 'google' | 'github';
  providerId: string;
  connectedAt: string;
}

export interface SignUpDto {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Session {
  jti: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location?: {
    city: string;
    country: string;
  };
  lastActivityAt: string;
  createdAt: string;
  isCurrent: boolean;
}

// oauth.types.ts
export type OAuthProvider = 'google' | 'github';

export interface OAuthState {
  provider: OAuthProvider;
  redirectUrl: string;
  state: string;
}

export interface OAuthCallbackParams {
  accessToken?: string;
  error?: string;
  error_description?: string;
}
```

**Critérios de Sucesso:**
- [ ] Todos os tipos cobrem 100% dos contratos da API
- [ ] Tipos são exportados corretamente
- [ ] TypeScript não reporta erros

---

#### Task 1.2: Configurar Axios Client
**Prioridade:** Alta | **Estimativa:** 2-3h | **Depende de:** 1.1

**Arquivo:**
- `src/features/auth/api/auth.api.ts`

**Requisitos:**
```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Envia cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor: adiciona Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh token em 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Aguarda refresh em andamento
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post<AuthResponse>('/auth/refresh');
        const newToken = data.accessToken;

        sessionStorage.setItem('accessToken', newToken);

        // Processa fila de requests pendentes
        failedQueue.forEach(({ resolve }) => resolve(newToken));
        failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(({ reject }) => reject(refreshError));
        failedQueue = [];

        // Refresh falhou, desloga usuário
        sessionStorage.clear();
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

**Critérios de Sucesso:**
- [ ] Axios client configurado com baseURL
- [ ] Interceptor de request adiciona Bearer token
- [ ] Interceptor de response trata 401 com refresh
- [ ] Queue pattern evita race conditions
- [ ] Cookies são enviados (withCredentials: true)

---

#### Task 1.3: Criar Zod Schemas
**Prioridade:** Alta | **Estimativa:** 1-2h | **Depende de:** 1.1

**Arquivo:**
- `src/features/auth/utils/validation.ts`

**Requisitos:**
```typescript
import { z } from 'zod';

export const signUpSchema = z.object({
  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters'),
  
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters'),
});

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const linkEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type LinkEmailFormData = z.infer<typeof linkEmailSchema>;
```

**Critérios de Sucesso:**
- [ ] Schemas cobrem todas as validações do backend
- [ ] Mensagens de erro são claras e em português (se aplicável)
- [ ] Types são inferidos corretamente com z.infer

---

### Fase 2: State Management

#### Task 2.1: Criar Auth Store (Zustand)
**Prioridade:** Alta | **Estimativa:** 2-3h | **Depende de:** 1.1

**Arquivo:**
- `src/features/auth/stores/auth.store.ts`

**Requisitos:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken) => {
        sessionStorage.setItem('accessToken', accessToken);
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        sessionStorage.clear();
        localStorage.setItem('auth_logout', Date.now().toString());
        localStorage.removeItem('auth_logout');
        
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);

// Sync logout entre abas
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_logout') {
      useAuthStore.getState().clearAuth();
      window.location.href = '/sign-in';
    }
  });
}
```

**Critérios de Sucesso:**
- [ ] Store persiste em sessionStorage
- [ ] Logout sincroniza entre abas abertas
- [ ] accessToken também armazenado em sessionStorage
- [ ] isLoading controla estados de carregamento

---

#### Task 2.2: Configurar TanStack Query
**Prioridade:** Alta | **Estimativa:** 1-2h

**Arquivos:**
- `src/features/auth/api/queries.ts`
- `src/features/auth/api/mutations.ts`

**Requisitos (queries.ts):**
```typescript
import { useQuery } from '@tanstack/react-query';
import api from './auth.api';
import type { User, Session } from '../types/auth.types';

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>('/auth/me');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Session[] }>('/auth/sessions');
      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
```

**Requisitos (mutations.ts):**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from './auth.api';
import type { 
  SignUpDto, 
  SignInDto, 
  AuthResponse 
} from '../types/auth.types';
import { useAuthStore } from '../stores/auth.store';

export const useSignUp = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (dto: SignUpDto) => {
      const { data } = await api.post<{ data: AuthResponse }>('/auth/sign-up', dto);
      return data.data;
    },
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
    },
  });
};

export const useSignIn = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (dto: SignInDto) => {
      const { data } = await api.post<{ data: AuthResponse }>('/auth/sign-in', dto);
      return data.data;
    },
    onSuccess: (response) => {
      setAuth(response.user, response.accessToken);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jti: string) => {
      await api.delete(`/auth/sessions/${jti}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useLinkEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: { email: string; password: string }) => {
      const { data } = await api.post('/auth/providers/link/email', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
```

**Critérios de Sucesso:**
- [ ] Queries e mutations cobrem todos os endpoints
- [ ] Cache configurado adequadamente
- [ ] Mutations invalidam queries relacionadas
- [ ] setAuth atualiza store em sign-up/sign-in

---

### Fase 3: Atomic Design Components

#### Task 3.1: Criar Atoms
**Prioridade:** Alta | **Estimativa:** 3-4h | **Depende de:** 1.1

**Arquivos:**
- `src/features/auth/components/atoms/Input.tsx`
- `src/features/auth/components/atoms/Label.tsx`
- `src/features/auth/components/atoms/Button.tsx`
- `src/features/auth/components/atoms/ErrorMessage.tsx`
- `src/features/auth/components/atoms/Spinner.tsx`

**Exemplo (Input.tsx):**
```tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  prefixIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, prefixIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {prefixIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border px-4 py-2.5',
            'transition-colors duration-200',
            'focus:outline-hidden focus:ring-2 focus:ring-brand focus:border-transparent',
            prefixIcon && 'pl-10',
            error
              ? 'border-destructive focus:ring-destructive'
              : 'border-app-border hover:border-brand',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Critérios de Sucesso:**
- [ ] Atoms não importam custom components
- [ ] Apenas HTML/SVG primitivos
- [ ] Props são type-safe
- [ ] Acessibilidade (ARIA, keyboard)
- [ ] Variants com CVA quando necessário

---

#### Task 3.2: Criar Molecules
**Prioridade:** Alta | **Estimativa:** 3-4h | **Depende de:** 3.1

**Arquivos:**
- `src/features/auth/components/molecules/FormField.tsx`
- `src/features/auth/components/molecules/SocialButton.tsx`
- `src/features/auth/components/molecules/PasswordStrength.tsx`
- `src/features/auth/components/molecules/Divider.tsx`

**Exemplo (FormField.tsx):**
```tsx
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';
import { ErrorMessage } from '../atoms/ErrorMessage';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = ({
  label,
  error,
  helperText,
  required,
  id,
  ...inputProps
}: FormFieldProps) => {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <Input
        id={inputId}
        error={!!error}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...inputProps}
      />
      {error && <ErrorMessage id={`${inputId}-error`}>{error}</ErrorMessage>}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
```

**Critérios de Sucesso:**
- [ ] Molecules combinam atoms
- [ ] Sem business logic (apenas UI)
- [ ] Props bem definidas
- [ ] Acessibilidade completa

---

#### Task 3.3: Criar Organisms
**Prioridade:** Alta | **Estimativa:** 6-8h | **Depende de:** 3.2, 2.2

**Arquivos:**
- `src/features/auth/components/organisms/SignUpForm.tsx`
- `src/features/auth/components/organisms/SignInForm.tsx`
- `src/features/auth/components/organisms/SessionCard.tsx`
- `src/features/auth/components/organisms/SessionsList.tsx`
- `src/features/auth/components/organisms/ProviderCard.tsx`

**Exemplo (SignUpForm.tsx):**
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';

import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { useSignUp } from '../../api/mutations';
import { signUpSchema, SignUpFormData } from '../../utils/validation';

export const SignUpForm = () => {
  const navigate = useNavigate();
  const { mutate: signUp, isPending, error } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = (data: SignUpFormData) => {
    signUp(data, {
      onSuccess: () => {
        navigate('/dashboard');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Username"
        {...register('userName')}
        error={errors.userName?.message}
        prefixIcon={<User className="h-4 w-4" />}
        disabled={isPending}
      />

      <FormField
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        prefixIcon={<Mail className="h-4 w-4" />}
        disabled={isPending}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="First Name"
          {...register('firstName')}
          error={errors.firstName?.message}
          disabled={isPending}
        />
        <FormField
          label="Last Name"
          {...register('lastName')}
          error={errors.lastName?.message}
          disabled={isPending}
        />
      </div>

      <FormField
        label="Password"
        type="password"
        {...register('password')}
        error={errors.password?.message}
        prefixIcon={<Lock className="h-4 w-4" />}
        disabled={isPending}
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
};
```

**Critérios de Sucesso:**
- [ ] Organisms podem ter business logic
- [ ] Integrados com React Hook Form + Zod
- [ ] Integrados com TanStack Query mutations
- [ ] Loading, error, success states
- [ ] Navegação após sucesso

---

#### Task 3.4: Criar Templates
**Prioridade:** Média | **Estimativa:** 2-3h | **Depende de:** 3.3

**Arquivos:**
- `src/features/auth/components/templates/AuthLayout.tsx`

**Exemplo:**
```tsx
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  illustration?: React.ReactNode;
}

export const AuthLayout = ({
  children,
  title,
  subtitle,
  illustration,
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>

      {/* Right side - Illustration (desktop only) */}
      {illustration && (
        <div className="hidden lg:block lg:flex-1 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="h-full flex items-center justify-center p-12">
            {illustration}
          </div>
        </div>
      )}
    </div>
  );
};
```

**Critérios de Sucesso:**
- [ ] Layout responsivo (mobile/desktop)
- [ ] Slots para children/illustration
- [ ] Sem data ou business logic

---

### Fase 4: Pages & Routing

#### Task 4.1: Criar Pages
**Prioridade:** Alta | **Estimativa:** 4-5h | **Depende de:** 3.4

**Arquivos:**
- `src/features/auth/pages/SignUpPage.tsx`
- `src/features/auth/pages/SignInPage.tsx`
- `src/features/auth/pages/OAuthCallbackPage.tsx`
- `src/features/auth/pages/SessionsPage.tsx`

**Exemplo (SignUpPage.tsx):**
```tsx
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/templates/AuthLayout';
import { SignUpForm } from '../components/organisms/SignUpForm';
import { Divider } from '../components/molecules/Divider';
import { SocialButton } from '../components/molecules/SocialButton';

export const SignUpPage = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your finances today"
      illustration={<img src="/auth-illustration.svg" alt="" />}
    >
      <SignUpForm />

      <Divider text="OR" />

      <SocialButton provider="google" />

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
```

**Critérios de Sucesso:**
- [ ] Pages combinam templates + organisms
- [ ] Navegação entre páginas funcional
- [ ] SEO (title, meta tags)
- [ ] Loading states

---

#### Task 4.2: Configurar React Router
**Prioridade:** Alta | **Estimativa:** 2-3h | **Depende de:** 4.1

**Arquivo:**
- `src/app/routes/auth.routes.tsx`

**Requisitos:**
```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { SignInPage } from '@/features/auth/pages/SignInPage';
import { OAuthCallbackPage } from '@/features/auth/pages/OAuthCallbackPage';
import { SessionsPage } from '@/features/auth/pages/SessionsPage';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export const AuthRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Se já autenticado, redireciona para dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route path="/sessions" element={<SessionsPage />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
};
```

**Critérios de Sucesso:**
- [ ] Rotas protegidas (redirect se não autenticado)
- [ ] Rotas públicas (redirect se autenticado)
- [ ] 404 handling

---

### Fase 5: Hooks & Utilities

#### Task 5.1: Criar Custom Hooks
**Prioridade:** Média | **Estimativa:** 3-4h | **Depende de:** 2.1, 2.2

**Arquivos:**
- `src/features/auth/hooks/useAuth.ts`
- `src/features/auth/hooks/useOAuthCallback.ts`

**Exemplo (useAuth.ts):**
```tsx
import { useAuthStore } from '../stores/auth.store';
import { useUser } from '../api/queries';
import { useLogout } from '../api/mutations';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();
  const { data: fetchedUser, isLoading } = useUser({
    enabled: isAuthenticated,
  });
  const { mutate: logoutMutation } = useLogout();

  const logout = () => {
    logoutMutation();
  };

  return {
    user: fetchedUser || user,
    accessToken,
    isAuthenticated,
    isLoading,
    logout,
  };
};
```

**Critérios de Sucesso:**
- [ ] Hook centraliza lógica de autenticação
- [ ] Combina store + queries
- [ ] Interface simples para componentes

---

#### Task 5.2: Criar Utilities
**Prioridade:** Baixa | **Estimativa:** 2-3h

**Arquivos:**
- `src/features/auth/utils/token.utils.ts`
- `src/features/auth/utils/oauth.utils.ts`
- `src/features/auth/utils/device.utils.ts`

**Exemplo (token.utils.ts):**
```typescript
import { jwtDecode } from 'jwt-decode';

export const decodeToken = (token: string) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  return Date.now() >= decoded.exp * 1000;
};

export const getTokenExpiration = (token: string): Date | null => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;

  return new Date(decoded.exp * 1000);
};
```

**Critérios de Sucesso:**
- [ ] Utils são pure functions
- [ ] Bem testados
- [ ] Type-safe

---

### Fase 6: Polish & Optimization

#### Task 6.1: Implementar Loading States
**Prioridade:** Média | **Estimativa:** 2-3h

**Componentes:**
- `SignUpForm` - skeleton durante submit
- `SignInForm` - spinner no botão
- `SessionsList` - skeleton cards
- `OAuthCallbackPage` - fullscreen spinner

**Critérios de Sucesso:**
- [ ] Todos os estados assíncronos têm feedback visual
- [ ] Skeletons seguem layout real
- [ ] Spinners não bloqueiam interação desnecessariamente

---

#### Task 6.2: Implementar Error Handling
**Prioridade:** Alta | **Estimativa:** 3-4h

**Requisitos:**
- Toast notifications para erros de API
- Inline errors para validação
- Retry buttons para network errors
- Fallback UI para erros críticos

**Critérios de Sucesso:**
- [ ] Erros de validação inline
- [ ] Erros de API em toast
- [ ] Mensagens claras e acionáveis
- [ ] Retry/undo actions quando aplicável

---

#### Task 6.3: Testes
**Prioridade:** Média | **Estimativa:** 8-10h

**Tipos:**
1. **Unit tests** (Vitest)
   - Validation schemas (Zod)
   - Utils (token, oauth, device)
   - Store actions (Zustand)

2. **Integration tests** (React Testing Library)
   - SignUpForm submission
   - SignInForm submission
   - OAuth callback handling
   - Session revocation

3. **E2E tests** (Playwright)
   - Sign up flow completo
   - Sign in flow completo
   - OAuth Google flow
   - Multi-tab logout

**Critérios de Sucesso:**
- [ ] Coverage > 80%
- [ ] Testes passam em CI
- [ ] Edge cases cobertos

---

#### Task 6.4: Acessibilidade Audit
**Prioridade:** Alta | **Estimativa:** 2-3h

**Checklist:**
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader (NVDA/VoiceOver)
- [ ] ARIA labels em todos os inputs
- [ ] Focus visible em todos os elementos interativos
- [ ] Color contrast (WCAG AA)
- [ ] Error announcements (role="alert")

**Tools:**
- axe DevTools
- Lighthouse
- NVDA/VoiceOver

---

#### Task 6.5: Performance Optimization
**Prioridade:** Baixa | **Estimativa:** 2-3h

**Otimizações:**
- [ ] Code splitting (lazy load pages)
- [ ] Image optimization (illustrations)
- [ ] Debounce email validation
- [ ] Memoize expensive computations
- [ ] Optimize re-renders (React.memo)

**Métricas:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

---

## 📊 Resumo de Prioridades

### 🔴 Alta Prioridade (Crítico)
1. Task 1.1 - TypeScript Types
2. Task 1.2 - Axios Client
3. Task 1.3 - Zod Schemas
4. Task 2.1 - Auth Store
5. Task 2.2 - TanStack Query
6. Task 3.1 - Atoms
7. Task 3.2 - Molecules
8. Task 3.3 - Organisms
9. Task 4.1 - Pages
10. Task 4.2 - React Router
11. Task 6.2 - Error Handling
12. Task 6.4 - Acessibilidade

### 🟡 Média Prioridade (Importante)
1. Task 3.4 - Templates
2. Task 5.1 - Custom Hooks
3. Task 6.1 - Loading States
4. Task 6.3 - Testes

### 🟢 Baixa Prioridade (Nice to have)
1. Task 5.2 - Utilities
2. Task 6.5 - Performance Optimization

---

## 🎯 Ordem de Implementação Recomendada

```
Day 1:
- Task 1.1, 1.2, 1.3 (Foundation)

Day 2:
- Task 2.1, 2.2 (State Management)

Day 3:
- Task 3.1, 3.2 (Atoms & Molecules)

Day 4-5:
- Task 3.3 (Organisms - mais complexo)

Day 6:
- Task 3.4, 4.1 (Templates & Pages)

Day 7:
- Task 4.2, 5.1 (Routing & Hooks)

Day 8:
- Task 6.1, 6.2 (Loading & Errors)

Day 9:
- Task 6.4 (Acessibilidade)

Day 10:
- Task 6.3 (Testes)

Day 11:
- Task 5.2, 6.5 (Utilities & Performance)
```

---

## 📝 Checklist Final

Antes de considerar a feature completa:

### Funcionalidade
- [ ] Sign up com email/senha funciona
- [ ] Sign in com email/senha funciona
- [ ] OAuth Google funciona
- [ ] Refresh token rotation funciona
- [ ] Logout funciona
- [ ] Visualizar sessões funciona
- [ ] Revogar sessão funciona
- [ ] Vincular providers funciona

### Qualidade
- [ ] Nenhum erro de TypeScript
- [ ] Nenhum warning no console
- [ ] Code linted (ESLint)
- [ ] Code formatted (Prettier)
- [ ] Testes passando
- [ ] Acessibilidade validada (axe)
- [ ] Performance validada (Lighthouse)

### Documentação
- [ ] README com instruções de uso
- [ ] Storybook para componentes (opcional)
- [ ] JSDoc em hooks complexos
- [ ] Comentários em código complexo

### Design
- [ ] Seguindo Atomic Design
- [ ] Seguindo Silicon Valley UX
- [ ] Responsivo (mobile/tablet/desktop)
- [ ] Dark mode (se aplicável)
- [ ] Customização Shadcn/UI

---

## 🚀 Como Começar

1. **Clone o repositório e instale dependências:**
   ```bash
   cd personal-finance-frontend
   npm install
   ```

2. **Configure variáveis de ambiente:**
   ```bash
   # .env.development
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Inicie com Task 1.1:**
   ```bash
   mkdir -p src/features/auth/types
   touch src/features/auth/types/auth.types.ts
   ```

4. **Execute testes em watch mode:**
   ```bash
   npm run test:watch
   ```

5. **Execute dev server:**
   ```bash
   npm run dev
   ```

---

## 📚 Recursos

- [Design Spec](./design.md)
- [Backend API Docs](../../../personal-finance-backend/docs/integrations/auth/README.md)
- [Atomic Design](/.github/instructions/atomic-design.instructions.md)
- [Silicon Valley UX](/.github/instructions/silicon-valley-ux.instructions.md)
- [Frontend Instructions](/.github/copilot-instructions.md)

---

**Última atualização:** 2026-04-05  
**Autor:** AI Assistant  
**Status:** Ready for implementation
