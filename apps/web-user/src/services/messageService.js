import api from "./api";

// Mengambil pesan berdasarkan ID pickup
export const getMessagesByPickupId = async (pickupId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get(`/messages/${pickupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengirim pesan baru
export const sendMessage = async (pickupId, receiverId, message) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.post(
      "/messages",
      { pickup_id: pickupId, receiver_id: receiverId, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengambil jumlah pesan yang belum dibaca
export const getUnreadCount = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/messages/unread-count", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mengambil pesan 1-on-1 berdasarkan User ID (Petugas)
export const getMessagesByUser = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get(`/messages/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
