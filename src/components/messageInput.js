import React from "react";
import { Paper, InputBase, IconButton } from "@mui/material";
import { Send } from "@mui/icons-material";

export default function MessageInput() {
  return (
    <Paper sx={{ p: 1, display: "flex", alignItems: "center", borderTop: 1, borderColor: "divider" }}>
      <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Type your message..." />
      <IconButton color="primary">
        <Send />
      </IconButton>
    </Paper>
  );
}
