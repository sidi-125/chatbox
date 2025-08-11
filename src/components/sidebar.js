import React from "react";
import {
  AppBar, Toolbar, Typography, IconButton,
  TextField, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, Divider
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

export default function Sidebar({ users, darkMode, setDarkMode }) {
  return (
    <div style={{ width: 280, borderRight: "1px solid #ccc", display: "flex", flexDirection: "column" }}>
      <AppBar position="static" color="default" sx={{ bgcolor: darkMode ? "grey.800" : "grey.200" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Chats</Typography>
          <IconButton onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <div style={{ padding: 8 }}>
        <TextField variant="outlined" size="small" placeholder="Search" fullWidth />
      </div>

      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {users.map((user) => (
          <React.Fragment key={user.id}>
            <ListItem button selected={user.active}>
              <ListItemAvatar>
                <Avatar>{user.name[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={user.status} />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}
