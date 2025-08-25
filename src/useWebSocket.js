import { useRef, useEffect, useState } from "react";

export default function useWebSocket(url) {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onmessage = (event) => {
      try{
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error("Invalid JSON from server:", event.data);
      }
    };

    return () => ws.current.close();
  }, [url]);

  const sendMessage = (text) => {
    ws.current.send(JSON.stringify({
      text,
      time: new Date().toLocaleTimeString(),
      fromMe: true
    }));
  };

  return { messages, sendMessage };
}
