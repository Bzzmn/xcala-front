#!/bin/bash
set -e

# Directorio donde se encuentran los archivos estáticos
APP_DIR=/usr/share/nginx/html

# Mostrar información de depuración
echo "Contenido del directorio $APP_DIR:"
ls -la ${APP_DIR}

# Crear el archivo de configuración de runtime con las variables de entorno actuales
echo "window.env = {" > ${APP_DIR}/env-config.js
echo "  NEXT_PUBLIC_LANGGRAPH_API_URL: \"${NEXT_PUBLIC_LANGGRAPH_API_URL}\"," >> ${APP_DIR}/env-config.js
echo "  NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID: \"${NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID}\"," >> ${APP_DIR}/env-config.js
echo "  NEXT_PUBLIC_LANGSMITH_API_KEY: \"${NEXT_PUBLIC_LANGSMITH_API_KEY}\"," >> ${APP_DIR}/env-config.js
echo "  VITE_API_URL: \"${VITE_API_URL}\"," >> ${APP_DIR}/env-config.js
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