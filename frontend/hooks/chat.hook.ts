import { apiCall } from "@/api/apicall";
import { useAuth } from "@clerk/expo";
import { useMutation, useQuery } from "@tanstack/react-query";

type SendChatParams = {
  destinationId: string;
  chat: string;
  conversationId?: string;

  onChunk: (chunk: string) => void;
  onConversationId?: (id: string) => void;
  onFinish?: () => void;
};

export const useSendChat = () => {
  const { getToken } = useAuth();

  const sendChat = async ({
    destinationId,
    chat,
    conversationId,
    onChunk,
    onConversationId,
    onFinish,
  }: SendChatParams) => {
    const token = await getToken();
    console.log("🚀 sendChat called", { destinationId, chat, conversationId });

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${process.env.EXPO_PUBLIC_API_BASE_URL}/openai/chat`);

      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      let cursor = 0;

      xhr.onreadystatechange = () => {
        // HEADERS_RECEIVED
        if (xhr.readyState === 2) {
          const convId = xhr.getResponseHeader("x-conversation-id");

          if (convId && onConversationId) {
            onConversationId(convId);
          }
        }

        // LOADING — new chunk arrived
        if (xhr.readyState === 3) {
          const newChunk = xhr.responseText.slice(cursor);
          cursor = xhr.responseText.length;
          if (newChunk) onChunk(newChunk);
        }

        // DONE
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            onFinish?.();
            resolve();
          } else {
            console.error("❌ Request failed:", xhr.status, xhr.responseText);
            reject(new Error(`Request failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = (e) => {
        console.error("🔥 Network error:", e);
        reject(new Error("Network error"));
      };

      xhr.send(JSON.stringify({ destinationId, chat, conversationId }));
    });
  };

  return { sendChat };
};

export const useGetConversations = (destinationId: string) => {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["conversations", destinationId],
    queryFn: async () => {
      const token = await getToken();
      // Implement the API call to fetch conversations
      return apiCall(`/openai/conversations?destinationId=${destinationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};
