import { List, Typography, Box } from "@mui/material";
import MessageItem from "./messageItem";

export default function MessageList({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ opacity: 0.7, fontStyle: "italic" }}
        >
          No messages yet
        </Typography>
      </Box>
    );
  }

  return (
    <List
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        px: 0,
        py: 0,
        overflowY: "auto",
        scrollbarWidth: "thin",
        "&::-webkit-scrollbar": { width: 6 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: 3,
        },
      }}
    >
      {messages.map((msg, index) => (
        <MessageItem key={index} msg={msg} />
      ))}
    </List>
  );
}
