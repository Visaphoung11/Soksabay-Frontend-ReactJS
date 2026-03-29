import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  createDriverTrip,
  deleteDriverTrip,
  getCategories,
  getDriverTripById,
  getMyDriverTrips,
  updateDriverTrip,
  uploadImage,
  uploadMultipleImages,
} from "../services/driverService";
import type { Category, Trip, TripItineraryItem, TripPayload } from "../types/auth";
import AppLayout from "../components/AppLayout";

const toInputDateTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DriverTrips: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDriver = useMemo(() => user?.role?.some((r) => r.toUpperCase().includes("DRIVER")), [user]);

  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [pricePerSeat, setPricePerSeat] = useState<number>(15);
  const [totalSeats, setTotalSeats] = useState<number>(4);
  const [departureTime, setDepartureTime] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingVehicleImageUrls, setExistingVehicleImageUrls] = useState<string[]>([]);
  const [vehicleImageFiles, setVehicleImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // NEW VEHICLE & PRICING FIELDS
  const [transportationType, setTransportationType] = useState<string>("");
  const [vehicleCapacity, setVehicleCapacity] = useState<number>(4);
  const [isWholeVehicleBooking, setIsWholeVehicleBooking] = useState<boolean>(false);
  const [wholeVehiclePrice, setWholeVehiclePrice] = useState<number>(0);

  // NEW SCHEDULING & DETAILS
  const [scheduleDescription, setScheduleDescription] = useState<string>("");
  const [availabilitySchedule, setAvailabilitySchedule] = useState<string>("");

  // NEW OPTIONAL SERVICES
  const [hasTourGuide, setHasTourGuide] = useState<boolean>(false);
  const [tourGuideDescription, setTourGuideDescription] = useState<string>("");
  const [tourGuideImageUrl, setTourGuideImageUrl] = useState<string>("");
  const [tourGuideImageFile, setTourGuideImageFile] = useState<File | null>(null);

  const [mealsIncluded, setMealsIncluded] = useState<boolean>(false);
  const [diningDetails, setDiningDetails] = useState<string>("");

  // NEW NESTED ITINERARY (with optional image uploads)
  type ItineraryDraft = TripItineraryItem & { imageFile?: File | null };
  const [itinerary, setItinerary] = useState<ItineraryDraft[]>([]);

  const transportKey = useMemo(() => transportationType.trim().toUpperCase(), [transportationType]);
  const isTukTuk = useMemo(() => transportKey.includes("TUK_TUK") || transportKey.includes("TUKTUK"), [transportKey]);
  const isBus = useMemo(() => transportKey.includes("BUS"), [transportKey]);

  useEffect(() => {
    // Keep vehicleCapacity aligned to common backend rules (UI guidance)
    if (isTukTuk) {
      if (vehicleCapacity > 5) setVehicleCapacity(5);
      if (!isWholeVehicleBooking) setIsWholeVehicleBooking(true);
    }
  }, [isTukTuk, vehicleCapacity, isWholeVehicleBooking]);

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(e.target.files || []);
    if (!nextFiles.length) return;

    const oversized = nextFiles.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      toast.error(`Image too large: ${oversized.name}. Max size is 10MB.`);
      e.target.value = "";
      return;
    }

    setImageFiles((prev) => {
      const merged = [...prev, ...nextFiles];
      const deduped = merged.filter(
        (file, index, arr) =>
          arr.findIndex(
            (f) =>
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === file.lastModified
          ) === index
      );
      return deduped;
    });

    // allow selecting the same file again after removing it
    e.target.value = "";
  };

  const handleSelectVehicleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(e.target.files || []);
    if (!nextFiles.length) return;

    const oversized = nextFiles.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      toast.error(`Image too large: ${oversized.name}. Max size is 10MB.`);
      e.target.value = "";
      return;
    }

    setVehicleImageFiles((prev) => {
      const merged = [...prev, ...nextFiles];
      const deduped = merged.filter(
        (file, index, arr) =>
          arr.findIndex(
            (f) =>
              f.name === file.name &&
              f.size === file.size &&
              f.lastModified === file.lastModified
          ) === index
      );
      return deduped;
    });

    e.target.value = "";
  };

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await getMyDriverTrips();
      setTrips(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch your trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDriver) loadTrips();
  }, [isDriver]);

  useEffect(() => {
    if (!isDriver) return;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await getCategories();
        setCategories(data);
        if (data.length > 0) {
          setCategoryId((prev) => (data.some((c) => c.id === prev) ? prev : data[0].id));
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [isDriver]);

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setOrigin("");
    setDestination("");
    setPricePerSeat(15);
    setTotalSeats(4);
    setDepartureTime("");
    setCategoryId(1);
    setExistingImageUrls([]);
    setImageFiles([]);
    setExistingVehicleImageUrls([]);
    setVehicleImageFiles([]);

    setTransportationType("");
    setVehicleCapacity(4);
    setIsWholeVehicleBooking(false);
    setWholeVehiclePrice(0);
    setScheduleDescription("");
    setAvailabilitySchedule("");
    setHasTourGuide(false);
    setTourGuideDescription("");
    setTourGuideImageUrl("");
    setTourGuideImageFile(null);
    setMealsIncluded(false);
    setDiningDetails("");
    setItinerary([]);
  };

  const startEdit = async (id: number) => {
    try {
      const trip = await getDriverTripById(id);
      setEditId(trip.id);
      setTitle(trip.title);
      setDescription(trip.description);
      setOrigin(trip.origin);
      setDestination(trip.destination);
      setPricePerSeat(Number(trip.pricePerSeat));
      setTotalSeats(Number(trip.totalSeats));
      setDepartureTime(toInputDateTime(trip.departureTime));
      setCategoryId(
        trip.categoryId ?? categories.find((c) => c.name === trip.categoryName)?.id ?? 1
      );
      setExistingImageUrls(trip.images || []);
      setImageFiles([]);
      setExistingVehicleImageUrls(trip.vehicleImageUrls || []);
      setVehicleImageFiles([]);

      setTransportationType(trip.transportationType || "");
      setVehicleCapacity(Number(trip.vehicleCapacity ?? trip.totalSeats ?? 4));
      setIsWholeVehicleBooking(Boolean(trip.isWholeVehicleBooking ?? false));
      setWholeVehiclePrice(Number(trip.wholeVehiclePrice ?? 0));
      setScheduleDescription(trip.scheduleDescription || "");
      setAvailabilitySchedule(trip.availabilitySchedule || "");
      setHasTourGuide(Boolean(trip.hasTourGuide ?? false));
      setTourGuideDescription(trip.tourGuideDescription || "");
      setTourGuideImageUrl(trip.tourGuideImageUrl || "");
      setTourGuideImageFile(null);
      setMealsIncluded(Boolean(trip.mealsIncluded ?? false));
      setDiningDetails(trip.diningDetails || "");
      setItinerary(
        (trip.itinerary || []).map((s) => ({
          name: s.name,
          description: s.description,
          imageUrl: s.imageUrl,
          imageFile: null,
        }))
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load trip details");
    }
  };

  const uploadTourGuideImageIfNeeded = async (): Promise<string> => {
    if (!tourGuideImageFile) return tourGuideImageUrl;
    const uploaded = await uploadImage(tourGuideImageFile);
    const url = uploaded.secure_url || uploaded.url;
    if (!url) throw new Error("Tour guide image upload succeeded but no URL returned");
    setTourGuideImageUrl(url);
    setTourGuideImageFile(null);
    return url;
  };

  const uploadItineraryImagesIfNeeded = async (items: ItineraryDraft[]): Promise<ItineraryDraft[]> => {
    const next = [...items];
    for (let i = 0; i < next.length; i++) {
      const f = next[i].imageFile;
      if (!f) continue;
      const uploaded = await uploadImage(f);
      const url = uploaded.secure_url || uploaded.url;
      next[i] = {
        ...next[i],
        imageUrl: url,
        imageFile: null,
      };
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Validation rules for new backend constraints (UI guidance)
      if (!transportationType.trim()) {
        toast.error("Transportation type is required");
        setSaving(false);
        return;
      }
      if (vehicleCapacity < 1) {
        toast.error("Vehicle capacity must be at least 1");
        setSaving(false);
        return;
      }
      if (isTukTuk) {
        if (vehicleCapacity > 5) {
          toast.error("TUK_TUK capacity cannot exceed 5");
          setSaving(false);
          return;
        }
        if (!isWholeVehicleBooking) {
          toast.error("TUK_TUK requires whole-vehicle booking");
          setSaving(false);
          return;
        }
        if (!wholeVehiclePrice || wholeVehiclePrice <= 0) {
          toast.error("TUK_TUK requires a Whole Vehicle Price");
          setSaving(false);
          return;
        }
      }
      if (isBus) {
        if (![25, 40].includes(Number(vehicleCapacity))) {
          toast.error("BUS capacity must be exactly 25 or 40");
          setSaving(false);
          return;
        }
      }

      const uploadedUrls = imageFiles.length ? await uploadMultipleImages(imageFiles) : [];
      const mergedImageUrls = Array.from(new Set([...existingImageUrls, ...uploadedUrls]));

      const uploadedVehicleUrls = vehicleImageFiles.length ? await uploadMultipleImages(vehicleImageFiles) : [];
      const mergedVehicleImageUrls = Array.from(new Set([...existingVehicleImageUrls, ...uploadedVehicleUrls]));

      const uploadedGuideUrl = await uploadTourGuideImageIfNeeded();
      const uploadedItinerary = await uploadItineraryImagesIfNeeded(itinerary);

      const payload: TripPayload = {
        title,
        description,
        origin,
        destination,
        pricePerSeat: Number(pricePerSeat),
        totalSeats: Number(totalSeats),
        departureTime: departureTime.length === 16 ? `${departureTime}:00` : departureTime,
        categoryId: Number(categoryId),
        imageUrls: mergedImageUrls,
        vehicleImageUrls: mergedVehicleImageUrls,

        transportationType: transportationType.trim(),
        vehicleCapacity: Number(vehicleCapacity),
        isWholeVehicleBooking: Boolean(isWholeVehicleBooking),
        wholeVehiclePrice: isWholeVehicleBooking ? Number(wholeVehiclePrice) : undefined,

        scheduleDescription: scheduleDescription || undefined,
        availabilitySchedule: availabilitySchedule || undefined,

        hasTourGuide: Boolean(hasTourGuide),
        tourGuideDescription: hasTourGuide ? tourGuideDescription || undefined : undefined,
        tourGuideImageUrl: hasTourGuide ? uploadedGuideUrl || undefined : undefined,

        mealsIncluded: Boolean(mealsIncluded),
        diningDetails: mealsIncluded ? diningDetails || undefined : undefined,

        itinerary: uploadedItinerary
          .filter((s) => s.name.trim() || s.description.trim() || (s.imageUrl || "").trim())
          .map((s) => ({
            name: s.name,
            description: s.description,
            imageUrl: s.imageUrl,
          })),
      };

      if (payload.imageUrls.length === 0) {
        toast.error("Please upload at least one image");
        setSaving(false);
        return;
      }

      if (editId) {
        await updateDriverTrip(editId, payload);
        toast.success("Trip updated");
      } else {
        await createDriverTrip(payload);
        toast.success("Trip created");
      }

      resetForm();
      await loadTrips();
    } catch (err: any) {
      toast.error(err?.message || err?.response?.data?.message || "Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this trip?")) return;
    try {
      await deleteDriverTrip(id);
      toast.success("Trip deleted");
      await loadTrips();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete trip");
    }
  };

  const openTripDetail = (id: number) => {
    navigate(`/driver/trips/${id}`);
  };

  if (!isDriver) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Driver Access Required</h2>
          <p className="text-slate-500 mb-6">You need ROLE_DRIVER to manage trips.</p>
          <button onClick={() => navigate("/dashboard")} className="px-5 py-3 rounded-xl bg-[#00eb5b] text-slate-900 hover:bg-[#00ab42] hover:text-white transition-colors">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title="Driver Trips" subtitle="Create and manage your posted trips.">
      <div className="max-w-7xl mx-auto">

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
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
              <input type="file" aria-label="Trip images" accept="image/*" multiple onChange={handleSelectFiles} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
              <p className="text-[11px] text-slate-500 mt-1">Scenery/destination shots. Tip: select multiple in one pick or pick more files again to append.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Vehicle images</label>
              <input type="file" aria-label="Vehicle images" accept="image/*" multiple onChange={handleSelectVehicleFiles} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
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
                        if (f.size > 10 * 1024 * 1024) {
                          toast.error(`Image too large: ${f.name}. Max size is 10MB.`);
                          e.target.value = "";
                          return;
                        }
                        setTourGuideImageFile(f);
                        e.target.value = "";
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
                            if (f.size > 10 * 1024 * 1024) {
                              toast.error(`Image too large: ${f.name}. Max size is 10MB.`);
                              e.target.value = "";
                              return;
                            }
                            setItinerary((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], imageFile: f };
                              return next;
                            });
                            e.target.value = "";
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

          {(existingImageUrls.length > 0 || imageFiles.length > 0) && (
            <div className="mt-3">
              <p className="text-sm text-slate-600 mb-2">Images ({existingImageUrls.length + imageFiles.length})</p>
              <div className="flex gap-2 flex-wrap">
                {existingImageUrls.map((url, idx) => (
                  <div key={`${url}-${idx}`} className="relative">
                    <img src={url} alt={`existing-${idx}`} className="w-20 h-20 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setExistingImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imageFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="px-3 py-2 bg-slate-100 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                    <span className="truncate max-w-[140px]" title={file.name}>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(existingVehicleImageUrls.length > 0 || vehicleImageFiles.length > 0) && (
            <div className="mt-3">
              <p className="text-sm text-slate-600 mb-2">Vehicle Images ({existingVehicleImageUrls.length + vehicleImageFiles.length})</p>
              <div className="flex gap-2 flex-wrap">
                {existingVehicleImageUrls.map((url, idx) => (
                  <div key={`${url}-${idx}`} className="relative">
                    <img src={url} alt={`vehicle-existing-${idx}`} className="w-20 h-20 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setExistingVehicleImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {vehicleImageFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="px-3 py-2 bg-slate-100 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                    <span className="truncate max-w-[140px]" title={file.name}>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setVehicleImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button disabled={saving} className="mt-4 px-6 py-3 rounded-xl bg-[#00eb5b] text-slate-900 font-semibold hover:bg-[#00ab42] hover:text-white disabled:opacity-50 transition-colors">
            {saving ? "Saving..." : editId ? "Update Trip" : "Create Trip"}
          </button>
        </form>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-4">My Trips</h2>
          {loading ? (
            <div className="text-slate-500">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="text-slate-500">No trips yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <div key={trip.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all">
                  <div className="relative">
                    <img src={trip.images?.[0] || "https://placehold.co/600x360?text=Trip+Image"} alt={trip.title} className="w-full h-44 object-cover" />
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 text-[#00ab42] font-black text-xs flex items-center justify-center shadow">
                      SG
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-black/70 text-white">
                      {trip.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-black text-slate-900 line-clamp-1">{trip.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{trip.origin} → {trip.destination}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px] mt-1">
                      {trip.description || "No description provided for this trip."}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-[#00ab42] font-bold">${trip.pricePerSeat}/seat</span>
                      <span className="text-slate-500">{trip.availableSeats}/{trip.totalSeats} seats</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{new Date(trip.departureTime).toLocaleString()}</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => openTripDetail(trip.id)} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100">View</button>
                      <button onClick={() => startEdit(trip.id)} className="px-3 py-1.5 text-xs rounded-lg bg-amber-100 text-amber-700">Edit</button>
                      <button onClick={() => handleDelete(trip.id)} className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-700">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DriverTrips;
