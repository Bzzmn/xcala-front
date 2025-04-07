# Instrucciones de despliegue para Coolify

Este documento proporciona instrucciones para desplegar la aplicación frontend en Coolify utilizando la imagen de Docker Hub.

## Configuración de variables de entorno

La aplicación requiere las siguientes variables de entorno:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_LANGGRAPH_API_URL` | URL de la API de LangGraph | `https://xcala-agent-main-234b5df414785657a4b5a013d240ab07.us.langgraph.app` |
| `NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID` | ID del asistente en LangGraph | `app` |
| `NEXT_PUBLIC_LANGSMITH_API_KEY` | API Key de LangSmith | `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` |
| `VITE_API_URL` | URL del backend API | `http://xcala-backend:8000` |

## Pasos para el despliegue en Coolify

1. **Ir a la interfaz de Coolify**
   - Accede a tu panel de Coolify.

2. **Crear un nuevo servicio**
   - Selecciona "Add service" → "Application"
   - Selecciona "Docker Hub" como fuente.

3. **Configurar la imagen**
   - Ingresa `tu-usuario/xcala-front:latest` en el campo de imagen.
   - Configura el puerto de destino como `80`.

4. **Configurar variables de entorno**
   - En la sección "Environment variables", agrega las variables mencionadas anteriormente:
   - `NEXT_PUBLIC_LANGGRAPH_API_URL`
   - `NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID`
   - `NEXT_PUBLIC_LANGSMITH_API_KEY`
   - `VITE_API_URL` (URL del backend API, por ejemplo `http://xcala-backend:8000` donde xcala-backend es el nombre del servicio en Coolify)

5. **Configurar redes y persistencia**
   - Asegúrate de que el frontend y el backend estén en la misma red en Coolify.
   - Esta aplicación no requiere volúmenes persistentes.

6. **Iniciar el servicio**
   - Haz clic en "Deploy" para iniciar el servicio.

## Comunicación entre Frontend y Backend

La aplicación está configurada para permitir la comunicación con el backend a través de la variable `VITE_API_URL`:

- La URL configurada en `VITE_API_URL` se utilizará tanto para las llamadas directas desde JavaScript como para las solicitudes a través del proxy de Nginx.
- Si usas una URL interna de Coolify como `http://xcala-backend:8000`, asegúrate de que ambos contenedores estén en la misma red.
- El frontend accede al backend de dos formas:
  1. A través de JavaScript usando la variable `VITE_API_URL` directamente
  2. A través del proxy de Nginx que redirige las solicitudes a `/api/` hacia la URL configurada en `VITE_API_URL`

## Seguridad de la API Key

La API Key de LangSmith se maneja de la siguiente manera:

1. La API Key **no se incluye en tiempo de compilación**, lo que significa que no está expuesta en el código fuente de la aplicación.
2. La API Key se inyecta en la aplicación en tiempo de ejecución a través de variables de entorno.
3. La imagen de Docker no contiene la API Key, esta se proporciona en el entorno de Coolify.
4. Coolify encripta las variables de entorno en su base de datos.

### Recomendaciones de seguridad:

- No incluyas la API Key en archivos públicos o repositorios.
- Rota las API Keys periódicamente.
- Utiliza las capacidades de Coolify para manejar secretos seguros.
- Considera usar reglas de red para limitar quién puede acceder a tu API de LangGraph.

## Solución de problemas

Si encuentras problemas de conexión:

1. Verifica que las variables de entorno estén correctamente configuradas en Coolify.
2. Asegúrate de que el backend esté correctamente desplegado y accesible.
3. Verifica que ambos servicios estén en la misma red en Coolify.
4. Revisa los logs de Nginx para identificar posibles errores de conexión. 