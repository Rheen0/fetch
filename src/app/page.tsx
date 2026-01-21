"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Marquee } from "@/components/ui/marquee";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  body: string;
  rating: number;
  avatar: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: "Rhandie J. Sales Jr.",
    role: "Student",
    body: "Lost my laptop in the library and found it within hours. The notification system is incredible!",
    rating: 5,
    avatar: "/pages/testimony/rhandie.jpg",
  },
  {
    name: "Akisha Lei de Castro",
    role: "Student",
    body: "This system has revolutionized how we handle lost items. Everything is organized and trackable.",
    rating: 5,
    avatar: "/pages/testimony/akisha.jpg",
  },
  {
    name: "Donna Reymatias",
    role: "Student",
    body: "Found someone's wallet and returned it the same day. Such a helpful platform!",
    rating: 5,
    avatar: "/pages/testimony/donna.jpg",
  },
  {
    name: "Kerby Correa",
    role: "Student",
    body: "The verification process is secure and efficient. I trust this system completely.",
    rating: 5,
    avatar: "https://avatar.vercel.sh/david",
  },
  {
    name: "Nicholas Jose",
    role: "Student",
    body: "Lost my keys during finals week. Fetch saved me from a stressful situation!",
    rating: 5,
    avatar: "/pages/testimony/nicholas.jpg",
  },
  {
    name: "Samantha Paquibot",
    role: "Student",
    body: "Lost my phone in the lagoon and found it within hours. This is nice.",
    rating: 5,
    avatar: "https://avatar.vercel.sh/alex",
  },
];

const TestimonialCard = ({ name, role, body, rating, avatar }: Testimonial) => {
  return (
    <figure
      className={cn(
        "relative w-80 cursor-pointer overflow-hidden rounded-xl border p-4",
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img
          className="rounded-full object-cover"
          width="48"
          height="48"
          alt={name}
          src={avatar}
        />
        <div className="flex flex-col flex-1">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-muted-foreground">{role}</p>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3 w-3",
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )}
            />
          ))}
        </div>
      </div>
      <blockquote className="mt-3 text-sm text-muted-foreground">
        {body}
      </blockquote>
    </figure>
  );
};

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(defaultTestimonials);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    const fetchTestimonials = async () => {
      const { data: ratings } = await supabase
        .from("ratings")
        .select("display_name, feedback, rating")
        .eq("show_on_landing", true)
        .eq("approved", true)
        .gte("rating", 4) // Only show 4 and 5 star ratings
        .order("created_at", { ascending: false });

      if (ratings && ratings.length > 0) {
        const userTestimonials: Testimonial[] = ratings.map((r) => ({
          name: r.display_name || "Anonymous User",
          role: "Student", // Could be enhanced to show actual role
          body: r.feedback,
          rating: r.rating,
          avatar: `https://avatar.vercel.sh/${r.display_name
            ?.toLowerCase()
            .replace(/\s+/g, "")}`,
        }));

        // Mix user testimonials with default ones
        setTestimonials([...userTestimonials, ...defaultTestimonials]);
      }
    };

    checkUser();
    fetchTestimonials();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
    

      {/* Full Screen Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="flex items-center gap-6 mb-8">
          <Image
            src="/branding/fetch_icon.png"
            alt="Fetch Logo"
            width={120}
            height={120}
            className="drop-shadow-lg"
          />
          <h1 className="text-8xl md:text-9xl font-extrabold text-fetch-red tracking-tight">
            f<span className="text-fetch-yellow">e</span>tch
          </h1>
        </div>

        <p className="text-4xl md:text-5xl font-light text-foreground mb-6 max-w-4xl leading-tight">
          Securely fetching what belongs to you
        </p>

        <p className="text-xl text-muted-foreground mb-14 max-w-2xl">
          A modern lost and found system for campus communities
        </p>

        <div className="flex gap-4">
          {user ? (
            <Button
              asChild
              size="lg"
              className="bg-fetch-red hover:bg-fetch-red/90 text-lg px-10 py-7 rounded-full"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                size="lg"
                className="bg-fetch-red hover:bg-fetch-red/90 text-lg px-10 py-7 rounded-full"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 rounded-full"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-xl border p-6",
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                "flex flex-col items-center text-center space-y-4"
              )}
            >
              <div className="w-16 h-16 rounded-full bg-fetch-blue/10 dark:bg-fetch-blue/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-fetch-blue" />
              </div>
              <h3 className="text-2xl font-semibold">Report Items</h3>
              <p className="text-muted-foreground">
                Quickly report lost or found items with photos and descriptions
              </p>
            </div>

            <div
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-xl border p-6",
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                "flex flex-col items-center text-center space-y-4"
              )}
            >
              <div className="w-16 h-16 rounded-full bg-fetch-yellow/10 dark:bg-fetch-yellow/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-fetch-yellow" />
              </div>
              <h3 className="text-2xl font-semibold">Smart Matching</h3>
              <p className="text-muted-foreground">
                Our system automatically matches lost items with found items
              </p>
            </div>

            <div
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-xl border p-6",
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                "flex flex-col items-center text-center space-y-4"
              )}
            >
              <div className="w-16 h-16 rounded-full bg-fetch-green/10 dark:bg-fetch-green/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-fetch-green" />
              </div>
              <h3 className="text-2xl font-semibold">Secure Return</h3>
              <p className="text-muted-foreground">
                Verify ownership and coordinate safe item returns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Horizontal */}
      <section className="py-20">
        <div className="container mx-auto px-6 mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by our community
          </h2>
          <p className="text-muted-foreground text-lg">
            See what students and staff have to say
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-4">
          <Marquee pauseOnHover className="[--duration:40s]">
            {firstRow.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:40s]">
            {secondRow.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-3xl text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-xl">
            Join users who trust Fetch to reunite them with their
            lost items
          </p>
          {!user && (
            <div className="flex gap-4 justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="bg-fetch-red hover:bg-fetch-red/90 text-lg px-10 py-7 rounded-full"
              >
                <Link href="/signup">Create Account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 rounded-full"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
          {user && (
            <Button
              asChild
              size="lg"
              className="bg-fetch-red hover:bg-fetch-red/90 text-lg px-10 py-7 rounded-full"
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/branding/fetch_icon.png"
              alt="Fetch"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold text-fetch-red">
              f<span className="text-fetch-yellow">e</span>tch
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Fetch. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
