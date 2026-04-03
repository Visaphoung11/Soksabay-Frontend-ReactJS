import React from "react";

interface BadgeTagProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export const BadgeTag: React.FC<BadgeTagProps> = ({ children, variant = "default" }) => {
  const colors = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700"
  };
  
  return (
    <span className={`px-3 py-1 rounded-3xl text-xs font-black uppercase tracking-widest ${colors[variant]}`}>
      {children}
    </span>
  );
};