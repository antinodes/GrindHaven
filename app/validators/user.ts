import { z } from 'zod'

const email = z.string().email().max(254)
const password = z.string().min(8).max(128)

export const loginSchema = z.object({
  email,
  password: z.string().min(1), // intentionally no strength rules at login
})

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .nullable()
      .default(null)
      .transform((v) => (v === '' ? null : v)),
    email,
    password: password,
    passwordConfirmation: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  })
  .transform(({ passwordConfirmation: _, ...rest }) => rest)
