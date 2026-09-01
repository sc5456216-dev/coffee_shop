import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products/', { params });
    return response.data;
  },
  getProduct: async (slug) => {
    const response = await api.get(`/products/${slug}/`);
    return response.data;
  }
};