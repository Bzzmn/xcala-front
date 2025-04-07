export function getApiKey(): string | null {
  try {
    // Primero verificar si hay una API key en window.env (tiempo de ejecución)
    if (typeof window !== 'undefined' && window.env && window.env.NEXT_PUBLIC_LANGSMITH_API_KEY) {
      return window.env.NEXT_PUBLIC_LANGSMITH_API_KEY;
    }
    
    // Luego verificar si hay una API key en las variables de entorno de compilación
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.NEXT_PUBLIC_LANGSMITH_API_KEY) {
      return import.meta.env.NEXT_PUBLIC_LANGSMITH_API_KEY;
    }
    
    // Si no, buscar en localStorage
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("lg:chat:apiKey") ?? null;
  } catch {
    // no-op
  }

  return null;
}
