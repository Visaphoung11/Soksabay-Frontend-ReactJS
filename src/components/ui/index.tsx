import React from "react";
import { motion } from "framer-motion";

// ============== Loading Spinner ==============
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-emerald-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

// ============== Loading Overlay ==============
interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Loading..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10"
  >
    <LoadingSpinner size="lg" />
    <p className="mt-3 text-sm text-slate-600 font-medium">{message}</p>
  </motion.div>
);

// ============== Empty State ==============
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {icon && <div className="mb-4 text-slate-400">{icon}</div>}
    <p className="text-sm font-semibold text-slate-600">{title}</p>
    {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ============== Button ==============
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses = "font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-[#00eb5b] text-slate-900 hover:bg-[#00ab42] hover:text-white",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : children}
    </button>
  );
};

// ============== Card ==============
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick, hover = false }) => (
  <div
    className={`bg-white border border-slate-200 rounded-3xl overflow-hidden ${hover ? "hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer" : ""} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// ============== Badge ==============
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "" }) => {
  const variantClasses = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ============== Avatar ==============
interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", online, className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 text-base"
  };

  const initial = name ? name.slice(0, 1).toUpperCase() : "U";

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full rounded-2xl bg-[#00eb5b]/15 border border-[#00eb5b]/20 overflow-hidden flex items-center justify-center">
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[#00ab42] font-black">{initial}</span>
        )}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${online ? "bg-emerald-500" : "bg-slate-400"}`} />
      )}
    </div>
  );
};

// ============== Input ==============
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = "", ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        className={`w-full px-4 py-2.5 rounded-2xl border ${error ? "border-red-300" : "border-slate-200"} focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm ${icon ? "pl-10" : ""} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// ============== TextArea ==============
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = "", ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
    <textarea
      className={`w-full px-4 py-2.5 rounded-2xl border ${error ? "border-red-300" : "border-slate-200"} focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm resize-none ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// ============== Select ==============
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = "", ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
    <select
      className={`w-full px-4 py-2.5 rounded-2xl border ${error ? "border-red-300" : "border-slate-200"} focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm bg-white ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// ============== Toggle ==============
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled }) => (
  <label className={`flex items-center gap-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
    <div
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-200"}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </div>
    {label && <span className="text-sm text-slate-700">{label}</span>}
  </label>
);

// ============== Divider ==============
export const Divider: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`border-t border-slate-200 ${className}`} />
);

// ============== Section Header ==============
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ============== Page Header ==============
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => (
  <div className="mb-6 bg-white border border-slate-200 rounded-2xl px-5 py-4">
    <h2 className="text-xl font-black text-slate-900">{title}</h2>
    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    {children}
  </div>
);

// ============== Status Indicator ==============
interface StatusIndicatorProps {
  status: "online" | "offline" | "away" | "busy";
  label?: string;
  showLabel?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, showLabel = true }) => {
  const colors = {
    online: "bg-emerald-500",
    offline: "bg-slate-400",
    away: "bg-amber-500",
    busy: "bg-red-500"
  };

  const labels = {
    online: "Online",
    offline: "Offline",
    away: "Away",
    busy: "Busy"
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${colors[status]}`} />
      {showLabel && <span className="text-xs text-slate-500">{label || labels[status]}</span>}
    </div>
  );
};

// ============== File Upload ==============
interface FileUploadProps {
  accept?: string;
  onChange: (file: File) => void;
  label?: string;
  preview?: string;
  onRemove?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ accept = "image/*", onChange, label, preview, onRemove }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>}
    {preview ? (
      <div className="relative inline-block">
        <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border" />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600"
          >
            ×
          </button>
        )}
      </div>
    ) : (
      <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
        <span className="text-sm text-slate-500">Click to upload</span>
        <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} />
      </label>
    )}
  </div>
);

// ============== Tabs ==============
interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => (
  <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          activeTab === tab.id
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);