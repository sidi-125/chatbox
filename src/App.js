import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./components/sidebar"
import ChatHeader from "./components/chatHeader";
import MessageList from "./components/messageList";
import MessageInput from "./components/messageInput";

const users = [
  { id: 1, name: "John Doe", status: "Online", active: true },
  { id: 2, name: "Demo User", status: "Online", active: false },
];

const messages = [
  { id: 1, fromMe: false, sender: "Demo User", text: "Welcome to OfflineChat! This is a demo chat.", time: "12:24:39 PM" },
  { id: 2, fromMe: true, sender: "Me", text: "ytgtr76r", time: "12:25:48 PM" },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: darkMode ? "grey.900" : "grey.100" }}>
      <Sidebar users={users} darkMode={darkMode} setDarkMode={setDarkMode} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <ChatHeader darkMode={darkMode} />
        <MessageList messages={messages} darkMode={darkMode} />
        <MessageInput />
      </Box>
    </Box>
  );
}
