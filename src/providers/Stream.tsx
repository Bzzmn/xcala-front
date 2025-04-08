import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import {
  uiMessageReducer,
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useQueryState } from "nuqs";
import { LangGraphLogoSVG } from "@/components/icons/langgraph";
import { getApiKey } from "@/lib/api-key";
import { useThreads } from "./Thread";
import { toast } from "sonner";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = 4000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });

    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const StreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
}: {
  children: ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const { getThreads, setThreads } = useThreads();
  const streamValue = useTypedStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    assistantId,
    threadId: threadId ?? null,
    onCustomEvent: (event, options) => {
      options.mutate((prev) => {
        const ui = uiMessageReducer(prev.ui ?? [], event);
        return { ...prev, ui };
      });
    },
    onThreadId: (id) => {
      setThreadId(id);
      // Refetch threads list when thread ID changes.
      // Wait for some seconds before fetching so we're able to get the new thread that was created.
      // Aumentamos el tiempo de espera a 3 segundos para dar más tiempo al servidor
      console.log("Thread ID cambiado a:", id);
      setTimeout(() => {
        console.log("Actualizando lista de hilos después del cambio de threadId");
        getThreads()
          .then(threads => {
            console.log("Hilos obtenidos:", threads.length);
            setThreads(threads);
            // Si después de obtener los hilos no encontramos el actual, intentamos de nuevo
            if (threads.length > 0 && id && !threads.some(t => t.thread_id === id)) {
              console.log("No se encontró el hilo actual en la lista, intentando de nuevo en 2s");
              setTimeout(() => getThreads().then(setThreads), 2000);
            }
          })
          .catch(error => {
            console.error("Error al obtener hilos:", error);
            // Intentar de nuevo después de un error
            setTimeout(() => getThreads().then(setThreads).catch(console.error), 2000);
          });
      }, 3000);
    },
  });

  useEffect(() => {
    checkGraphStatus(apiUrl, apiKey).then((ok) => {
      if (!ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: () => (
            <p>
              Please ensure your graph is running at <code>{apiUrl}</code> and
              your API key is correctly set (if connecting to a deployed graph).
            </p>
          ),
          duration: 10000,
          richColors: true,
          closeButton: true,
        });
      }
    });
  }, [apiKey, apiUrl]);

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};

// Declarar la interfaz para window.env
declare global {
  interface Window {
    env?: {
      NEXT_PUBLIC_LANGGRAPH_API_URL?: string;
      NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID?: string;
      NEXT_PUBLIC_LANGSMITH_API_KEY?: string;
      NEXT_PUBLIC_API_URL?: string;
      [key: string]: string | undefined;
    };
  }
}

// Default values for the form
const DEFAULT_API_URL = "http://localhost:2024"; // LangGraph API URL 
const DEFAULT_ASSISTANT_ID = "app";

// Función para acceder a las variables de entorno en tiempo de ejecución
const getEnvVariable = (key: string): string | undefined => {
  // Primero buscar en window.env (variables de entorno de tiempo de ejecución)
  if (typeof window !== 'undefined' && window.env && window.env[key]) {
    return window.env[key];
  }
  // Luego buscar en import.meta.env (variables de entorno de compilación)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return undefined;
};

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Get environment variables
  const envApiUrl: string | undefined = getEnvVariable('NEXT_PUBLIC_LANGGRAPH_API_URL') || import.meta.env.VITE_API_URL;
  const envAssistantId: string | undefined = getEnvVariable('NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID') || import.meta.env.VITE_ASSISTANT_ID;
  const envApiKey: string | undefined = getEnvVariable('NEXT_PUBLIC_LANGSMITH_API_KEY') || import.meta.env.VITE_LANGSMITH_API_KEY;

  // Use URL params with env var fallbacks
  const apiUrl = envApiUrl || DEFAULT_API_URL

  const [assistantId, setAssistantId] = useQueryState("assistantId", {
    defaultValue: envAssistantId || DEFAULT_ASSISTANT_ID,
  });

  // LOG FOR DEBUGGING - Remove after fixing the issue
  console.log('AssistantId used:', assistantId);
  
  // TEMPORAL FIX: Force assistantId to be "app"
  useEffect(() => {
    if (assistantId !== "app") {
      console.log("Setting assistantId to 'app' from:", assistantId);
      setAssistantId("app");
    }
  }, [assistantId, setAssistantId]);

  // For API key, use localStorage with env var fallback
  const [apiKey, _setApiKey] = useState(() => {
    const storedKey = getApiKey();
    return storedKey || envApiKey || "";
  });

  // Determine final values to use, prioritizing URL params then env vars
  const finalApiUrl = apiUrl || envApiUrl;
  const finalAssistantId = assistantId || envAssistantId;

  // LOG FOR DEBUGGING
  console.log('LangGraph API URL used:', finalApiUrl);
  console.log('LangSmith API Key available:', apiKey ? 'Yes' : 'No');

  // If we're missing any required values, show the form
  if (!finalApiUrl || !finalAssistantId) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full p-4">
        <div className="animate-in fade-in-0 zoom-in-95 flex flex-col border bg-background shadow-lg rounded-lg max-w-3xl">
          <div className="flex flex-col gap-2 mt-14 p-6 border-b">
            <div className="flex items-start flex-col gap-2">
              <LangGraphLogoSVG className="h-7" />
              <h1 className="text-xl font-semibold tracking-tight">
                Agent Chat
              </h1>
            </div>
            <p className="text-muted-foreground">
              Conectando con el servidor LangGraph. Por favor espere un momento...
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Si esta pantalla persiste, verifica que las variables de entorno NEXT_PUBLIC_LANGGRAPH_API_URL y NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID estén correctamente configuradas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StreamSession
      apiKey={apiKey}
      apiUrl={finalApiUrl}
      assistantId={finalAssistantId}
    >
      {children}
    </StreamSession>
  );
};

// Create a custom hook to use the context
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;
