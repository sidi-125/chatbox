import React from "react";
import { Box, Paper, Typography } from "@mui/material";

export default function MessageList({ messages, darkMode }) {
  return (
    <Box sx={{ flexGrow: 1, p: 2, overflowY: "auto" }}>
      {messages.map((msg) => (
        <Box
          key={msg.id}
          sx={{
            display: "flex",
            justifyContent: msg.fromMe ? "flex-end" : "flex-start",
            mb: 2,
          }}
        >
          <Paper
            sx={{
              p: 1.5,
              maxWidth: "70%",
              bgcolor: msg.fromMe
                ? darkMode
                  ? "primary.dark"
                  : "primary.light"
                : darkMode
                ? "grey.800"
                : "grey.300",
              color: msg.fromMe ? "white" : "inherit",
            }}
          >
            <Typography variant="body2">{msg.text}</Typography>
            <Typography variant="caption" sx={{ display: "block", textAlign: "right", mt: 0.5 }}>
              {msg.time}
            </Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
}
