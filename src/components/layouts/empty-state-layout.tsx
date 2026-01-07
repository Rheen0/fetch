import { ReactNode } from "react";

interface EmptyStateLayoutProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyStateLayout({
  icon,
  title,
  description,
  action,
}: EmptyStateLayoutProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {action}
      </div>
    </div>
  );
}
