import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
    withCredentials: true,
});

// Attach Bearer token from localStorage to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
