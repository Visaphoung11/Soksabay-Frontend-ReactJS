import React from "react";
import type { Trip } from "../../types/auth";

interface TripItineraryProps {
    itinerary: Trip["itinerary"];
    openItineraries: Set<number>;
    toggleItinerary: (index: number) => void;
}

const TripItinerary: React.FC<TripItineraryProps> = ({
    itinerary,
    openItineraries,
    toggleItinerary,
}) => {
    if (!itinerary || itinerary.length === 0) return null;

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                Itinerary
                <span className="text-xs px-3 py-1 bg-amber-100 text-amber-700 font-black rounded-3xl">Click each stop to expand</span>
            </h2>

            <div className="space-y-3">
                {itinerary.map((stop, idx) => {
                    const isOpen = openItineraries.has(idx);
                    return (
                        <div
                            key={idx}
                            className="border border-slate-200 rounded-3xl overflow-hidden bg-white transition-all duration-300"
                        >
                            <button
                                onClick={() => toggleItinerary(idx)}
                                className="w-full px-6 py-6 flex items-center justify-between text-left hover:bg-slate-50 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-2xl bg-[#00eb5b] text-white font-black flex items-center justify-center text-lg shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-lg text-slate-900 group-hover:text-[#00ab42]">
                                            {stop.name || `Stop ${idx + 1}`}
                                        </p>
                                        <p className="text-xs text-slate-400">Tap to see full details</p>
                                    </div>
                                </div>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-6 h-6 transition-transform duration-300 text-slate-400 ${isOpen ? "rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[600px] opacity-100 pb-6" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="px-6">
                                    {stop.imageUrl && (
                                        <img
                                            src={stop.imageUrl}
                                            alt={stop.name}
                                            className="w-full rounded-3xl object-cover shadow-inner mb-6"
                                        />
                                    )}
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[15px]">
                                        {stop.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TripItinerary;
