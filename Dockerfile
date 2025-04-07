FROM node:20-alpine as build

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de configuración primero para aprovechar la caché
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación (las variables de entorno de compilación van aquí si son necesarias)
RUN pnpm build

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
