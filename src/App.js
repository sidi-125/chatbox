// App.js
import React from "react";
import { AppBar, Toolbar, Typography, CssBaseline, Box } from "@mui/material";
import OnlineUsersSidebar from "./components/sidebar";
import WebRTCComponent from "./webRTC/index" ;

const drawerWidth = 250;
const headerHeight = 64; // Default AppBar height in MUI

export default function App() {
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
            My Chat App
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <OnlineUsersSidebar
        onlineUsers={onlineUsers}
        drawerWidth={drawerWidth}
        headerHeight={headerHeight}
      />

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: `${headerHeight}px`, // push down content below AppBar
          ml: `${drawerWidth}px`, // push right content beside sidebar
        }}
      >
        <WebRTCComponent />
      </Box>
    </Box>
  );
}
