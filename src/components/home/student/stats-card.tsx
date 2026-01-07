import { cn } from "@/lib/utils";

interface StatsCardProps {
  value: number;
  label: string;
  variant?: "primary" | "default" | "success";
}

export function StatsCard({ value, label, variant = "default" }: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 transition-all hover:scale-105",
        variant === "primary" && "bg-fetch-red text-white",
        variant === "default" && "bg-white border border-gray-200 text-gray-900",
        variant === "success" && "bg-fetch-yellow text-gray-900"
      )}
    >
      <p className={cn(
        "text-2xl font-bold",
        variant === "primary" && "text-white",
        variant === "default" && "text-gray-900",
        variant === "success" && "text-gray-900"
      )}>
        {value}
      </p>
      <p className={cn(
        "text-xs mt-1",
        variant === "primary" && "text-white/80",
        variant === "default" && "text-gray-500",
        variant === "success" && "text-gray-600"
      )}>
        {label}
      </p>
    </div>
  );
}
