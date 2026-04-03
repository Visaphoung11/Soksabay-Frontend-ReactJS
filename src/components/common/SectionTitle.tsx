import React from "react";

interface SectionTitleProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ icon, children, className = "" }) => (
  <h2 className={`text-xl font-black text-slate-900 mb-4 flex items-center gap-2 ${className}`}>
    {icon && <span className="text-[#00ab42]">{icon}</span>}
    {children}
  </h2>
);