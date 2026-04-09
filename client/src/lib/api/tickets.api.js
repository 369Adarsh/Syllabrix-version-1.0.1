import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Ensure we don't double up on /api
const FINAL_API = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('syllabrix_token')}` }
});

export const adminTicketAPI = {
  getTickets: (params = {}) => axios.get(`${FINAL_API}/admin/tickets`, { ...getHeaders(), params }),
  getTicket: (id) => axios.get(`${FINAL_API}/admin/tickets/${id}`, getHeaders()),
  addReply: (id, message) => axios.post(`${FINAL_API}/admin/tickets/${id}/reply`, { message }, getHeaders()),
  updateStatus: (id, status) => axios.patch(`${FINAL_API}/admin/tickets/${id}/status`, { status }, getHeaders())
};

export const supportAPI = {
  createTicket: (data) => axios.post(`${FINAL_API}/support/tickets`, data, getHeaders()),
  getTickets: (params = {}) => axios.get(`${FINAL_API}/support/tickets`, { ...getHeaders(), params }),
  getTicket: (id) => axios.get(`${FINAL_API}/support/tickets/${id}`, getHeaders()),
  addReply: (id, message) => axios.post(`${FINAL_API}/support/tickets/${id}/reply`, { message }, getHeaders())
};
