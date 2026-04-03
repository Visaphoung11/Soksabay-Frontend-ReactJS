import React from "react";

interface InfoCardProps {
  label: string;
  value: string;
  subValue?: string;
  variant?: "default" | "highlight";
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, subValue, variant = "default" }) => (
  <div className={`bg-white border border-slate-200 rounded-3xl p-6 text-center ${variant === "highlight" ? "border-emerald-200" : ""}`}>
    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{label}</p>
    <p className={`text-4xl font-black mt-1 ${variant === "highlight" ? "text-emerald-600" : "text-slate-900"}`}>
      {value}
    </p>
    {subValue && <p className="text-sm text-slate-500">{subValue}</p>}
  </div>
);