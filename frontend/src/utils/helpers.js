const baseURL = import.meta.env.VITE_API_URL || 'https://tlufood-backend-375841385327.asia-southeast1.run.app/api';
// Remove /api from the end to get the base host URL
const backendHost = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Ensure we don't double slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendHost}${cleanPath}`;
};
