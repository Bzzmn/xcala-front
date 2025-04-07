export function getApiUrl(): string {
  try {
    // Primero verificar si hay una API URL en window.env (tiempo de ejecución)
    if (typeof window !== 'undefined' && window.env && window.env.VITE_API_URL) {
      return window.env.VITE_API_URL;
    }
    
    // Luego verificar si hay una API URL en las variables de entorno de compilación
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // Si no hay variable de entorno, usar un valor por defecto
    return '/api'; // Utiliza el proxy de Nginx por defecto
  } catch {
    // En caso de error, usar el proxy de Nginx
    return '/api';
  }
} 