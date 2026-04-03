import React from "react";

interface ImageGalleryProps {
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, activeIndex, onSelect }) => (
  <div className="p-4 flex gap-3 overflow-x-auto border-t border-slate-100">
    {images.map((img, idx) => (
      <button
        key={`${img}-${idx}`}
        onClick={() => onSelect(idx)}
        className={`shrink-0 transition-all ${activeIndex === idx ? "scale-105" : ""}`}
      >
        <img
          src={img}
          alt={`Trip photo ${idx + 1}`}
          className="w-24 h-24 rounded-2xl object-cover border-2 border-transparent"
        />
      </button>
    ))}
  </div>
);