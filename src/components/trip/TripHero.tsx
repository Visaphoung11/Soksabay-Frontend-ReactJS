import { StarRating, ImageGallery } from "../common";
import type { Trip } from "../../types/auth";

interface TripHeroProps {
    trip: Trip;
    activeImage: number;
    onSelectImage: (index: number) => void;
    averageRating: number;
    reviewsCount: number;
}

const TripHero: React.FC<TripHeroProps> = ({
    trip,
    activeImage,
    onSelectImage,
    averageRating,
    reviewsCount,
}) => {
    const images = trip.images || [];

    return (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="relative">
                <img
                    src={images[activeImage] || "https://placehold.co/1200x700?text=Trip+Image"}
                    alt={trip.title}
                    className="w-full h-[380px] md:h-[460px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* rating overlay */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="px-4 py-1 bg-white/90 text-[#00ab42] text-xs font-black uppercase tracking-widest rounded-3xl inline-flex items-center gap-1 shadow">
                        {trip.categoryName || "TRIP"}
                    </div>
                    {averageRating > 0 && (
                        <div className="flex items-center gap-2 bg-white/95 text-slate-900 px-4 py-2 rounded-3xl shadow text-sm font-bold">
                            <StarRating rating={averageRating} size="sm" />
                            <span>{averageRating.toFixed(1)}</span>
                            <span className="text-slate-500 text-xs font-medium">({reviewsCount} reviews)</span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tight drop-shadow-md">
                        {trip.title}
                    </h1>
                    <p className="text-white/90 text-lg mt-2 flex items-center gap-2">
                        {trip.origin} <span className="text-2xl">→</span> {trip.destination}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-white/80 text-sm">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-3xl text-xs font-black uppercase tracking-widest">
                            {trip.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <ImageGallery images={images} activeIndex={activeImage} onSelect={onSelectImage} />
            )}
        </div>
    );
};

export default TripHero;
