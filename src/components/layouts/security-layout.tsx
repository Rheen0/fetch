"use client";

import { ReactNode, useState } from "react";
import { Dock, DockIcon } from "@/components/ui/dock";
import { Home, Plus, ClipboardList } from "lucide-react";
import { ReportFoundModal } from "@/components/modals/report-found-modal";
import Link from "next/link";

interface SecurityLayoutProps {
  children: ReactNode;
  currentPath?: string;
  securityId?: number;
  onReportSuccess?: () => void;
}

export function SecurityLayout({
  children,
  currentPath = "dashboard",
  securityId,
  onReportSuccess,
}: SecurityLayoutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    setIsModalOpen(false);
    if (onReportSuccess) {
      onReportSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {children}

      {/* Bottom Dock Navigation */}
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
            >
              <Home className="w-6 h-6" />
            </Link>
          </DockIcon>

          <DockIcon className="bg-fetch-red hover:bg-fetch-red/90">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center text-white"
            >
              <Plus className="w-7 h-7" />
            </button>
          </DockIcon>

          <DockIcon>
            <Link
              href="/dashboard/claims"
              className={`flex items-center justify-center transition-colors ${
                currentPath === "claims"
                  ? "text-fetch-red"
                  : "text-gray-600 hover:text-fetch-red"
              }`}
            >
              <ClipboardList className="w-6 h-6" />
            </Link>
          </DockIcon>
        </Dock>
      </div>

      {/* Report Found Modal */}
      {isModalOpen && securityId && (
        <ReportFoundModal
          securityId={securityId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
