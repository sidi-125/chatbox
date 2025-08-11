import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [remoteSDP, setRemoteSDP] = useState("");
  const [localSDP, setLocalSDP] = useState("");

  const pcRef = useRef(null);
  const channelRef = useRef(null);

  const createConnection = () => {
    pcRef.current = new RTCPeerConnection();
    channelRef.current = pcRef.current.createDataChannel("chat");

    channelRef.current.onopen = () => {
      console.log("Data channel open");
    };
    channelRef.current.onmessage = (event) => {
      setMessages((prev) => [...prev, { sender: "Peer", text: event.data }]);
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) return;
      setLocalSDP(JSON.stringify(pcRef.current.localDescription));
    };
  };

  const createOffer = async () => {
    createConnection();
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
  };

  const createAnswer = async () => {
    createConnection();
    const offer = JSON.parse(remoteSDP);
    await pcRef.current.setRemoteDescription(offer);
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);
  };

  const setAnswer = async () => {
    const answer = JSON.parse(remoteSDP);
    await pcRef.current.setRemoteDescription(answer);
  };

  const sendMessage = () => {
    if (channelRef.current?.readyState === "open") {
      channelRef.current.send(message);
      setMessages((prev) => [...prev, { sender: "You", text: message }]);
      setMessage("");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          📡 WebRTC Chat
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Buttons for Offer/Answer */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={createOffer}>
            Create Offer
          </Button>
          <Button variant="contained" color="secondary" onClick={createAnswer}>
            Create Answer
          </Button>
          <Button variant="outlined" onClick={setAnswer}>
            Set Answer
          </Button>
        </Box>

        {/* Local SDP */}
        <TextField
          label="Local SDP"
          multiline
          rows={3}
          fullWidth
          value={localSDP}
          sx={{ mb: 2 }}
        />

        {/* Remote SDP */}
        <TextField
          label="Paste Remote SDP"
          multiline
          rows={3}
          fullWidth
          value={remoteSDP}
          onChange={(e) => setRemoteSDP(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Chat Messages */}
        <Paper
          variant="outlined"
          sx={{
            height: 200,
            overflowY: "auto",
            p: 1,
            mb: 2,
            borderRadius: 2,
            bgcolor: "#f5f5f5",
          }}
        >
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={msg.text}
                  secondary={msg.sender}
                  sx={{
                    textAlign: msg.sender === "You" ? "right" : "left",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Message Input */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            label="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
