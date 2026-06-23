import axiosInstance from './axiosInstance';

export const createTicket = (data) => {
  return axiosInstance.post('/support/tickets', data);
};

export const getTicketsList = (params) => {
  return axiosInstance.get('/support/tickets', { params });
};

export const getTicketDetails = (id) => {
  return axiosInstance.get(`/support/tickets/${id}`);
};

export const addTicketComment = (id, data) => {
  return axiosInstance.post(`/support/tickets/${id}/comments`, data);
};

export const escalateTicket = (id) => {
  return axiosInstance.patch(`/support/tickets/${id}/escalate`);
};

export const resolveTicket = (id) => {
  return axiosInstance.patch(`/support/tickets/${id}/resolve`);
};
