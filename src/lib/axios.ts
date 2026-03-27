import axios from "axios";

type AuthRequestConfig = {
    skipAuth?: boolean;
};

// Get base URL from environment variables or fallback to localhost
const getBaseURL = () => {
    // Check for environment variable first
    const envURL = import.meta.env.VITE_API_BASE_URL;
    if (envURL) {
        return envURL;
    }
    
    // Check for custom URL in localStorage (for easy switching)
    const customURL = localStorage.getItem("API_BASE_URL");
    if (customURL) {
        return customURL;
    }
    
    // Default to localhost
    return "http://localhost:8080/api/v1";
};

export const api = axios.create({
    baseURL: getBaseURL(),
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
