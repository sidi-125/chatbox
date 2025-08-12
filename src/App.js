// App.js
import React from "react";
import { AppBar, Toolbar, Typography, CssBaseline, Box } from "@mui/material";
import OnlineUsersSidebar from "./components/sidebar";
import WebRTCComponent from "./webRTC/index";

const drawerWidth = 250;

export default function App() {
  const onlineUsers = [
    { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
    { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* HEADER */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            My Chat App
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <OnlineUsersSidebar onlineUsers={onlineUsers} />

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // space below AppBar
        }}
      >
        <WebRTCComponent />
      </Box>
    </Box>
  );
}
