import axios from "axios";

// Create a configured Axios instance
export const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    // Crucial for sending and receiving our HTTP-only jwt_token cookie
    withCredentials: true,
});

// Optional: Add interceptors for global error handling if needed in the future
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // We could handle global 401s here if desired
        return Promise.reject(error);
    }
);
