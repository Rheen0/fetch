"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/signup?error=Please fill in all fields");
  }

  // Validate password length
  if (password.length < 8) {
    return redirect("/signup?error=Password must be at least 8 characters");
  }

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    console.error("Signup error:", error);
    
    // Handle specific error cases
    if (error.message.toLowerCase().includes("already registered") || 
        error.message.toLowerCase().includes("already exists") ||
        error.message.toLowerCase().includes("user already registered")) {
      return redirect("/signup?error=This email is already registered. Please log in instead.");
    }
    
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Check if user already exists (Supabase sometimes returns success for existing users)
  if (data.user && !data.user.identities?.length) {
    return redirect("/signup?error=This email is already registered. Please log in instead.");
  }

  if (!data.user) {
    return redirect("/signup?error=Failed to create account");
  }

  // Create empty profile (will be filled during onboarding)
  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    onboarding_completed: false,
  });

  if (profileError) {
    console.error("Profile creation error:", profileError);
  }

  // Redirect to check email page
  return redirect(
    "/login?message=Check your email to confirm your account before signing in"
  );
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return redirect("/login?error=Please fill in all fields");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    
    // Provide user-friendly error messages
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return redirect("/login?error=Invalid email or password");
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return redirect("/login?error=Please confirm your email address first");
    }
    
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect("/dashboard?success=true");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}
