import React from "react";

interface BackButtonProps {
  onClick: () => void;
  text?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, text = "← Back to trips" }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
  >
    {text}
  </button>
);