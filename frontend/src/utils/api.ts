const API_URL = 'http://localhost:5002/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;


  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json'}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
    throw new Error(error.message || 'Erreur serveur');
  }

  if (response.status === 204) return null;

  return response.json();
}

export default apiFetch;