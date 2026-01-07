"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Home, Plus, FileText } from "lucide-react";
import { Dock, DockIcon } from "@/components/ui/dock";

interface StudentLayoutProps {
  children: ReactNode;
  onReportClick?: () => void;
  currentPath?: "dashboard" | "matches" | "reports";
}

export function StudentLayout({ 
  children, 
  onReportClick,
  currentPath = "dashboard" 
}: StudentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="pb-24">
        {children}
      </main>

      {/* Dock Navigation */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center">
        <Dock
          direction="middle"
          iconSize={48}
          iconMagnification={64}
          iconDistance={120}
        >
          <DockIcon>
            <Link
              href="/dashboard"
              className={`flex items-center justify-center transition-colors ${
                currentPath === "dashboard"
                  ? "text-fetch-red"
                  : "text-gray-600 hover:text-fetch-red"
              }`}
              title="Home"
            >
              <Home className="w-6 h-6" />
            </Link>
          </DockIcon>

          <DockIcon className="bg-fetch-red hover:bg-fetch-red/90">
            <button
              onClick={onReportClick}
              className="flex items-center justify-center text-white"
              title="Report Lost Item"
            >
              <Plus className="w-7 h-7" />
            </button>
          </DockIcon>

          <DockIcon>
            <Link
              href="/dashboard/reports"
              className={`flex items-center justify-center transition-colors ${
                currentPath === "reports"
                  ? "text-fetch-red"
                  : "text-gray-600 hover:text-fetch-red"
              }`}
              title="Reports"
            >
              <FileText className="w-6 h-6" />
            </Link>
          </DockIcon>
        </Dock>
      </div>
    </div>
  );
}
