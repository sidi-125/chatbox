import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
} from "@mui/material";

import OnlineUsersSidebar from "./components/sidebar";
import useWebSocket from "./hooks/websocket";

const drawerWidth = 250;
const headerHeight = 64;

export default function App() {
  // Hardcode or initialize username here
  const [username] = useState("Ali"); // <-- set your username here

  const { messages, sendMessage } = useWebSocket(username);
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState("Bob");

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input, receiver);
      setInput("");
    }
  };

  const onlineUsers = [
    { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
    { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* HEADER */}
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            My Chat App ({username})
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <OnlineUsersSidebar
        onlineUsers={onlineUsers}
        drawerWidth={drawerWidth}
        headerHeight={headerHeight}
        onUserSelect={setReceiver}
      />

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: `${headerHeight}px`,
          ml: `${drawerWidth}px`,
          display: "flex",
          flexDirection: "column",
          height: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        {/* Receiver Selector */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Send To"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            size="small"
          />
        </Box>

        {/* Messages List */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            border: "1px solid #ccc",
            borderRadius: 1,
            p: 2,
            mb: 2,
            bgcolor: "#fafafa",
          }}
        >
          {messages.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
              No messages yet
            </Typography>
          ) : (
            <List>
              {messages.map((msg, i) => (
                <ListItem
                  key={i}
                  sx={{
                    justifyContent: msg.sender === username ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: msg.sender === username ? "primary.main" : "grey.300",
                      color:
                        msg.sender === username ? "primary.contrastText" : "text.primary",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: "75%",
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.3 }}>
                      {msg.sender}:
                    </Typography>
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Input & Send */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button variant="contained" onClick={handleSend}>
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
