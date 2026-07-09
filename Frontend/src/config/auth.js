import api from "./api";

export async function loginRequest(email, password) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function registerRequest(data) {
  const res = await api.post("/auth/register", data);
  return res.data;
}

export async function getProfileRequest() {
  const res = await api.get("/auth/profile");
  return res.data;
}
