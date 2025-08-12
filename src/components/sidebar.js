// OnlineUsersSidebar.jsx
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";

const OnlineUsersSidebar = ({ onlineUsers, drawerWidth, headerHeight }) => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          mt: `${headerHeight}px`, // start below header
          height: `calc(100% - ${headerHeight}px)`,
        },
      }}
    >
      <div style={{ padding: 16 }}>
        <Typography variant="h6" gutterBottom>
          Online Users
        </Typography>
        <Divider />
        <List>
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar alt={user.name} src={user.avatar} />
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary="Online" />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" style={{ marginTop: 10 }}>
              No users online
            </Typography>
          )}
        </List>
      </div>
    </Drawer>
  );
};

export default OnlineUsersSidebar;
