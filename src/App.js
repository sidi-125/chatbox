import React, { useState, useRef } from "react";
import { Box } from "@mui/material";
import Sidebar from "./components/sidebar";
import ChatHeader from "./components/chatHeader";
import MessageList from "./components/messageList";
import MessageInput from "./components/messageInput";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [offerSDP, setOfferSDP] = useState("");
  const [answerSDP, setAnswerSDP] = useState("");
  const pcRef = useRef(null);
  const dcRef = useRef(null);

  const logMessage = (text, fromMe = false) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), fromMe, text, time: new Date().toLocaleTimeString() },
    ]);
  };

  const createOffer = async () => {
    pcRef.current = new RTCPeerConnection({ iceServers: [] });
    dcRef.current = pcRef.current.createDataChannel("chat");
    dcRef.current.onmessage = (e) => logMessage(e.data, false);

    pcRef.current.onicecandidate = () => {
      setOfferSDP(JSON.stringify(pcRef.current.localDescription));
    };

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
  };

  const createAnswer = async () => {
    pcRef.current = new RTCPeerConnection({ iceServers: [] });
    pcRef.current.ondatachannel = (e) => {
      dcRef.current = e.channel;
      dcRef.current.onmessage = (ev) => logMessage(ev.data, false);
    };

    pcRef.current.onicecandidate = () => {
      setAnswerSDP(JSON.stringify(pcRef.current.localDescription));
    };

    await pcRef.current.setRemoteDescription(JSON.parse(offerSDP));
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);
  };

  const applyAnswer = async () => {
    await pcRef.current.setRemoteDescription(JSON.parse(answerSDP));
  };

  const sendMessage = (text) => {
    if (dcRef.current?.readyState === "open") {
      dcRef.current.send(text);
      logMessage(text, true);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: darkMode ? "grey.900" : "grey.100" }}>
      <Sidebar users={[]} darkMode={darkMode} setDarkMode={setDarkMode} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <ChatHeader darkMode={darkMode} />

        {/* Debug controls for manual LAN handshake */}
        <div style={{ padding: 10, background: "#eee" }}>
          <button onClick={createOffer}>Create Offer</button>
          <textarea value={offerSDP} onChange={(e) => setOfferSDP(e.target.value)} placeholder="Offer SDP" style={{ width: "100%" }} />
          <button onClick={createAnswer}>Create Answer</button>
          <textarea value={answerSDP} onChange={(e) => setAnswerSDP(e.target.value)} placeholder="Answer SDP" style={{ width: "100%" }} />
          <button onClick={applyAnswer}>Apply Answer</button>
        </div>

        <MessageList messages={messages} darkMode={darkMode} />
        <MessageInput sendMessage={sendMessage} />
      </Box>
    </Box>
  );
}
