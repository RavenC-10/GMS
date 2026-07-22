import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  right?: ReactNode;
}

function PageHeader({ title, right }: PageHeaderProps) {
  return (
    <div className="bg-bg-card min-h-[5rem] h-20 px-8 rounded-3xl shadow-xl border border-border-custom flex items-center justify-between shrink-0">
      {/* TITLE */}
      <h1 className="text-2xl font-semibold tracking-tight text-text-title leading-none">
        {title}
      </h1>

      {/* RIGHT SIDE */}
      {right && (
        <div className="flex items-center">
          {right}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
