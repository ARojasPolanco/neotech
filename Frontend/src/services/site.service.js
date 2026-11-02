import api from "../config/api.js";

export async function getSiteSettings() {
  const res = await api.get("/config/site");
  return res.data;
}
