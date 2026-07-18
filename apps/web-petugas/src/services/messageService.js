import api from "./api";

// Get messages by pickup id
export const getMessagesByPickupId = async (pickupId) => {
  const res = await api.get(`/messages/${pickupId}`);
  return res.data;
};

// Send a message
export const sendMessage = async (pickup_id, receiver_id, message) => {
  const res = await api.post(`/messages`, {
    pickup_id,
    receiver_id,
    message
  });
  return res.data;
};

// Get contacts for Petugas
export const getPetugasContacts = async () => {
  const res = await api.get(`/pickups/contacts`);
  return res.data;
};

// Get messages by User ID (1-on-1)
export const getMessagesByUser = async (userId) => {
  const res = await api.get(`/messages/user/${userId}`);
  return res.data;
};
