#!/bin/bash
set -e

# Directorio donde se encuentran los archivos estáticos
APP_DIR=/usr/share/nginx/html

# Mostrar directorio para debugging
echo "Contenido del directorio $APP_DIR:"
ls -la $APP_DIR

# Crear el archivo de configuración de runtime con las variables de entorno actuales
echo "window.env = {" > ${APP_DIR}/env-config.js
echo "  NEXT_PUBLIC_LANGGRAPH_API_URL: \"${NEXT_PUBLIC_LANGGRAPH_API_URL}\"," >> ${APP_DIR}/env-config.js
echo "  NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID: \"${NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID}\"," >> ${APP_DIR}/env-config.js
echo "  NEXT_PUBLIC_LANGSMITH_API_KEY: \"${NEXT_PUBLIC_LANGSMITH_API_KEY}\"," >> ${APP_DIR}/env-config.js
echo "  VITE_API_URL: \"${VITE_API_URL}\"," >> ${APP_DIR}/env-config.js
echo "};" >> ${APP_DIR}/env-config.js

echo "Archivo env-config.js creado en $APP_DIR/env-config.js"
cat ${APP_DIR}/env-config.js

# Generar la configuración de nginx con las variables de entorno
if [ ! -z "$VITE_API_URL" ]; then
  # Reemplazar la configuración de nginx con la URL del backend
  envsubst '$VITE_API_URL' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf
  echo "Configuración de nginx generada con VITE_API_URL=$VITE_API_URL"
fi

# Ejecutar el comando proporcionado (CMD)
exec "$@" 