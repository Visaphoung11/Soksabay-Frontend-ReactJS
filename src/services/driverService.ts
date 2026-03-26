import { api } from "../lib/axios";
import type {
    Booking,
    Category,
    CreateBookingPayload,
    DriverApplication,
    MediaUploadResponse,
    Trip,
    TripPayload,
    TripSearchParams,
} from "../types/auth";

export interface ApplyDriverPayload {
    nationalId: string;
    licenseNumber: string;
    vehicleType: string;
    idCardImageUrl: string;
    idCardPublicId: string;
}

export interface ApplyDriverResponse {
    data: DriverApplication;
    message: string;
    success: boolean;
    timestamp: string;
}

export interface DriverDecisionResponse {
    data: DriverApplication;
    message: string;
    success: boolean;
    timestamp: string;
}

export interface TripApiResponse {
    data: Trip;
    message: string;
    success: boolean;
    timestamp: string;
}

const normalizeTrip = (input: any): Trip => {
    const raw = input?.data ?? input;

    const normalizedImages = (() => {
        const candidates = raw?.images ?? raw?.imageUrls ?? raw?.tripImages ?? [];
        if (!Array.isArray(candidates)) return [];
        return candidates
            .map((item: any) => {
                if (typeof item === "string") return item;
                return item?.url || item?.secure_url || item?.imageUrl || item?.image_url || "";
            })
            .filter(Boolean);
    })();

    return {
        id: Number(raw?.id ?? 0),
        title: raw?.title ?? "",
        description: raw?.description ?? "",
        origin: raw?.origin ?? "",
        destination: raw?.destination ?? "",
        pricePerSeat: Number(raw?.pricePerSeat ?? 0),
        totalSeats: Number(raw?.totalSeats ?? 0),
        availableSeats: Number(raw?.availableSeats ?? raw?.totalSeats ?? 0),
        departureTime: raw?.departureTime ?? new Date().toISOString(),
        status: raw?.status ?? "AVAILABLE",
        images: normalizedImages,
        driverName: raw?.driverName ?? raw?.driver?.fullName ?? raw?.driver?.name ?? "",
        categoryName: raw?.categoryName ?? raw?.category?.name ?? "",
        categoryId: Number(raw?.categoryId ?? raw?.category?.id ?? 0) || undefined,
    } as Trip;
};

const extractApiErrorMessage = (error: any, fallback: string) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.message ||
        fallback
    );
};

export const uploadImage = async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<MediaUploadResponse>("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];

    // Upload sequentially to avoid overwhelming backend/cloud provider,
    // and to report exactly which file failed.
    for (const file of files) {
        try {
            const uploaded = await uploadImage(file);
            urls.push(uploaded.secure_url || uploaded.url);
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message;
            const reason = backendMessage || `Upload failed for file: ${file.name}`;
            throw new Error(reason);
        }
    }

    return urls;
};

export const applyAsDriver = async (
    payload: ApplyDriverPayload
): Promise<ApplyDriverResponse> => {
    const res = await api.post<ApplyDriverResponse>("/driver-applications/apply", payload);
    return res.data;
};

export const approveDriverApplication = async (id: number): Promise<DriverDecisionResponse> => {
    const res = await api.patch<DriverDecisionResponse>(`/driver-applications/${id}/approve`);
    return res.data;
};

export const rejectDriverApplication = async (id: number): Promise<DriverDecisionResponse> => {
    const res = await api.patch<DriverDecisionResponse>(`/driver-applications/${id}/reject`);
    return res.data;
};

export const reapplyAsDriver = async (id: number, payload: ApplyDriverPayload): Promise<ApplyDriverResponse> => {
    console.log('🔄 Calling reapply endpoint:', `PUT /driver-applications/${id}/reapply`, payload);
    const res = await api.put<ApplyDriverResponse>(`/driver-applications/${id}/reapply`, payload);
    console.log('✅ Reapply response:', res.data);
    return res.data;
};

