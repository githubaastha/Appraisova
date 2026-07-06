import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// request interceptor — add token
api.interceptors.request.use(
    (config) => {
        const stored = localStorage.getItem("loggedInUser");
        const token = stored ? JSON.parse(stored).token : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// response interceptor — handle 401 with refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const stored = localStorage.getItem("loggedInUser");
                const user = stored ? JSON.parse(stored) : null;
                const refreshToken = user?.refreshToken;

                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const res = await axios.post("http://localhost:8080/api/auth/refresh", {
                    refreshToken,
                });

                // Update stored user object with new access token
                const updatedUser = { ...user, token: res.data.token };
                localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
                return api(originalRequest);

            } catch (refreshError) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

       
        if (error.response?.status === 401) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;