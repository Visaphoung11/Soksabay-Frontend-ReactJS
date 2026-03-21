import axios from "axios";

type AuthRequestConfig = {
    skipAuth?: boolean;
};

export const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
    withCredentials: true,
});

// Attach Bearer token from localStorage to every request
api.interceptors.request.use((config) => {
    const customConfig = config as typeof config & AuthRequestConfig;
    const shouldSkipAuth = customConfig.skipAuth === true;

    const token = localStorage.getItem("accessToken");
    if (token && !shouldSkipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
        delete config.headers.Authorization;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("soksabay_user");
        }
        return Promise.reject(error);
    }
);
