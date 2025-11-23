
export const API_CONFIG = {
  BASE_URL: 'http://192.168.137.185:3000/api',
  SOCKET_URL: 'http://192.168.137.185:3000'
};


// Routes API
export const API_ROUTES = {
  // Auth
  AUTH: {
    REGISTER: `${API_CONFIG.BASE_URL}/auth/register`,
    LOGIN: `${API_CONFIG.BASE_URL}/auth/login`
  },
  
  // Menu Items
  MENU: `${API_CONFIG.BASE_URL}/menu`,
  
  // Commandes
  COMMANDES: `${API_CONFIG.BASE_URL}/commandes`,
  
  // Plats
  PLATS: `${API_CONFIG.BASE_URL}/plats`,
  
  // Publications (à implémenter côté backend)
  PUBLICATIONS: `${API_CONFIG.BASE_URL}/publications`
};

// Helper pour construire les URLs avec ID
export const buildUrl = (base: string, id?: string) => {
  return id ? `${base}/${id}` : base;
};