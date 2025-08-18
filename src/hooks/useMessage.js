// src/hooks/useChatMessages.js
import { useEffect, useRef, useState } from "react";

export default function useChatMessages(senderId, receiverId) {
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  // Helper: sort by timestamp
  const sortByTime = (arr) =>
    [...arr].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  // Fetch initial chat history
  useEffect(() => {
    if (!senderId || !receiverId) return;

    async function fetchMessages() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8001/chat/${senderId}/${receiverId}/`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(sortByTime(data));
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }

    fetchMessages();
  }, [senderId, receiverId]);

  // WebSocket connection
  useEffect(() => {
    if (!senderId) return;

    const wsUrl = `ws://127.0.0.1:8001/ws/chat/${senderId}/`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Ensure message is for this chat only
        if (
          (Number(msg.sender) === Number(senderId) &&
            Number(msg.receiver) === Number(receiverId)) ||
          (Number(msg.sender) === Number(receiverId) &&
            Number(msg.receiver) === Number(senderId))
        ) {
          setMessages((prev) => sortByTime([...prev, msg]));
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    wsRef.current.onclose = () => {
      console.warn("WebSocket closed");
    };

    return () => {
      wsRef.current?.close();
    };
  }, [senderId, receiverId]);

  // Send message through WebSocket
  const sendMessage = (content, toId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          sender: senderId,
          receiver: toId,
          content,
        })
      );
    } else {
      console.warn("WebSocket not open");
    }
  };

  return { messages, sendMessage };
}
