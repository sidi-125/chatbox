import { useEffect, useRef, useState } from "react";

export default function useWebSocket(username) {
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!username) return;

    const url = `ws://${process.env.REACT_APP_WS_BASE_URL}/ws/chat/${username}/`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected:", url);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          setMessages((prev) => [...prev, { sender: data.from, text: data.message }]);
        }
      } catch (err) {
        console.error("Error parsing WS message", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error", err);

    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      ws.close();
    };
  }, [username]);

  const sendMessage = (messageText, receiver) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open");
      return;
    }
    const payload = { receiver, message: messageText };
    wsRef.current.send(JSON.stringify(payload));
  };

  return { messages, sendMessage };
}
