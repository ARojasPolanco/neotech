import api from "../config/api";

export async function getProducts(filters = {}) {
  const res = await api.get("/products", { params: filters });
  return res.data;
}

export async function getProduct(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function getProductVariants(productId) {
  const res = await api.get(`/products/${productId}/variants`);
  return res.data;
}

export async function getFeaturedProducts() {
  const res = await api.get("/products/featured");
  return res.data;
}
