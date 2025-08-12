// src/components/Header.js
import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

export default function Header({ status }) {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="chat"
          sx={{ mr: 2 }}
        >
          <ChatIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Offline WebRTC Chat
        </Typography>
        <Button color="inherit" disabled>
          {status}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
