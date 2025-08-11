import React from "react";
import { AppBar, Toolbar, Avatar, Typography, Box } from "@mui/material";

export default function ChatHeader({ darkMode }) {
  return (
    <AppBar position="static" color="default" sx={{ bgcolor: darkMode ? "grey.800" : "grey.200" }}>
      <Toolbar>
        <Avatar sx={{ mr: 2 }}>D</Avatar>
        <Box>
          <Typography variant="subtitle1">Demo User</Typography>
          <Typography variant="caption" color="green">Online</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