export const getMyDriverApplication = async (): Promise<DriverApplication | null> => {
    try {
        console.log('🔍 Checking for existing application...');
        const res = await api.get<DriverApplication | { data: DriverApplication }>("/driver-applications/my");
        const application = (res.data as any)?.data ?? (res.data as DriverApplication) ?? null;
        console.log('📋 Application found:', application);
        return application;
    } catch (error: any) {
        console.log('❌ Error checking application:', error?.response?.status, error?.response?.data);
        if (error?.response?.status === 404) {
            return null; // No application found
        }
        throw error;
    }
};

export const createDriverTrip = async (payload: TripPayload): Promise<Trip> => {
    try {
        const requestBody = {
            ...payload,
            images: payload.imageUrls,
            tripImages: payload.imageUrls,
        };
        const res = await api.post<TripApiResponse | Trip>("/driver/trips", requestBody as any);
        const data = (res.data as TripApiResponse)?.data ?? (res.data as Trip);
        return normalizeTrip(data);
    } catch (error: any) {
        throw new Error(extractApiErrorMessage(error, "Failed to create trip"));
    }
};

export const getMyDriverTrips = async (): Promise<Trip[]> => {
    const res = await api.get<Trip[] | { data: Trip[] }>("/driver/trips/my");
    const rawList = Array.isArray(res.data) ? res.data : res.data.data;
    return (rawList || []).map(normalizeTrip);
};

export const getDriverTripById = async (id: number): Promise<Trip> => {
    const res = await api.get<Trip[] | Trip | { data: Trip | Trip[] }>(`/driver/trips/${id}`);
    const raw: any = (res.data as any)?.data ?? res.data;
    const entity = Array.isArray(raw) ? raw[0] : raw;
    return normalizeTrip(entity);
};

export const updateDriverTrip = async (id: number, payload: TripPayload): Promise<Trip> => {
    try {
        const requestBody = {
            ...payload,
            images: payload.imageUrls,
            tripImages: payload.imageUrls,
        };
        const res = await api.put<TripApiResponse | Trip>(`/driver/trips/${id}`, requestBody as any);
        const data = (res.data as TripApiResponse)?.data ?? (res.data as Trip);
        return normalizeTrip(data);
    } catch (error: any) {
        throw new Error(extractApiErrorMessage(error, "Failed to update trip"));
    }
};

export const deleteDriverTrip = async (id: number): Promise<void> => {
    await api.delete(`/driver/trips/${id}`);
};

export const getPublicTripById = async (id: number): Promise<Trip> => {
    const res = await api.get<Trip[] | Trip | { data: Trip | Trip[] }>(`/public/trips/${id}`);
    const raw: any = (res.data as any)?.data ?? res.data;
    const entity = Array.isArray(raw) ? raw[0] : raw;
    return normalizeTrip(entity);
};

export const searchPublicTrips = async (params: TripSearchParams = {}): Promise<Trip[]> => {
    const res = await api.get<Trip[] | { data: Trip[] }>("/public/trips/search", { params });
    const rawList = Array.isArray(res.data) ? res.data : res.data.data;
    return (rawList || []).map(normalizeTrip);
};

export const getCategories = async (): Promise<Category[]> => {
    const res = await api.get<Category[] | { data: Category[] }>("/categories");
    return Array.isArray(res.data) ? res.data : res.data.data;
};

export const createBooking = async (payload: CreateBookingPayload): Promise<Booking> => {
    const res = await api.post<Booking | { data: Booking }>("/bookings", payload);
    return (res.data as any)?.data ?? (res.data as Booking);
};

export const getMyBookings = async (): Promise<Booking[]> => {
    const res = await api.get<Booking[] | { data: Booking[] }>("/bookings/my");
    return Array.isArray(res.data) ? res.data : res.data.data;
};

export const getDriverBookingRequests = async (): Promise<Booking[]> => {
    const res = await api.get<Booking[] | { data: Booking[] }>("/driver/bookings/requests");
    return Array.isArray(res.data) ? res.data : res.data.data;
};

export const respondDriverBooking = async (id: number, accept: boolean): Promise<Booking> => {
    const res = await api.patch<Booking | { data: Booking }>(`/driver/bookings/${id}/respond`, null, {
        params: { accept },
    });
    return (res.data as any)?.data ?? (res.data as Booking);
};
