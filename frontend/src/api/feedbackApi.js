import axiosInstance from './axiosInstance';

/**
 * Submit feedback directly to the backend.
 * @param {Object} data - { canteenName, rating, comments }
 */
export const submitFeedback = (data) => {
  return axiosInstance.post('/feedback', data);
};
