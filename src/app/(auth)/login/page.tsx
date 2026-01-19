"use client";

import { login } from "../actions";
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
import { Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

function LoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const error = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (message) {
      toast.success("Success", {
        description: message,
        duration: 5000,
      });
    }
    if (error) {
      toast.error("Error", {
        description: error,
        duration: 5000,
      });
    }
  }, [message, error]);

  return (
    <div className="w-full max-w-md mx-auto z-20">
      <Card className="border-0 shadow-2xl">
        <CardContent className="pt-8 pb-6 px-6 space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="pointer-events-none w-16 h-16 rounded-full flex items-center justify-center">
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
            <h1 className="text-3xl font-bold text-foreground">Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to log in
            </p>
          </div>

          {/* Alerts */}
          {message && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-400">
                Check your email
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-500">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form className="space-y-4" action={login}>
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
                  autoComplete="current-password"
                  required
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
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-fetch-red focus:ring-fetch-red cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-fetch-red hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="cursor-pointer w-full bg-fetch-yellow hover:bg-fetch-yellow/70 text-fetch-red h-12 text-base font-semibold rounded-lg"
            >
              Log In
            </Button>
          </form>
          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-fetch-red font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background md:bg-fetch-red flex items-center justify-center p-4 md:p-6 relative">
      {/* Red Curved Background Element */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-fetch-red rounded-b-[60px] md:hidden" />

      <Suspense
        fallback={
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardContent className="pt-8 pb-6">
              <div className="text-center">Loading...</div>
            </CardContent>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
