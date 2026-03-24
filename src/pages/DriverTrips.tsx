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
  uploadMultipleImages,
} from "../services/driverService";
import type { Category, Trip, TripPayload } from "../types/auth";
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
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeImage, setActiveImage] = useState(0);

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
  const [saving, setSaving] = useState(false);

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
      setCategoryId(1);
      setExistingImageUrls(trip.images || []);
      setImageFiles([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load trip details");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const uploadedUrls = imageFiles.length ? await uploadMultipleImages(imageFiles) : [];
      const payload: TripPayload = {
        title,
        description,
        origin,
        destination,
        pricePerSeat: Number(pricePerSeat),
        totalSeats: Number(totalSeats),
        departureTime: departureTime.length === 16 ? `${departureTime}:00` : departureTime,
        categoryId: Number(categoryId),
        imageUrls: [...existingImageUrls, ...uploadedUrls],
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

  const openTripDetail = async (id: number) => {
    try {
      const detail = await getDriverTripById(id);
      setSelectedTrip(detail);
      setActiveImage(0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load trip details");
    }
  };

  if (!isDriver) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Driver Access Required</h2>
          <p className="text-slate-500 mb-6">You need ROLE_DRIVER to manage trips.</p>
          <button onClick={() => navigate("/dashboard")} className="px-5 py-3 rounded-xl bg-blue-600 text-white">Back to Dashboard</button>
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
            </ul>
          </div>

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
              <p className="text-[11px] text-slate-500 mt-1">Tip: select multiple in one pick or pick more files again to append.</p>
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Trip description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Clean SUV, free water, pickup at Central Market..." className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-24" />
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

          <button disabled={saving} className="mt-4 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">
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
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 text-blue-700 font-black text-xs flex items-center justify-center shadow">
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
                      <span className="text-blue-600 font-bold">${trip.pricePerSeat}/seat</span>
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

      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h2 className="text-xl font-bold">{selectedTrip.title}</h2>
              <button onClick={() => setSelectedTrip(null)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>
            <img
              src={selectedTrip.images?.[activeImage] || "https://placehold.co/1200x700?text=Trip+Image"}
              alt={selectedTrip.title}
              className="w-full h-72 md:h-96 object-cover"
            />
            <div className="p-4 flex gap-2 overflow-x-auto border-b border-slate-100">
              {(selectedTrip.images || []).map((img, idx) => (
                <button key={`${img}-${idx}`} onClick={() => setActiveImage(idx)}>
                  <img
                    src={img}
                    alt={`Trip ${idx + 1}`}
                    className={`w-20 h-20 rounded-lg object-cover border-2 ${activeImage === idx ? "border-blue-500" : "border-transparent"}`}
                  />
                </button>
              ))}
            </div>
            <div className="p-6 text-sm space-y-2">
              <p><span className="font-semibold">Route:</span> {selectedTrip.origin} → {selectedTrip.destination}</p>
              <p><span className="font-semibold">Departure:</span> {new Date(selectedTrip.departureTime).toLocaleString()}</p>
              <p><span className="font-semibold">Price:</span> ${selectedTrip.pricePerSeat}/seat</p>
              <p><span className="font-semibold">Seats:</span> {selectedTrip.availableSeats}/{selectedTrip.totalSeats}</p>
              <p><span className="font-semibold">Category:</span> {selectedTrip.categoryName}</p>
              <p><span className="font-semibold">Description:</span> {selectedTrip.description}</p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default DriverTrips;
