import type { ChatWidgetConfig } from "@xcala/chat-widget";

export const chatConfig: ChatWidgetConfig = {
    langGraphApiUrl: import.meta.env.VITE_LANGGRAPH_API_URL,
    // langGraphApiUrl: "https://xcala-agent-main-234b5df414785657a4b5a013d240ab07.us.langgraph.app",
    assistantId: "app",
    langSmithApiKey: import.meta.env.VITE_LANGSMITH_API_KEY, 
    audioApiUrl: import.meta.env.VITE_AUDIO_API_URL,
    // audioApiUrl: "https://psct29qw0l.execute-api.us-east-1.amazonaws.com/dev",
};

export const awsCognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_W85muw4w8', // Reemplaza con tu User Pool ID
      userPoolClientId: '7contbtnb0t6knn5n81hb0mjmu', // Reemplaza con tu App Client ID
      region: 'us-east-1', // Reemplaza con tu región, ej: 'us-east-1'
    }
  }
};
