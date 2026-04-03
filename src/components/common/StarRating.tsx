import React from "react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = "md", 
  interactive = false,
  onChange 
}) => {
  const starSize = size === "sm" ? "text-xl" : size === "lg" ? "text-4xl" : "text-3xl";
  const fullStars = Math.floor(rating);
  const hasPartial = rating % 1 !== 0;

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => handleClick(i)}
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
        >
          {i < fullStars ? (
            <span className={`${starSize} text-yellow-400`}>★</span>
          ) : i === fullStars && hasPartial ? (
            <span className={`${starSize} text-yellow-400 relative`}>
              ★
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
                ★
              </span>
            </span>
          ) : (
            <span className={`${starSize} text-slate-200`}>★</span>
          )}
        </button>
      ))}
    </div>
  );
};