import React from "react";

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
}

export const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div>
    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
    <p className="font-semibold text-slate-900 mt-1">{value}</p>
  </div>
);