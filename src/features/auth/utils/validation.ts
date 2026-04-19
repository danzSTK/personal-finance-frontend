import { z } from 'zod';

export const signUpSchema = z.object({
  userName: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(100, 'Username deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e _'),

  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),

  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),

  firstName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),

  lastName: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(255, 'Sobrenome deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')),
});

export const signInSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const linkEmailSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(50, 'Senha deve ter no máximo 50 caracteres'),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type LinkEmailFormData = z.infer<typeof linkEmailSchema>;
