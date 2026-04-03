import React from "react";
import type { Category, TripItineraryItem } from "../../types/auth";

interface DriverTripFormProps {
    editId: number | null;
    resetForm: () => void;
    saving: boolean;
    onSubmit: (e: React.FormEvent) => void;
    // Form states
    title: string;
    setTitle: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
    origin: string;
    setOrigin: (v: string) => void;
    destination: string;
    setDestination: (v: string) => void;
    pricePerSeat: number;
    setPricePerSeat: (v: number) => void;
    totalSeats: number;
    setTotalSeats: (v: number) => void;
    departureTime: string;
    setDepartureTime: (v: string) => void;
    categoryId: number;
    setCategoryId: (v: number) => void;
    categories: Category[];
    categoriesLoading: boolean;
    transportationType: string;
    setTransportationType: (v: string) => void;
    vehicleCapacity: number;
    setVehicleCapacity: (v: number) => void;
    isWholeVehicleBooking: boolean;
    setIsWholeVehicleBooking: (v: boolean) => void;
    wholeVehiclePrice: number;
    setWholeVehiclePrice: (v: number) => void;
    scheduleDescription: string;
    setScheduleDescription: (v: string) => void;
    availabilitySchedule: string;
    setAvailabilitySchedule: (v: string) => void;
    hasTourGuide: boolean;
    setHasTourGuide: (v: boolean) => void;
    tourGuideDescription: string;
    setTourGuideDescription: (v: string) => void;
    tourGuideImageUrl: string;
    setTourGuideImageUrl: (v: string) => void;
    tourGuideImageFile: File | null;
    setTourGuideImageFile: (v: File | null) => void;
    mealsIncluded: boolean;
    setMealsIncluded: (v: boolean) => void;
    diningDetails: string;
    setDiningDetails: (v: string) => void;
    itinerary: (TripItineraryItem & { imageFile?: File | null })[];
    setItinerary: React.Dispatch<React.SetStateAction<(TripItineraryItem & { imageFile?: File | null })[]>>;
    onSelectFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectVehicleFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isTukTuk: boolean;
    isBus: boolean;
}

