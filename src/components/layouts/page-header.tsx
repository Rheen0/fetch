import { ReactNode } from "react";
import { Bell } from "lucide-react";

interface PageHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function PageHeader({ icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-12 h-12 rounded-xl bg-fetch-red flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
          {action || (
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
