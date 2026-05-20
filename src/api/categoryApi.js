import axios from './axios';

export const getCategories = () => axios.get('/categories');
export const createCategory = (data) =>
  axios.post('/categories', data, {
    toastMessage: 'Category created successfully!',
  });
