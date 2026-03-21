import { api } from "../lib/axios";
import type { DriverApplication, MediaUploadResponse } from "../types/auth";

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

export const uploadImage = async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<MediaUploadResponse>("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
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
