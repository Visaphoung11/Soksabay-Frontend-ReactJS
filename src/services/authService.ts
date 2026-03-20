import { api } from "../lib/axios";
import type { User } from "../types/auth";

export interface RegisterPayload {
    fullName: string;
    email: string;
    contactNumber: string;
    gender: string;
    password: string;
}

export interface RegisterResponse {
    accessToken: string;
    refreshToken: string;
    message: string;
    statusCode: number;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    data: User;
    message: string;
    statusCode: number;
}

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>("/auth-service/register", payload);
    return res.data;
};

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/auth-service/authenticate", payload);
    return res.data;
};
