"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface ToastHandlerProps {
  success?: string;
  confirmed?: string;
  message?: string;
}

export function ToastHandler({ success, confirmed, message }: ToastHandlerProps) {
  useEffect(() => {
    if (success) {
      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
        duration: 4000,
      });
    }
    if (confirmed && message) {
      toast.success("Email Confirmed!", {
        description: message,
        duration: 5000,
      });
    }
  }, [success, confirmed, message]);

  return null;
}
