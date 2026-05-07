import axios from './axios';

export const getCategories = async () => {
  const response = await axios.get('/categories');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await axios.post('/categories', data);
  return response.data;
};
