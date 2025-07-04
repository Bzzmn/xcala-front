import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), "");
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },

    },
    // Configuración para generar archivos estáticos con rutas relativas
    base: './',
    build: {
      // Asegura que los assets se carguen con rutas relativas
      assetsDir: 'assets',
      // Genera un manifest para debugging
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    // Asegúrate de que las variables de entorno sean accesibles en el código
    define: {
      "import.meta.env.NEXT_PUBLIC_LANGGRAPH_API_URL": JSON.stringify(env.NEXT_PUBLIC_LANGGRAPH_API_URL || ""),
      "import.meta.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID": JSON.stringify(env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID || ""),
      "import.meta.env.NEXT_PUBLIC_LANGSMITH_API_KEY": JSON.stringify(env.NEXT_PUBLIC_LANGSMITH_API_KEY || ""),
    },
  };
});
