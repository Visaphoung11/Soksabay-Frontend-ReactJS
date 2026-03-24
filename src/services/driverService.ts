import { api } from "../lib/axios";
import type {
    Category,
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

export const createDriverTrip = async (payload: TripPayload): Promise<Trip> => {
    try {
        const res = await api.post<TripApiResponse | Trip>("/driver/trips", payload);
        const data = (res.data as TripApiResponse)?.data ?? (res.data as Trip);
        return data;
    } catch (error: any) {
        throw new Error(extractApiErrorMessage(error, "Failed to create trip"));
    }
};

export const getMyDriverTrips = async (): Promise<Trip[]> => {
    const res = await api.get<Trip[] | { data: Trip[] }>("/driver/trips/my");
    return Array.isArray(res.data) ? res.data : res.data.data;
};

export const getDriverTripById = async (id: number): Promise<Trip> => {
    const res = await api.get<Trip[] | Trip | { data: Trip | Trip[] }>(`/driver/trips/${id}`);
    const raw: any = (res.data as any)?.data ?? res.data;
    return Array.isArray(raw) ? raw[0] : raw;
};

export const updateDriverTrip = async (id: number, payload: TripPayload): Promise<Trip> => {
    try {
        const res = await api.put<TripApiResponse | Trip>(`/driver/trips/${id}`, payload);
        const data = (res.data as TripApiResponse)?.data ?? (res.data as Trip);
        return data;
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
    return Array.isArray(raw) ? raw[0] : raw;
};

export const searchPublicTrips = async (params: TripSearchParams = {}): Promise<Trip[]> => {
    const res = await api.get<Trip[] | { data: Trip[] }>("/public/trips/search", { params });
    return Array.isArray(res.data) ? res.data : res.data.data;
};

export const getCategories = async (): Promise<Category[]> => {
    const res = await api.get<Category[] | { data: Category[] }>("/categories");
    return Array.isArray(res.data) ? res.data : res.data.data;
};
