import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function WebRTCChat() {
  const [offerValue, setOfferValue] = useState("");
  const [answerValue, setAnswerValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);

  const createConnection = () => {
    pcRef.current = new RTCPeerConnection();
    dataChannelRef.current = pcRef.current.createDataChannel("chat");

    dataChannelRef.current.onmessage = (e) => {
      setMessages((prev) => [...prev, { sender: "Peer", text: e.data }]);
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) return;
      setOfferValue(JSON.stringify(pcRef.current.localDescription));
    };
  };

  const createOffer = async () => {
    createConnection();
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
  };

  const createAnswer = async () => {
    createConnection();
    try {
      const offer = JSON.parse(offerValue);
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      pcRef.current.onicecandidate = (event) => {
        if (event.candidate) return;
        setAnswerValue(JSON.stringify(pcRef.current.localDescription));
      };
    } catch {
      alert("Invalid Offer JSON");
    }
  };

  const addAnswer = async () => {
    try {
      const answer = JSON.parse(answerValue);
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch {
      alert("Invalid Answer JSON");
    }
  };

  const sendMessage = () => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      alert("Data channel is not open.");
      return;
    }
    if (!input.trim()) return;

    dataChannelRef.current.send(input);
    setMessages((prev) => [...prev, { sender: "You", text: input }]);
    setInput("");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: "auto", fontFamily: "Arial, sans-serif" }}>
      <Typography variant="h4" gutterBottom>
        WebRTC Offline Chat
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" onClick={createOffer} sx={{ mb: 1 }}>
          Create Offer
        </Button>
        <TextField
          label="Offer"
          multiline
          minRows={4}
          fullWidth
          value={offerValue}
          onChange={(e) => setOfferValue(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={createAnswer} sx={{ mb: 1 }}>
          Create Answer
        </Button>
        <TextField
          label="Answer"
          multiline
          minRows={4}
          fullWidth
          value={answerValue}
          onChange={(e) => setAnswerValue(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={addAnswer}>
          Add Answer
        </Button>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          Messages
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            height: 240,
            overflowY: "auto",
            p: 2,
            mb: 2,
            backgroundColor: "#f9f9f9",
          }}
        >
          {messages.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
              No messages yet.
            </Typography>
          ) : (
            <List>
              {messages.map((msg, i) => (
                <ListItem key={i} sx={{ justifyContent: "flex-start" }}>
                <Box
                  sx={{
                    bgcolor: "grey.300",
                    color: "text.primary",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    wordBreak: "break-word",
                    ml: 1, // add some left margin
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.3 }}>
                    {msg.sender}:
                  </Typography>
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </ListItem>
              ))}
            </List>
          )}
        </Paper>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
