import api from "./api";

// Get pending pickups
export const getPendingPickups = async () => {
  const res = await api.get("/pickups/pending");
  return res.data;
};

// Get all pickups (pending + assigned to me)
export const getAllPickups = async () => {
  const res = await api.get("/pickups/petugas/all");
  return res.data;
};

// Get active pickups assigned to me
export const getMyActivePickups = async () => {
  const res = await api.get("/pickups/petugas/active");
  return res.data;
};

// Get single pickup detail
export const getPickupById = async (id) => {
  const res = await api.get(`/pickups/${id}`);
  return res.data;
};

// Update status of a pickup (accept, on_the_way, arrived, collected, waiting_collector, cancelled)
export const updatePickupStatus = async (id, status, extraData = {}) => {
  const res = await api.put(`/pickups/status/${id}`, { status, ...extraData });
  return res.data;
};

// Upload photo proof
export const uploadPickupPhoto = async (id, file, photoType) => {
  const formData = new FormData();
  formData.append("photo", file);
  formData.append("photo_type", photoType);

  const res = await api.post(`/pickups/photo/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Legacy exports for old components
export const acceptPickup = async (id) => updatePickupStatus(id, "accepted");
export const weighPickup = async (id, items) => {
  const res = await api.put(`/pickups/pengepul/weigh/${id}`, { items });
  return res.data;
};
export const completePickupTransaction = async (id, payment_method) => {
  const res = await api.put(`/pickups/pengepul/confirm/${id}`, { payment_method });
  return res.data;
};
