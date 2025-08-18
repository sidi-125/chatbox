// ChatHeader.jsx
import React, { useState } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function ChatHeader({ receiver, onClearChat }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleClearChat = () => {
    handleMenuClose();
    if (onClearChat) onClearChat();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderBottom: "1px solid #ddd",
        bgcolor: "#fff",
      }}
    >
      <Typography variant="h6">{receiver}</Typography>

      <IconButton onClick={handleMenuOpen}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleClearChat}>Clear Chat</MenuItem>
        {/* <MenuItem onClick={handleClearChat}>Block User</MenuItem> */}
        {/* Add other options here if needed */}
      </Menu>
    </Box>
  );
}
