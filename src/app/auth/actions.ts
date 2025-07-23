'use server'

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

export async function signup(values: z.infer<typeof signupSchema>) {
  const supabase = createClient()

  const validatedFields = signupSchema.safeParse(values)
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `/auth/callback`,
    },
  })

  if (error) {
    return {
      success: false,
      message: error.message,
    }
  }

  return {
    success: true,
    message: "Check your email to confirm your account.",
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient();

  const validatedFields = loginSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    };
  }

  const { email, password } = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }
  
  redirect("/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

const resetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export async function requestPasswordReset(values: z.infer<typeof resetSchema>) {
  const supabase = createClient();

  const validatedFields = resetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { 
        success: false,
        message: "Invalid email provided." 
    };
  }
  
  const { email } = validatedFields.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `/auth/update-password`,
  });

  if (error) {
    return { 
        success: false,
        message: error.message 
    };
  }

  return {
    success: true,
    message: "Password reset link sent. Please check your email.",
  };
}

const updatePasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function updatePassword(values: z.infer<typeof updatePasswordSchema>) {
    const supabase = createClient();

    const validatedFields = updatePasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid password provided.",
        };
    }

    const { password } = validatedFields.data;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        return {
            success: false,
            message: error.message,
        };
    }

    return {
        success: true,
        message: "Password updated successfully.",
    };
}
