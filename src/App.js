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
  Avatar,
} from "@mui/material";

import useWebSocket from "./hooks/websocket";

const drawerWidth = 250;
const headerHeight = 64;

const onlineUsers = [
  { name: "Ali", avatar: "https://i.pravatar.cc/40?img=1" },
  { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
];

export default function App() {
  // Change username here for each device before running (e.g. "Ali" on device 1, "Bob" on device 2)
  const [username] = useState("Ali"); 
  const [receiver, setReceiver] = useState("Bob");
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useWebSocket(username);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input, receiver);
      setInput("");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      {/* HEADER */}
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Chat App - {username}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Box
        sx={{
          width: drawerWidth,
          borderRight: "1px solid #ccc",
          mt: `${headerHeight}px`,
          p: 2,
          bgcolor: "#f0f0f0",
        }}
      >
        <Typography variant="h6">Online Users</Typography>
        {onlineUsers.map((user) => (
          <Box
            key={user.name}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1,
              cursor: "pointer",
              bgcolor: receiver === user.name ? "primary.light" : "transparent",
              borderRadius: 1,
              mb: 1,
            }}
            onClick={() => setReceiver(user.name)}
          >
            <Avatar src={user.avatar} sx={{ mr: 1 }} />
            <Typography>{user.name}</Typography>
          </Box>
        ))}
      </Box>

      {/* MAIN CHAT AREA */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          mt: `${headerHeight}px`,
          p: 3,
        }}
      >
        {/* Messages */}
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
            <Typography
              color="text.secondary"
              align="center"
              sx={{ mt: 5 }}
            >
              No messages yet
            </Typography>
          ) : (
            <List>
              {messages.map((msg, i) => (
                <ListItem
                  key={i}
                  sx={{
                    justifyContent: msg.sender === username ? "flex-end" : "flex-start",
                    display: "flex",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: msg.sender === username ? "primary.main" : "grey.300",
                      color: msg.sender === username ? "primary.contrastText" : "text.primary",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: "70%",
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

        {/* Input and Send Button */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder={`Message to ${receiver}`}
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
