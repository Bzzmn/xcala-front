#!/bin/bash
set -e

# Directorio donde se encuentran los archivos estáticos
APP_DIR=/usr/share/nginx/html

# Valores por defecto para variables si no están definidas
DEFAULT_API_URL="https://xcala-api.thefullstack.digital"
: ${VITE_API_URL:=$DEFAULT_API_URL}
: ${NEXT_PUBLIC_API_URL:=$DEFAULT_API_URL}

# Mostrar información de depuración
echo "Contenido del directorio $APP_DIR:"
ls -la ${APP_DIR}

# Mostrar valores de variables
echo "API URL: ${VITE_API_URL}"

# Crear el archivo de configuración de runtime con las variables de entorno actuales
# Estas variables deben ser configuradas en el entorno de despliegue (ej. Coolify)
echo "window.env = {" > ${APP_DIR}/env-config.js
echo "  VITE_LANGGRAPH_API_URL: \"${VITE_LANGGRAPH_API_URL}\"," >> ${APP_DIR}/env-config.js
echo "  VITE_LANGGRAPH_ASSISTANT_ID: \"${VITE_LANGGRAPH_ASSISTANT_ID}\"," >> ${APP_DIR}/env-config.js
echo "  VITE_LANGSMITH_API_KEY: \"${VITE_LANGSMITH_API_KEY}\"," >> ${APP_DIR}/env-config.js
echo "  VITE_API_URL: \"${VITE_API_URL}\"," >> ${APP_DIR}/env-config.js
echo "  VITE_AUDIO_API_URL: \"${VITE_AUDIO_API_URL}\"," >> ${APP_DIR}/env-config.js
echo "};" >> ${APP_DIR}/env-config.js

# Verificar que el archivo se haya creado
echo "Contenido del archivo env-config.js:"
cat ${APP_DIR}/env-config.js

# Asegurar permisos adecuados para todos los archivos
echo "Aplicando permisos..."
chmod -R 755 ${APP_DIR}
chown -R nginx:nginx ${APP_DIR}

# Ejecutar el comando proporcionado (CMD)
echo "Iniciando servidor Nginx..."
exec "$@" 