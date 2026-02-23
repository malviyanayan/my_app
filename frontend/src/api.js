import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Check for token expiration or invalid token
      if (
        status === 401 &&
        (data.message === "Invalid token" ||
          data.message === "Token expired" ||
          data.message === "jwt expired" ||
          data.message === "jwt malformed" ||
          data.message === "No token provided" ||
          data.message === "Unauthorized" ||
          data.message === "Authentication failed")
      ) {
        // Clear all user data from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");

        // Show notification
        toast.error("Session expired. Please login again.");

        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      }
    }

    return Promise.reject(error);
  }
);

export default API;

// Product APIs
export const getAllProducts = () => API.get("/products");
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (productData) => API.post("/products", productData);
export const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const getProductsByCategory = (category) => API.get(`/products/category/${category}`);
