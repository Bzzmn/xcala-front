import type { ChatWidgetConfig } from "xcala-chat-widget";

export const chatConfig: ChatWidgetConfig = {
    langGraphApiUrl: "https://64u8qqfffh.execute-api.us-east-1.amazonaws.com/dev",
    // langGraphApiUrl: "https://xcala-agent-main-234b5df414785657a4b5a013d240ab07.us.langgraph.app",
    assistantId: "app",
    langSmithApiKey: "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", 
    audioApiUrl: "https://xcala-api.thefullstack.digital",
    // audioApiUrl: "https://psct29qw0l.execute-api.us-east-1.amazonaws.com/dev",
};

export const awsCognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_Am52yaKth', // Reemplaza con tu User Pool ID
      userPoolClientId: '540k5l93t3kqud1up5flukg57e', // Reemplaza con tu App Client ID
      region: 'us-east-1', // Reemplaza con tu región, ej: 'us-east-1'
      // Opcional: si tienes un dominio personalizado en Cognito
      // oauth: {
      //   domain: 'tu-dominio-cognito.auth.us-east-1.amazoncognito.com',
      //   scope: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
      //   redirectSignIn: 'http://localhost:3000/', // o tu URL de despliegue
      //   redirectSignOut: 'http://localhost:3000/logout/', // o tu URL de despliegue
      //   responseType: 'code' // o 'token', 'code' es más seguro
      // }
    }
  }
};
