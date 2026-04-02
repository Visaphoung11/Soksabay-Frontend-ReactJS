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

export interface WsTokenResponse {
    statusCode: number;
    message: string;
    data: {
        userId: number;
        accessToken: string;
    };
}

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>(
        "/auth-service/register",
        payload,
        {
            skipAuth: true,
        } as any
    );
    return res.data;
};

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>(
        "/auth-service/authenticate",
        payload,
        {
            skipAuth: true,
        } as any
    );
    return res.data;
};

/**
 * OAuth2 users authenticate via HttpOnly cookie; this endpoint returns a short-lived JWT
 * for WebSocket STOMP CONNECT (Authorization header).
 */
export const getWsToken = async (): Promise<WsTokenResponse> => {
    const res = await api.get<WsTokenResponse>("/auth-service/ws-token", {
        skipAuth: true,
    } as any);
    return res.data;
};
