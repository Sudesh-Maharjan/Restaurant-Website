/**
 * Environment variables with fallbacks
 */

// API URLs
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:5000';

// Function to get full image URL
export const getImageUrl = (path: string) => {
  if (!path) return '/placeholder.svg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `${API_URL}${path}`;
  return path;
};
