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
 * Obtiene la configuración base del widget de chat desde el objeto `window.env` en tiempo de ejecución.
 * Esto asegura que los valores se lean solo cuando son necesarios, evitando problemas de timing.
 * @returns Un objeto de configuración para el widget, excluyendo datos del usuario.
 */
export const getChatConfig = (): Omit<ChatWidgetConfig, 'userId' | 'idToken'> => {
    return {
        langGraphApiUrl: window.env?.VITE_LANGGRAPH_API_URL,
        assistantId: window.env?.VITE_LANGGRAPH_ASSISTANT_ID || "app",
        langSmithApiKey: window.env?.VITE_LANGSMITH_API_KEY,
        audioApiUrl: window.env?.VITE_AUDIO_API_URL,
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