// api/authAPI.js
// Wraps all auth-related Axios calls (SAD Section 12.2): register, login,
// getProfile, updateProfile, uploadResume.

import axiosInstance from '../utils/axiosInstance';

export function register({ name, email, password }) {
  return axiosInstance.post('/auth/register', { name, email, password }).then((res) => res.data);
}

export function login({ email, password }) {
  return axiosInstance.post('/auth/login', { email, password }).then((res) => res.data);
}

export function getProfile() {
  return axiosInstance.get('/auth/profile').then((res) => res.data);
}

export function updateProfile({ name, targetRole, skills }) {
  return axiosInstance.put('/auth/profile', { name, targetRole, skills }).then((res) => res.data);
}

export function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  return axiosInstance
    .post('/auth/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}
