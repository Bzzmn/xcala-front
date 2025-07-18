FROM node:20-alpine AS build

# Acepta el token de CodeArtifact como un argumento de compilación
ARG CODEARTIFACT_AUTH_TOKEN
# Accept VITE variables as build arguments
ARG VITE_LANGGRAPH_API_URL
ARG VITE_LANGSMITH_API_KEY
ARG VITE_AUDIO_API_URL

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de configuración primero para aprovechar la caché
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copia el .npmrc de tu proyecto (el que tiene la URL del registry)
# Asegúrate que este archivo .npmrc exista en la raíz de tu proyecto
# Copy the .npmrc from your project (the one with the registry URL)
# Ensure this file .npmrc exists in the project root
COPY .npmrc .

# Configura el token de autenticación para CodeArtifact si se proporcionó
# La URL aquí debe coincidir exactamente con la que CodeArtifact espera para el token.
RUN if [ -n "$CODEARTIFACT_AUTH_TOKEN" ]; then \
        echo "//xcala-codebase-680604704550.d.codeartifact.us-east-1.amazonaws.com/npm/xcala-agent/:_authToken=${CODEARTIFACT_AUTH_TOKEN}" >> .npmrc && \
        echo "always-auth=true" >> .npmrc; \
    fi

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
# Copy the rest of the source code
COPY . .

# Imprimir el contenido de index.html para depuración


# Construir la aplicación (las variables de entorno de compilación van aquí si son necesarias)
# Set the VITE variables as environment variables for the build command
ENV VITE_LANGGRAPH_API_URL=${VITE_LANGGRAPH_API_URL}
ENV VITE_LANGSMITH_API_KEY=${VITE_LANGSMITH_API_KEY}
ENV VITE_AUDIO_API_URL=${VITE_AUDIO_API_URL}

# Construir la aplicación (las variables de entorno de compilación van aquí si son necesarias)
RUN pnpm build

# Verificar los archivos generados para depuración
RUN ls -la dist

# Etapa de producción
FROM nginx:alpine

# Instalar envsubst para poder reemplazar variables de entorno
RUN apk add --no-cache bash gettext

# Copiar la configuración personalizada de nginx como plantilla
COPY nginx.conf /etc/nginx/conf.d/default.template

# Copiar los archivos de compilación desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar el script de entrada que permite la inyección de variables de entorno
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar el script de entrada
ENTRYPOINT ["/docker-entrypoint.sh"]

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
