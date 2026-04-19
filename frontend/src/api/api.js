import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

export const api = {
  auth: {
    login: (email, password) =>
      apiClient.post('/auth/login', { email, password }).then((res) => res.data),
    register: (name, email, password) =>
      apiClient
        .post('/auth/register', { name, email, password })
        .then((res) => res.data),
    me: () => apiClient.get('/auth/me').then((res) => res.data),
    changePassword: (currentPassword, newPassword) =>
      apiClient
        .post('/auth/password', { currentPassword, newPassword })
        .then((res) => res.data),
    deleteAccount: () =>
      apiClient.delete('/auth/account').then((res) => res.data),
  },
  vault: {
    getAll: () => apiClient.get('/vault').then((res) => res.data),
    create: (formData) =>
      apiClient
        .post('/vault', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => res.data),
    update: (id, data) => apiClient.put(`/vault/${id}`, data).then((res) => res.data),
    delete: (id) => apiClient.delete(`/vault/${id}`).then((res) => res.data),
  },
  beneficiary: {
    getAll: () => apiClient.get('/beneficiary').then((res) => res.data),
    add: (data) => apiClient.post('/beneficiary', data).then((res) => res.data),
    remove: (id) => apiClient.delete(`/beneficiary/${id}`).then((res) => res.data),
    verify: (token) =>
      apiClient.get(`/beneficiary/verify/${token}`).then((res) => res.data),
  },
  access: {
    getGrants: () => apiClient.get('/access').then((res) => res.data),
    grant: (vaultItemId, beneficiaryId) =>
      apiClient
        .post('/access/grant', { vaultItemId, beneficiaryId })
        .then((res) => res.data),
    revoke: (id) =>
      apiClient.delete(`/access/grant/${id}`).then((res) => res.data),
    getShared: (id, token) =>
      apiClient
        .get(`/access/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.data),
  },
  activity: {
    ping: () => apiClient.post('/activity/ping').then((res) => res.data),
    getRisk: () => apiClient.get('/activity/risk').then((res) => res.data),
    getRule: () => apiClient.get('/activity/rule').then((res) => res.data),
    setRule: (thresholdDays, warningDays) =>
      apiClient
        .post('/activity/rule', { thresholdDays, warningDays })
        .then((res) => res.data),
    getLog: () => apiClient.get('/activity/log').then((res) => res.data),
  },
};
