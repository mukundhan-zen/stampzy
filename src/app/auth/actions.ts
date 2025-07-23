'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function signup(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const result = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return {
      error: { message: 'Invalid email or password' },
    }
  }

  const { email, password } = result.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Signup Error:', error)
    return {
      error: { message: error.message || 'Could not sign up. Please try again.' },
    }
  }

  // A trigger in the database will create the user profile.
  // Supabase sends a confirmation email, so we don't need to redirect immediately.
  return {
    data: { message: 'Check your email for a confirmation link to complete your registration.' },
  }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function login(formData: FormData) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const result = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!result.success) {
        return {
            error: { message: 'Invalid email or password' },
        }
    }

    const { email, password } = result.data

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login Error:', error)
        return {
            error: { message: error.message || 'Could not log in. Please try again.' },
        }
    }

    return redirect('/dashboard')
}
