import api from './api.js';

export const requestPasswordReset = async (email) => {
  const { data } = await api.post('/auth/forgot-password', {
    email: email.trim().toLowerCase()
  });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
};
