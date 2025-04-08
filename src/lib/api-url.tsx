export function getApiUrl(): string {
  try {
    // Primero verificar si hay una API URL en window.env (tiempo de ejecución)
    if (typeof window !== 'undefined' && window.env && window.env.VITE_API_URL) {
      // Si la URL contiene xcala-api (nombre de host de Docker), reemplazarlo con localhost
      const url = window.env.VITE_API_URL;
      if (url.includes('xcala-api')) {
        return url.replace('xcala-api', 'localhost');
      }
      return url;
    }
    
    // Luego verificar si hay una API URL en las variables de entorno de compilación
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      const url = import.meta.env.VITE_API_URL;
      if (url.includes('xcala-api')) {
        return url.replace('xcala-api', 'localhost');
      }
      return url;
    }
    
    // Si no hay variable de entorno, usar la URL de producción
    return 'https://xcala-api.thefullstack.digital'; // Usar la URL de producción como valor por defecto
  } catch {
    // En caso de error, usar la URL de producción
    return 'https://xcala-api.thefullstack.digital';
  }
} 