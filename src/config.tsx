import type { ChatWidgetConfig } from "@xcala/chat-widget";

// Define an interface for the environment variables on the window object
interface WindowEnv {
    VITE_LANGGRAPH_API_URL: string;
    VITE_LANGGRAPH_ASSISTANT_ID: string;
    VITE_LANGSMITH_API_KEY: string;
    VITE_API_URL: string;
    VITE_AUDIO_API_URL: string;
}

// Extend the global Window interface
declare global {
    interface Window {
        env: WindowEnv;
    }
}

// Read runtime variables from window.env
/**
 * Obtiene la configuración base del widget de chat de forma dinámica para que funcione tanto
 * en el entorno de desarrollo local como en producción.
 * - En producción (cuando se compila), lee las variables desde `window.env` (inyectado por Docker).
 * - En desarrollo, lee las variables directamente desde `import.meta.env` (inyectado por Vite desde .env.local).
 * @returns Un objeto de configuración para el widget, excluyendo datos del usuario.
 */
export const getChatConfig = (): Omit<ChatWidgetConfig, 'userId' | 'idToken'> => {
    const isProduction = import.meta.env.PROD;

    // En producción, las variables se inyectan en tiempo de ejecución a través de env-config.js
    if (isProduction) {
        return {
            langGraphApiUrl: window.env?.VITE_LANGGRAPH_API_URL,
            assistantId: window.env?.VITE_LANGGRAPH_ASSISTANT_ID || "app",
            langSmithApiKey: window.env?.VITE_LANGSMITH_API_KEY,
            audioApiUrl: window.env?.VITE_AUDIO_API_URL,
        };
    }

    // En desarrollo, Vite las inyecta directamente desde el archivo .env.local
    return {
        langGraphApiUrl: import.meta.env.VITE_LANGGRAPH_API_URL,
        assistantId: import.meta.env.VITE_LANGGRAPH_ASSISTANT_ID || "app",
        langSmithApiKey: import.meta.env.VITE_LANGSMITH_API_KEY,
        audioApiUrl: import.meta.env.VITE_AUDIO_API_URL,
    };
};

export const awsCognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID, // Reemplaza con tu User Pool ID
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID, // Reemplaza con tu App Client ID
      region: import.meta.env.VITE_AWS_REGION, // Reemplaza con tu región, ej: 'us-east-1'
    }
  }
};