"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Search,
  FileText,
  User,
  Package,
  Headphones,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CustomerSupportContentProps {
  profile: {
    first_name: string;
    last_name: string;
    user_type: string;
  };
}

export function CustomerSupportContent({
  profile,
}: CustomerSupportContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I report a lost item?",
      answer:
        "To report a lost item, go to your dashboard and click on 'Report Lost Item'. Fill in the details including item description, category, date lost, and location. Add photos if available to help with identification.",
    },
    {
      question: "How long does AI matching take?",
      answer:
        "Our AI matching system processes reports in real-time. You'll receive notifications immediately when a potential match is found. The system continuously scans new reports to find matches.",
    },
    {
      question: "How to claim my item?",
      answer:
        "When a match is found, you'll receive a notification with the match details. Contact the security personnel listed in the match to arrange for item verification and pickup. Bring a valid ID and proof of ownership.",
    },
    {
      question: "Where to track my item status?",
      answer:
        "You can track your reported items from your dashboard. Click on 'My Reports' to see all your lost item reports and their current status (Pending, Matched, Claimed, or Closed).",
    },
    {
      question: "What if I found an item?",
      answer:
        "If you're a security personnel, you can report found items through the 'Report Found Item' feature. If you're a student who found an item, please turn it in to the nearest security office.",
    },
    {
      question: "How do I update my profile information?",
      answer:
        "Go to your Profile page and click 'Edit Profile'. You can update your name, phone number, and other contact information. Some fields like email and student number cannot be changed for security reasons.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/profile" className="text-gray-900">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            Customer Support
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-6 space-y-6">
        {/* Help Section */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-center text-xl font-semibold text-gray-900">
            How can we help you?
          </h2>

          {/* Search */}
          <div className="relative mt-4">
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="#"
            className="flex flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 border border-gray-100"
          >
            <FileText className="h-7 w-7 text-gray-600" />
            <span className="text-sm text-gray-900">
              Get Started
            </span>
          </Link>

          <Link
            href="/profile/edit"
            className="flex flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 border border-gray-100"
          >
            <User className="h-7 w-7 text-gray-600" />
            <span className="text-sm text-gray-900">
              Account & Profile
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 border border-gray-100"
          >
            <Package className="h-7 w-7 text-gray-600" />
            <span className="text-sm text-gray-900">
              Item Status
            </span>
          </Link>

          <Link
            href="#"
            className="flex flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 border border-gray-100"
          >
            <Headphones className="h-7 w-7 text-gray-600" />
            <span className="text-sm text-gray-900">
              Contact Us
            </span>
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            Frequently Asked Questions
          </h3>

          <Accordion type="single" collapsible className="space-y-2">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-gray-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFaqs.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              No results found for "{searchQuery}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
