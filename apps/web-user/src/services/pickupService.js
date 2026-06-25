import api from "./api";

// Mengambil daftar order milik user
export const getMyPickups = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/pickups/my", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
