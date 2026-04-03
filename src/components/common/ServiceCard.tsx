import React from "react";

interface ServiceCardProps {
  icon: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, imageUrl }) => (
  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
    <div className="flex items-center gap-2 text-emerald-600">
      <span className="text-2xl">{icon}</span>
      <p className="font-black">{title}</p>
    </div>
    {description && <p className="mt-3 text-slate-600">{description}</p>}
    {imageUrl && (
      <img src={imageUrl} alt={title} className="mt-4 w-full h-40 object-cover rounded-2xl" />
    )}
  </div>
);