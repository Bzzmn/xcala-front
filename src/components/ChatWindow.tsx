import { Thread } from "@/components/thread";
import { BrowserRouter } from "react-router-dom";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { ThreadProvider } from "@/providers/Thread";
import { StreamProvider } from "@/providers/Stream";
import { Toaster } from "sonner";

function ChatWindow() {
  return (
    <div className="h-full flex flex-col overflow-hidden mx-auto">
      <BrowserRouter>
        <NuqsAdapter>
          <ThreadProvider>
            <StreamProvider>
              <div className="flex-1 overflow-auto">
                <Thread />
              </div>
            </StreamProvider>
          </ThreadProvider>
          <Toaster />
        </NuqsAdapter>
      </BrowserRouter>
    </div>
  )
}

export default ChatWindow;