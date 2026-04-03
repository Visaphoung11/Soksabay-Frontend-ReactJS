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
import DriverTripForm from "../components/driver/DriverTripForm";
import DriverTripList from "../components/driver/DriverTripList";

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

  // VEHICLE & PRICING FIELDS
  const [transportationType, setTransportationType] = useState<string>("");
  const [vehicleCapacity, setVehicleCapacity] = useState<number>(4);
  const [isWholeVehicleBooking, setIsWholeVehicleBooking] = useState<boolean>(false);
  const [wholeVehiclePrice, setWholeVehiclePrice] = useState<number>(0);

  // SCHEDULING & DETAILS
  const [scheduleDescription, setScheduleDescription] = useState<string>("");
  const [availabilitySchedule, setAvailabilitySchedule] = useState<string>("");

  // OPTIONAL SERVICES
  const [hasTourGuide, setHasTourGuide] = useState<boolean>(false);
  const [tourGuideDescription, setTourGuideDescription] = useState<string>("");
  const [tourGuideImageUrl, setTourGuideImageUrl] = useState<string>("");
  const [tourGuideImageFile, setTourGuideImageFile] = useState<File | null>(null);

  const [mealsIncluded, setMealsIncluded] = useState<boolean>(false);
  const [diningDetails, setDiningDetails] = useState<string>("");

  // NESTED ITINERARY
  type ItineraryDraft = TripItineraryItem & { imageFile?: File | null };
  const [itinerary, setItinerary] = useState<ItineraryDraft[]>([]);

  const transportKey = useMemo(() => transportationType.trim().toUpperCase(), [transportationType]);
  const isTukTuk = useMemo(() => transportKey.includes("TUK_TUK") || transportKey.includes("TUKTUK"), [transportKey]);
  const isBus = useMemo(() => transportKey.includes("BUS"), [transportKey]);

  useEffect(() => {
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
    setImageFiles((prev) => [...prev, ...nextFiles]);
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
    setVehicleImageFiles((prev) => [...prev, ...nextFiles]);
    e.target.value = "";
  };

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await getMyDriverTrips();
      setTrips(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || "Failed to fetch your trips");
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
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        toast.error(error?.response?.data?.message || "Failed to load categories");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || "Failed to load trip details");
    }
  };

  const uploadTourGuideImageIfNeeded = async (): Promise<string> => {
    if (!tourGuideImageFile) return tourGuideImageUrl;
    const uploaded = await uploadImage(tourGuideImageFile);
    return uploaded.secure_url || uploaded.url || "";
  };

  const uploadItineraryImagesIfNeeded = async (items: ItineraryDraft[]): Promise<ItineraryDraft[]> => {
    const next = [...items];
    for (let i = 0; i < next.length; i++) {
      const f = next[i].imageFile;
      if (!f) continue;
      const uploaded = await uploadImage(f);
      next[i] = {
        ...next[i],
        imageUrl: uploaded.secure_url || uploaded.url,
        imageFile: null,
      };
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!transportationType.trim()) {
        toast.error("Transportation type is required");
        setSaving(false);
        return;
      }
      if (isTukTuk && (vehicleCapacity > 5 || !isWholeVehicleBooking)) {
        toast.error("TUK_TUK constraints violated");
        setSaving(false);
        return;
      }

      const uploadedUrls = imageFiles.length ? await uploadMultipleImages(imageFiles) : [];
      const mergedImageUrls = [...existingImageUrls, ...uploadedUrls];

      const uploadedVehicleUrls = vehicleImageFiles.length ? await uploadMultipleImages(vehicleImageFiles) : [];
      const mergedVehicleImageUrls = [...existingVehicleImageUrls, ...uploadedVehicleUrls];

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
        scheduleDescription,
        availabilitySchedule,
        hasTourGuide,
        tourGuideDescription: hasTourGuide ? tourGuideDescription : undefined,
        tourGuideImageUrl: hasTourGuide ? uploadedGuideUrl : undefined,
        mealsIncluded,
        diningDetails: mealsIncluded ? diningDetails : undefined,
        itinerary: uploadedItinerary.map((s) => ({
          name: s.name,
          description: s.description,
          imageUrl: s.imageUrl,
        })),
      };

      if (editId) {
        await updateDriverTrip(editId, payload);
        toast.success("Trip updated");
      } else {
        await createDriverTrip(payload);
        toast.success("Trip created");
      }

      resetForm();
      await loadTrips();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || "Failed to save trip");
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
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || "Failed to delete trip");
    }
  };

  if (!isDriver) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Driver Access Required</h2>
          <p className="text-slate-500 mb-6">You need ROLE_DRIVER to manage trips.</p>
          <button onClick={() => navigate("/dashboard")} className="px-5 py-3 rounded-xl bg-[#00eb5b] text-slate-900 hover:bg-[#00ab42]">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout title="Driver Trips" subtitle="Create and manage your posted trips.">
      <div className="max-w-7xl mx-auto">
        <DriverTripForm
          editId={editId}
          resetForm={resetForm}
          saving={saving}
          onSubmit={handleSubmit}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          origin={origin}
          setOrigin={setOrigin}
          destination={destination}
          setDestination={setDestination}
          pricePerSeat={pricePerSeat}
          setPricePerSeat={setPricePerSeat}
          totalSeats={totalSeats}
          setTotalSeats={setTotalSeats}
          departureTime={departureTime}
          setDepartureTime={setDepartureTime}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          categories={categories}
          categoriesLoading={categoriesLoading}
          transportationType={transportationType}
          setTransportationType={setTransportationType}
          vehicleCapacity={vehicleCapacity}
          setVehicleCapacity={setVehicleCapacity}
          isWholeVehicleBooking={isWholeVehicleBooking}
          setIsWholeVehicleBooking={setIsWholeVehicleBooking}
          wholeVehiclePrice={wholeVehiclePrice}
          setWholeVehiclePrice={setWholeVehiclePrice}
          scheduleDescription={scheduleDescription}
          setScheduleDescription={setScheduleDescription}
          availabilitySchedule={availabilitySchedule}
          setAvailabilitySchedule={setAvailabilitySchedule}
          hasTourGuide={hasTourGuide}
          setHasTourGuide={setHasTourGuide}
          tourGuideDescription={tourGuideDescription}
          setTourGuideDescription={setTourGuideDescription}
          tourGuideImageUrl={tourGuideImageUrl}
          setTourGuideImageUrl={setTourGuideImageUrl}
          tourGuideImageFile={tourGuideImageFile}
          setTourGuideImageFile={setTourGuideImageFile}
          mealsIncluded={mealsIncluded}
          setMealsIncluded={setMealsIncluded}
          diningDetails={diningDetails}
          setDiningDetails={setDiningDetails}
          itinerary={itinerary}
          setItinerary={setItinerary}
          onSelectFiles={handleSelectFiles}
          onSelectVehicleFiles={handleSelectVehicleFiles}
          isTukTuk={isTukTuk}
          isBus={isBus}
        />

        {(existingImageUrls.length > 0 || imageFiles.length > 0) && (
          <div className="bg-white border p-4 rounded-2xl mb-6">
            <p className="text-sm font-bold mb-2">Trip Images Preview</p>
            <div className="flex gap-2 flex-wrap">
              {existingImageUrls.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={url} className="w-20 h-20 object-cover rounded-lg border" />
                  <button onClick={() => setExistingImageUrls(p => p.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs">✕</button>
                </div>
              ))}
              {imageFiles.map((file, idx) => (
                <div key={idx} className="relative">
                  <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded-lg border" />
                  <button onClick={() => setImageFiles(p => p.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 text-white text-xs">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DriverTripList
          loading={loading}
          trips={trips}
          onEdit={startEdit}
          onDelete={handleDelete}
          onDetail={(id) => navigate(`/driver/trips/${id}`)}
        />
      </div>
    </AppLayout>
  );
};

export default DriverTrips;
