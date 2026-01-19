"use client";

import { signup } from "../actions";
import { SubmitButton } from "@/components/auth/submit-button";
import Link from "next/link";
import { useEffect, Suspense, useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error,
        duration: 5000,
      });
    }
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-2xl">
        <CardContent className="pt-8 pb-6 px-6 space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="pointer-events-nonew-16 h-16 rounded-full flex items-center justify-center">
              <Image
                src="/branding/fetch_icon.png"
                alt="Fetch Logo"
                width={40}
                height={40}
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Sign Up</h1>
            <p className="text-sm text-muted-foreground">
              Create your account to get started
            </p>
          </div>

          {/* Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form className="space-y-4" action={signup}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="juandelacruz@gmail.com"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Use your personal or institutional email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div className="rounded-lg bg-fetch-blue/10 dark:bg-fetch-blue/20 p-4 border border-fetch-blue/20">
              <p className="text-sm text-foreground">
                After signing up, you'll complete your profile with additional
                details like your name, student number, and contact information.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-fetch-yellow hover:bg-fetch-yellow/70 text-fetch-red h-12 text-base font-semibold rounded-lg"
            >
              Create Account
            </Button>
          </form>
          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-fetch-red font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background md:bg-fetch-red flex items-center justify-center p-4 md:p-6 relative">
      {/* Red Curved Background Element */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-fetch-red rounded-b-[60px] md:hidden" />

      <div className="relative z-10 w-full">
        <Suspense
          fallback={
            <Card className="w-full max-w-md mx-auto border-0 shadow-2xl">
              <CardContent className="pt-8 pb-6">
                <div className="text-center">Loading...</div>
              </CardContent>
            </Card>
          }
        >
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
