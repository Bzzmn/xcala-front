import { v4 as uuidv4 } from "uuid";
import { ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/Stream";
import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import { AssistantMessage, AssistantMessageLoading } from "./messages/ai";
import { HumanMessage } from "./messages/human";
import {
  DO_NOT_RENDER_ID_PREFIX,
  ensureToolCallsHaveResponses,
} from "@/lib/ensure-tool-responses";
import { TooltipIconButton } from "./tooltip-icon-button";
import {
  ArrowDown,
  LoaderCircle,
  PanelRightOpen,
  PanelRightClose,
  SquarePen,
  Mic,
} from "lucide-react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import ThreadHistory from "./history";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useThreads } from "@/providers/Thread";
import { getApiUrl } from "@/lib/api-url";

function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={props.className}
    >
      <div ref={context.contentRef} className={props.contentClassName}>
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={props.className}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

// Define interfaces para la API de reconocimiento de voz
interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

// Extender el objeto Window para incluir SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function Thread() {
  const [threadId, setThreadId] = useQueryState("threadId");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );
  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;
  
  // Acceder a las funciones de gestión de hilos
  const { getThreads, setThreads, setThreadsLoading } = useThreads();

  const lastError = useRef<string | undefined>(undefined);

  // Añadir estado para controlar si el micrófono está activo
  const [isListening, setIsListening] = useState(false);

  // Añadir referencia para el grabador de audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!stream.error) {
      lastError.current = undefined;
      return;
    }
    try {
      const message = (stream.error as any).message;
      if (!message || lastError.current === message) {
        // Message has already been logged. do not modify ref, return early.
        return;
      }

      // Message is defined, and it has not been logged yet. Save it, and send the error
      lastError.current = message;
      toast.error("An error occurred. Please try again.", {
        description: (
          <p>
            <strong>Error:</strong> <code>{message}</code>
          </p>
        ),
        richColors: true,
        closeButton: true,
      });
    } catch {
      // no-op
    }
  }, [stream.error]);

  // TODO: this should be part of the useStream hook
  const prevMessageLength = useRef(0);
  useEffect(() => {
    if (
      messages.length !== prevMessageLength.current &&
      messages?.length &&
      messages[messages.length - 1].type === "ai"
    ) {
      setFirstTokenReceived(true);
      
      // También actualizar el historial cuando se recibe un nuevo mensaje
      if (threadId) {
        // Dar más tiempo para que el backend actualice los datos
        console.log("Nuevos mensajes detectados, actualizando historial...");
        setTimeout(() => {
          console.log("Obteniendo hilos después de nuevos mensajes");
          getThreads()
            .then(threads => {
              console.log(`Hilos obtenidos: ${threads.length}`);
              setThreads(threads);
              
              // Intentar una vez más si no hay hilos o son pocos
              if (threads.length === 0 || (threadId && !threads.some(t => t.thread_id === threadId))) {
                console.log("No se encontró el hilo actual en la lista, reintentando...");
                setTimeout(() => {
                  getThreads()
                    .then(updatedThreads => {
                      console.log(`Segunda actualización, hilos: ${updatedThreads.length}`);
                      setThreads(updatedThreads);
                    })
                    .catch(console.error);
                }, 2000);
              }
            })
            .catch(error => {
              console.error("Error al actualizar hilos:", error);
            });
        }, 2000);
      }
    }

    prevMessageLength.current = messages.length;
  }, [messages, threadId, getThreads, setThreads]);

  // Modificar la función handleVoiceInput
  const handleVoiceInput = () => {
    // Si ya está escuchando, detener la grabación
    if (isListening && mediaRecorderRef.current) {
      console.log("🎤 Deteniendo grabación...");
      mediaRecorderRef.current.stop();
      return;
    }

    // Iniciar grabación
    console.log("🎤 Iniciando grabación de audio...");
    setIsListening(true);
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(audioStream => {
        console.log("✅ Permiso de micrófono concedido");
        const mediaRecorder = new MediaRecorder(audioStream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        console.log("📊 Configuración del MediaRecorder:", {
          mimeType: mediaRecorder.mimeType,
          state: mediaRecorder.state
        });
        
        mediaRecorder.ondataavailable = (event) => {
          console.log(`📦 Chunk de audio recibido: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          console.log("⏹️ Grabación detenida");
          setIsListening(false);
          
          // Crear blob de audio
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          console.log(`🔊 Blob de audio creado: ${audioBlob.size} bytes, tipo: ${audioBlob.type}`);
          
          // Crear FormData para enviar el archivo
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.wav');
          console.log("📋 FormData creado con el blob de audio");
          
          // Usar directamente la URL de producción para la transcripción de audio
          const transcriptionApiUrl = "https://xcala-api.thefullstack.digital/api/v1/transcription";
          
          // Enviar al backend
          console.log(`🚀 Enviando audio al endpoint de transcripción: ${transcriptionApiUrl}`);
          fetch(transcriptionApiUrl, {
            method: 'POST',
            body: formData,
          })
          .then(response => {
            console.log(`📥 Respuesta recibida: status ${response.status}`);
            if (!response.ok) {
              throw new Error(`Error en la transcripción: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log("📝 Datos de transcripción recibidos:", data);
            // Manejar diferentes formatos de respuesta posibles
            const transcribedText = data.text || data.transcription || data.transcript || 
                                   (typeof data === 'string' ? data : null);
            
            if (transcribedText) {
              console.log(`✏️ Texto transcrito recibido: "${transcribedText}"`);
              
              // En lugar de agregar al input, enviar directamente el mensaje
              const trimmedText = transcribedText.trim();
              if (trimmedText) {
                // Establecer el texto en el input (visual) sin activar el foco
                // Evitamos llamar a focus() para que no se active el teclado en móviles
                setInput(trimmedText);
                
                // Pequeña pausa para que el usuario vea lo que se transcribió
                setTimeout(() => {
                  // Crear y enviar mensaje directamente
                  const newHumanMessage: Message = {
                    id: uuidv4(),
                    type: "human",
                    content: trimmedText,
                  };
                  
                  // Usar el stream del contexto global, que se llama 'stream'
                  const chatStream = stream; // Esta es la variable stream del useStreamContext() que está en el ámbito global
                  const toolMessages = ensureToolCallsHaveResponses(chatStream.messages);
                  chatStream.submit(
                    { messages: [...toolMessages, newHumanMessage] },
                    {
                      streamMode: ["values"],
                      optimisticValues: (prev: any) => ({
                        ...prev,
                        messages: [
                          ...(prev.messages ?? []),
                          ...toolMessages,
                          newHumanMessage,
                        ],
                      }),
                    },
                  );
                  
                  // Limpiar el input después de enviar
                  setInput("");
                  setFirstTokenReceived(false);
                }, 500); // Espera 500ms para que el usuario pueda ver lo que se transcribió
              } else {
                toast.warning('El texto transcrito está vacío');
              }
            } else {
              console.warn("⚠️ La respuesta no contiene texto transcrito:", data);
              toast.warning('No se pudo obtener texto de la transcripción');
            }
          })
          .catch(error => {
            console.error("❌ Error al transcribir:", error);
            toast.error('Error al transcribir el audio');
          })
          .finally(() => {
            // Detener todas las pistas del audioStream
            console.log("🧹 Limpiando recursos de audio...");
            audioStream.getTracks().forEach(track => {
              track.stop();
              console.log(`  - Pista de audio detenida: ${track.kind}`);
            });
          });
        };
        
        // Comenzar grabación
        mediaRecorder.start();
        console.log("▶️ Grabación iniciada");
        
        // Configurar un tiempo máximo de grabación (30 segundos)
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            console.log("⏱️ Tiempo máximo de grabación alcanzado (30s)");
            mediaRecorderRef.current.stop();
          }
        }, 30000);
      })
      .catch(error => {
        console.error("❌ Error al acceder al micrófono:", error);
        toast.error('No se pudo acceder al micrófono');
        setIsListening(false);
      });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setFirstTokenReceived(false);

    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: input,
    };

    const toolMessages = ensureToolCallsHaveResponses(stream.messages);
    stream.submit(
      { messages: [...toolMessages, newHumanMessage] },
      {
        streamMode: ["values"],
        optimisticValues: (prev) => ({
          ...prev,
          messages: [
            ...(prev.messages ?? []),
            ...toolMessages,
            newHumanMessage,
          ],
        }),
      },
    );

    setInput("");
  };

  const handleRegenerate = (
    parentCheckpoint: Checkpoint | null | undefined,
  ) => {
    // Do this so the loading state is correct
    prevMessageLength.current = prevMessageLength.current - 1;
    setFirstTokenReceived(false);
    stream.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamMode: ["values"],
    });
  };

  const chatStarted = !!threadId || !!messages.length;

  // Función para manejar la creación de un nuevo hilo
  const handleNewThread = async () => {
    // Si no hay mensajes, no es necesario crear un nuevo hilo
    if (messages.length === 0 && !threadId) {
      return;
    }
    
    // Antes de crear un nuevo hilo, asegurarse de actualizar el historial
    setThreadsLoading(true);
    try {
      const updatedThreads = await getThreads();
      setThreads(updatedThreads);
      
      // Limpiar el ID del hilo actual para iniciar uno nuevo
      setThreadId(null);
      
      // Esperar un momento para que la UI se actualice
      setTimeout(() => {
        // Refrescar el historial para incluir el nuevo hilo
        getThreads()
          .then(setThreads)
          .catch(console.error)
          .finally(() => setThreadsLoading(false));
      }, 500);
    } catch (error) {
      console.error("Error al actualizar el historial:", error);
      setThreadsLoading(false);
      // Continuar con la creación del hilo a pesar del error
      setThreadId(null);
    }
  };

  // Efecto para actualizar el historial cuando cambia el threadId
  useEffect(() => {
    // Si hay un ID de hilo, actualizar el historial para asegurarse de que esté actualizado
    if (threadId) {
      getThreads()
        .then(setThreads)
        .catch(console.error);
    }
  }, [threadId, getThreads, setThreads]);

  return (
    <div className="flex w-full h-full overflow-hidden">
      <div className="relative lg:flex hidden">
        <motion.div
          className="absolute h-full border-r bg-white overflow-hidden z-20"
          style={{ width: 300 }}
          animate={
            isLargeScreen
              ? { x: chatHistoryOpen ? 0 : -300 }
              : { x: chatHistoryOpen ? 0 : -300 }
          }
          initial={{ x: -300 }}
          transition={
            isLargeScreen
              ? { type: "spring", stiffness: 300, damping: 30 }
              : { duration: 0 }
          }
        >
          <div className="relative h-full" style={{ width: 300 }}>
            <ThreadHistory />
          </div>
        </motion.div>
      </div>
      <motion.div
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden relative",
          !chatStarted && "grid-rows-[1fr]",
        )}
        layout={isLargeScreen}
        animate={{
          marginLeft: chatHistoryOpen ? (isLargeScreen ? 300 : 0) : 0,
          width: chatHistoryOpen
            ? isLargeScreen
              ? "calc(100% - 300px)"
              : "100%"
            : "100%",
        }}
        transition={
          isLargeScreen
            ? { type: "spring", stiffness: 300, damping: 30 }
            : { duration: 0 }
        }
      >
        {!chatStarted && (
          <div className="absolute top-0 left-0 w-full flex items-center justify-between gap-3 p-2 pl-4 z-10">
            <div>
              {(!chatHistoryOpen || !isLargeScreen) && (
                <Button
                  className="hover:bg-gray-100"
                  variant="ghost"
                  onClick={() => setChatHistoryOpen((p) => !p)}
                >
                  {chatHistoryOpen ? (
                    <PanelRightOpen className="size-5" />
                  ) : (
                    <PanelRightClose className="size-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
        {chatStarted && (
          <div className="flex items-center justify-between gap-2 p-1 z-10 relative">
            <div className="flex items-center justify-start gap-1 relative">
              <div className="absolute left-0 z-10">
                {(!chatHistoryOpen || !isLargeScreen) && (
                  <Button
                    className="hover:bg-gray-100 p-1"
                    variant="ghost"
                    onClick={() => setChatHistoryOpen((p) => !p)}
                  >
                    {chatHistoryOpen ? (
                      <PanelRightOpen className="size-4" />
                    ) : (
                      <PanelRightClose className="size-4" />
                    )}
                  </Button>
                )}
              </div>
              <motion.button
                className="flex gap-1 items-center cursor-pointer"
                onClick={handleNewThread}
                animate={{
                  marginLeft: !chatHistoryOpen ? 36 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >

              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <TooltipIconButton
                size="sm"
                className="p-2"
                tooltip="Nueva conversación"
                variant="ghost"
                onClick={handleNewThread}
              >
                <SquarePen className="size-4" />
              </TooltipIconButton>
            </div>

            <div className="absolute inset-x-0 top-full h-3 bg-gradient-to-b from-background to-background/0" />
          </div>
        )}

        <StickToBottom className="relative flex-1 overflow-hidden">
          <StickyToBottomContent
            className={cn(
              "absolute inset-0 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent",
              !chatStarted && "flex flex-col items-stretch mt-[10vh]",
              chatStarted && "grid grid-rows-[1fr_auto]",
            )}
            contentClassName="pt-4 pb-8 mx-auto flex flex-col gap-3 w-full px-6"
            content={
              <>
                {messages
                  .filter((m) => !m.id?.startsWith(DO_NOT_RENDER_ID_PREFIX))
                  .map((message, index) =>
                    message.type === "human" ? (
                      <HumanMessage
                        key={message.id || `${message.type}-${index}`}
                        message={message}
                        isLoading={isLoading}
                      />
                    ) : (
                      <AssistantMessage
                        key={message.id || `${message.type}-${index}`}
                        message={message}
                        isLoading={isLoading}
                        handleRegenerate={handleRegenerate}
                      />
                    ),
                  )}
                {isLoading && !firstTokenReceived && (
                  <AssistantMessageLoading />
                )}
              </>
            }
            footer={
              <div className="sticky flex flex-col items-center bottom-0 px-2 bg-white">
                {!chatStarted && (
                  <div className="flex gap-2 items-center">
                    <h1 className="text-xl font-semibold tracking-tight">
                      Bienvenido a Xcala
                    </h1>
                  </div>
                )}

                <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-in fade-in-0 zoom-in-95" />

                <div className="bg-muted rounded-lg border shadow-xs mx-auto w-full max-w-full relative z-10">
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-rows-[1fr_auto] gap-1 max-w-full mx-auto"
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={(e) => {
                        // Si estamos en proceso de transcripción, evitar el foco
                        if (isListening) {
                          e.target.blur();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          !e.metaKey &&
                          !e.nativeEvent.isComposing
                        ) {
                          e.preventDefault();
                          const el = e.target as HTMLElement | undefined;
                          const form = el?.closest("form");
                          form?.requestSubmit();
                        }
                      }}
                      placeholder="Escribe tu mensaje..."
                      className="p-3 pb-0 border-none bg-transparent field-sizing-content shadow-none ring-0 outline-none focus:outline-none focus:ring-0 resize-none max-h-20"
                    />

                    <div className="flex items-center justify-end p-2 pt-2">
                      {stream.isLoading ? (
                        <Button key="stop" onClick={() => stream.stop()} size="sm">
                          <LoaderCircle className="w-3 h-3 animate-spin mr-1" />
                          Cancelar
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            className={`transition-all ${isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-transparent'}`}
                            size="sm"
                            variant={isListening ? "default" : "ghost"}
                            aria-label={isListening ? "Detener grabación" : "Usar micrófono"}
                            title={isListening ? "Detener grabación" : "Usar micrófono"}
                            onClick={handleVoiceInput}
                          >
                            <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
                          </Button>
                          <Button
                            type="submit"
                            className="transition-all shadow-sm"
                            disabled={isLoading || !input.trim()}
                            size="sm"
                          >
                            Enviar
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>

                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                    {/* <p className="text-xs text-gray-400">
                      Desarrollado por <a href="https://pharad.ai" className="text-slate-400 hover:text-slate-500">Pharadai</a>
                    </p> */}
                    <p className="text-xs text-gray-400">
                      Desarrollado por Pharadai
                    </p>
                  </div>
              </div>
            }
          />
        </StickToBottom>
      </motion.div>
    </div>
  );
}
