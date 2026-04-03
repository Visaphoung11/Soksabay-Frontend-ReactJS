import React from "react";

interface PublicTripSearchProps {
    origin: string;
    setOrigin: (val: string) => void;
    destination: string;
    setDestination: (val: string) => void;
    date: string;
    setDate: (val: string) => void;
    onSearch: () => void;
    onClear: () => void;
    hasFilters: boolean;
}

const PublicTripSearch: React.FC<PublicTripSearchProps> = ({
    origin,
    setOrigin,
    destination,
    setDestination,
    date,
    setDate,
    onSearch,
    onClear,
    hasFilters,
}) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 mb-6">
            <h2 className="text-xl font-black text-slate-900 mb-4">
                Find your trip
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Origin"
                    className="px-4 py-3 rounded-xl border border-slate-200"
                />
                <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination"
                    className="px-4 py-3 rounded-xl border border-slate-200"
                />
                <input
                    type="date"
                    aria-label="Filter by departure date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-slate-200"
                />
                <div className="flex gap-2">
                    <button
                        onClick={onSearch}
                        className="flex-1 px-4 py-3 rounded-xl bg-[#00eb5b] text-slate-900 font-semibold hover:bg-[#00ab42] hover:text-white transition-colors"
                    >
                        Search
                    </button>
                    <button
                        onClick={onClear}
                        className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100"
                    >
                        Clear
                    </button>
                </div>
            </div>
            {hasFilters && (
                <p className="text-xs text-slate-500 mt-3">Filtering active</p>
            )}
        </div>
    );
};

export default PublicTripSearch;