const DriverTripForm: React.FC<DriverTripFormProps> = ({
    editId,
    resetForm,
    saving,
    onSubmit,
    title,
    setTitle,
    description,
    setDescription,
    origin,
    setOrigin,
    destination,
    setDestination,
    pricePerSeat,
    setPricePerSeat,
    totalSeats,
    setTotalSeats,
    departureTime,
    setDepartureTime,
    categoryId,
    setCategoryId,
    categories,
    categoriesLoading,
    transportationType,
    setTransportationType,
    vehicleCapacity,
    setVehicleCapacity,
    isWholeVehicleBooking,
    setIsWholeVehicleBooking,
    wholeVehiclePrice,
    setWholeVehiclePrice,
    scheduleDescription,
    setScheduleDescription,
    availabilitySchedule,
    setAvailabilitySchedule,
    hasTourGuide,
    setHasTourGuide,
    tourGuideDescription,
    setTourGuideDescription,
    tourGuideImageUrl,
    setTourGuideImageUrl,
    tourGuideImageFile,
    setTourGuideImageFile,
    mealsIncluded,
    setMealsIncluded,
    diningDetails,
    setDiningDetails,
    itinerary,
    setItinerary,
    onSelectFiles,
    onSelectVehicleFiles,
    isTukTuk,
    isBus,
}) => {
    return (
        <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{editId ? "Update Trip" : "Create a Trip"}</h2>
                {editId && (
                    <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-900">Cancel edit</button>
                )}
            </div>

            <div className="mb-4 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="font-semibold mb-1">Trip form guide</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Departure time format is automatic from date-time picker.</li>
                    <li>Category is loaded from backend and updates automatically when new categories are created.</li>
                    <li>You can upload multiple images (select many at once, or add more in multiple picks).</li>
                    <li>Vehicle rules: TUK_TUK max capacity 5 + whole-vehicle booking required; BUS capacity must be 25 or 40.</li>
                </ul>
            </div>

            {(isTukTuk || isBus) && (
                <div className="mb-4 text-xs rounded-xl p-3 border">
                    {isTukTuk && (
                        <div className="bg-amber-50 border-amber-200 text-amber-800 rounded-xl p-3 border">
                            <p className="font-black uppercase tracking-widest text-[10px] mb-1">Backend Rule</p>
                            <p className="font-semibold">
                                Transportation type contains <strong>TUK_TUK</strong>: capacity max 5 and <strong>Whole Vehicle Booking</strong> + <strong>Whole Vehicle Price</strong> are required.
                            </p>
                        </div>
                    )}
                    {isBus && (
                        <div className="bg-blue-50 border-blue-200 text-blue-800 rounded-xl p-3 border mt-2">
                            <p className="font-black uppercase tracking-widest text-[10px] mb-1">Backend Rule</p>
                            <p className="font-semibold">
                                Transportation type contains <strong>BUS</strong>: capacity must be exactly <strong>25</strong> or <strong>40</strong>.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Trip title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="PP to Siem Reap Luxury" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Origin</label>
                    <input value={origin} onChange={(e) => setOrigin(e.target.value)} required placeholder="Phnom Penh" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Destination</label>
                    <input value={destination} onChange={(e) => setDestination(e.target.value)} required placeholder="Siem Reap" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Price per seat (USD)</label>
                    <input type="number" min={1} step="0.01" value={pricePerSeat} onChange={(e) => setPricePerSeat(Number(e.target.value))} required placeholder="15" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Total seats</label>
                    <input type="number" min={1} value={totalSeats} onChange={(e) => setTotalSeats(Number(e.target.value))} required placeholder="4" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Transportation type</label>
                    <input
                        value={transportationType}
                        onChange={(e) => setTransportationType(e.target.value)}
                        required
                        placeholder='e.g. "Luxury Ford Transit 12-Seat" or "TUK_TUK"'
                        className="w-full px-4 py-3 rounded-xl border border-slate-200"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Vehicle capacity</label>
                    <input
                        type="number"
                        min={1}
                        value={vehicleCapacity}
                        onChange={(e) => setVehicleCapacity(Number(e.target.value))}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200"
                    />
                    {isTukTuk && vehicleCapacity > 5 && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">Max capacity for TUK_TUK is 5.</p>
                    )}
                    {isBus && ![25, 40].includes(Number(vehicleCapacity)) && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">BUS capacity must be 25 or 40.</p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                        <input
                            id="wholeVehicle"
                            type="checkbox"
                            checked={isWholeVehicleBooking}
                            onChange={(e) => setIsWholeVehicleBooking(e.target.checked)}
                            disabled={isTukTuk}
                        />
                        <label htmlFor="wholeVehicle" className="text-sm font-semibold text-slate-700">
                            Whole vehicle booking
                            {isTukTuk && <span className="text-xs text-amber-700 ml-2">(Required for TUK_TUK)</span>}
                        </label>
                    </div>
                </div>

                {isWholeVehicleBooking && (
                    <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Whole vehicle price (USD)</label>
                        <input
                            type="number"
                            min={1}
                            step="0.01"
                            value={wholeVehiclePrice}
                            onChange={(e) => setWholeVehiclePrice(Number(e.target.value))}
                            required={isTukTuk || isWholeVehicleBooking}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200"
                        />
                    </div>
                )}
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Departure time</label>
                    <input type="datetime-local" aria-label="Departure time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Category</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        disabled={categoriesLoading || categories.length === 0}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white disabled:bg-slate-100"
                        required
                    >
                        {categoriesLoading && <option value="">Loading categories...</option>}
                        {!categoriesLoading && categories.length === 0 && <option value="">No categories available</option>}
                        {!categoriesLoading && categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {!categoriesLoading && categories.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-1">
                            {categories.find((c) => c.id === categoryId)?.description || ""}
                        </p>
                    )}
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Trip images</label>
                    <input type="file" aria-label="Trip images" accept="image/*" multiple onChange={onSelectFiles} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    <p className="text-[11px] text-slate-500 mt-1">Scenery/destination shots. Tip: select multiple in one pick or pick more files again to append.</p>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Vehicle images</label>
                    <input type="file" aria-label="Vehicle images" accept="image/*" multiple onChange={onSelectVehicleFiles} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                    <p className="text-[11px] text-slate-500 mt-1">Vehicle interior/exterior photos.</p>
                </div>
            </div>

            <div className="mt-3">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Trip description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Clean SUV, free water, pickup at Central Market..." className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-24" />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Schedule description</label>
                    <textarea
                        value={scheduleDescription}
                        onChange={(e) => setScheduleDescription(e.target.value)}
                        placeholder="Start from 6:00 AM to 7:00 PM..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-20"
                    />
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Availability schedule</label>
                    <textarea
                        value={availabilitySchedule}
                        onChange={(e) => setAvailabilitySchedule(e.target.value)}
                        placeholder="Available fully on weekends..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-20"
                    />
                </div>
            </div>

            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm font-bold text-slate-900 mb-3">Optional services</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3">
                        <input id="hasGuide" type="checkbox" checked={hasTourGuide} onChange={(e) => setHasTourGuide(e.target.checked)} />
                        <label htmlFor="hasGuide" className="text-sm font-semibold text-slate-700">Has tour guide</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <input id="hasMeals" type="checkbox" checked={mealsIncluded} onChange={(e) => setMealsIncluded(e.target.checked)} />
                        <label htmlFor="hasMeals" className="text-sm font-semibold text-slate-700">Meals included</label>
                    </div>

                    {hasTourGuide && (
                        <>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Tour guide description</label>
                                <textarea
                                    value={tourGuideDescription}
                                    onChange={(e) => setTourGuideDescription(e.target.value)}
                                    placeholder="English-speaking professional guide..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-20"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Tour guide image URL</label>
                                <input
                                    value={tourGuideImageUrl}
                                    onChange={(e) => setTourGuideImageUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">You can paste a URL or upload an image below.</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Upload tour guide image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (!f) return;
                                        setTourGuideImageFile(f);
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                                />
                                {tourGuideImageFile && (
                                    <p className="text-[11px] text-slate-600 mt-1">Selected: {tourGuideImageFile.name}</p>
                                )}
                            </div>
                        </>
                    )}

                    {mealsIncluded && (
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Dining details</label>
                            <textarea
                                value={diningDetails}
                                onChange={(e) => setDiningDetails(e.target.value)}
                                placeholder="Lunch and snacks provided..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-20"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                        <p className="text-sm font-bold text-slate-900">Itinerary</p>
                        <p className="text-[11px] text-slate-500">Add travel stops (optional). You can upload a thumbnail per stop.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setItinerary((prev) => [...prev, { name: "", description: "", imageUrl: "", imageFile: null }])}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider"
                    >
                        Add Stop
                    </button>
                </div>

                {itinerary.length === 0 ? (
                    <p className="text-sm text-slate-500">No stops added.</p>
                ) : (
                    <div className="space-y-4">
                        {itinerary.map((stop, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-xl p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Stop #{idx + 1}</p>
                                    <button
                                        type="button"
                                        onClick={() => setItinerary((prev) => prev.filter((_, i) => i !== idx))}
                                        className="text-xs font-bold text-red-600 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Name</label>
                                        <input
                                            value={stop.name}
                                            onChange={(e) =>
                                                setItinerary((prev) => {
                                                    const next = [...prev];
                                                    next[idx] = { ...next[idx], name: e.target.value };
                                                    return next;
                                                })
                                            }
                                            placeholder="Departure from Phnom Penh"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Thumbnail</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (!f) return;
                                                setItinerary((prev) => {
                                                    const next = [...prev];
                                                    next[idx] = { ...next[idx], imageFile: f };
                                                    return next;
                                                });
                                            }}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                                        />
                                        {(stop.imageUrl || stop.imageFile) && (
                                            <div className="mt-2 flex items-center gap-3">
                                                <img
                                                    src={stop.imageFile ? URL.createObjectURL(stop.imageFile) : stop.imageUrl}
                                                    alt="stop thumbnail"
                                                    className="w-12 h-12 rounded-xl object-cover border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setItinerary((prev) => {
                                                            const next = [...prev];
                                                            next[idx] = { ...next[idx], imageUrl: "", imageFile: null };
                                                            return next;
                                                        })
                                                    }
                                                    className="text-xs font-bold text-slate-500 hover:text-slate-900"
                                                >
                                                    Clear image
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
                                        <textarea
                                            value={stop.description}
                                            onChange={(e) =>
                                                setItinerary((prev) => {
                                                    const next = [...prev];
                                                    next[idx] = { ...next[idx], description: e.target.value };
                                                    return next;
                                                })
                                            }
                                            placeholder="Meet at central station..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-20"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={saving}
                className="w-full mt-6 py-4 rounded-xl bg-[#00eb5b] text-slate-900 font-bold hover:bg-[#00ab42] hover:text-white transition-all disabled:opacity-50"
            >
                {saving ? "Saving Trip..." : editId ? "Update Trip Now" : "Create Trip Now"}
            </button>
        </form>
    );
};

export default DriverTripForm;
