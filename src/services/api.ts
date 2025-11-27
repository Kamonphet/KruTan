const API_URL = 'https://script.google.com/macros/s/.../exec';

// Helper to prevent CORS preflight issues by using text/plain
const postOptions = (body: any) => ({
  method: 'POST',
  credentials: 'omit' as RequestCredentials, // Fix for CORS issues with Google Apps Script
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
  },
  body: JSON.stringify(body),
});

export const api = {
  fetchAll: async () => {
    try {
      // Add cache buster (t=...) to prevent browser caching of GET requests
      const response = await fetch(`${API_URL}?action=getData&t=${new Date().getTime()}`, {
        method: 'GET',
        credentials: 'omit' as RequestCredentials,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API Fetch Error:', error);
      return null;
    }
  },

  create: async (collection: string, data: any) => {
    try {
      await fetch(API_URL, postOptions({ action: 'create', collection, data }));
    } catch (error) {
      console.error('API Create Error:', error);
    }
  },

  update: async (collection: string, data: any) => {
    try {
      await fetch(API_URL, postOptions({ action: 'update', collection, data }));
    } catch (error) {
      console.error('API Update Error:', error);
    }
  },

  delete: async (collection: string, id: string) => {
    try {
      await fetch(API_URL, postOptions({ action: 'delete', collection, data: { id } }));
    } catch (error) {
      console.error('API Delete Error:', error);
    }
  }
};
