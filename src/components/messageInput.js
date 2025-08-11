import React, { useState } from "react";
import { Paper, InputBase, IconButton } from "@mui/material";
import { Send } from "@mui/icons-material";

export default function MessageInput({ onSend }) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue("");
    }
  };

  return (
    <Paper sx={{ p: 1, display: "flex", alignItems: "center" }}>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Type your message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <IconButton color="primary" onClick={handleSend}>
        <Send />
      </IconButton>
    </Paper>
  );
}
