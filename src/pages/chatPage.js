import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar";
import ChatHeader from "../components/chatHeader";
import MessageList from "../components/messageList";
import MessageInput from "../components/messageInput";
import { Box } from "@mui/material";

export default function ChatPage({ username, darkMode, setDarkMode }) {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Replace with your LAN IP
    socketRef.current = new WebSocket(`ws://192.168.x.x:8001/ws/chat/${username}/`);

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => socketRef.current.close();
  }, [username]);

  const sendMessage = (text) => {
    if (socketRef.current && text.trim()) {
      socketRef.current.send(JSON.stringify({
        text,
        time: new Date().toLocaleTimeString(),
        fromMe: true
      }));
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: darkMode ? "grey.900" : "grey.100" }}>
      <Sidebar users={[]} darkMode={darkMode} setDarkMode={setDarkMode} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <ChatHeader darkMode={darkMode} />
        <MessageList messages={messages} darkMode={darkMode} />
        <MessageInput onSend={sendMessage} />
      </Box>
    </Box>
  );
}
