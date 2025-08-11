import { useRef, useEffect, useState } from "react";

export default function useWebSocket(url) {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
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
