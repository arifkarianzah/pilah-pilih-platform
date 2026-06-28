import api from "./api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const registerPetugas = async (name, email, phone, password) => {
  const res = await api.post("/auth/register-petugas", { name, email, phone, password });
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/profile");
  return res.data;
};

export const updateProfile = async (name) => {
  const res = await api.put("/auth/profile", { name });
  return res.data;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
