import type { ChatWidgetConfig } from "@xcala/chat-widget";

export const chatConfig: ChatWidgetConfig = {
    langGraphApiUrl: import.meta.env.VITE_LANGGRAPH_API_URL,
    assistantId: "app",
    langSmithApiKey: import.meta.env.VITE_LANGSMITH_API_KEY, 
    audioApiUrl: import.meta.env.VITE_AUDIO_API_URL,
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
