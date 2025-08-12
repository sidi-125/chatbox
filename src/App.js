import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const dcRef = useRef(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  function connectWebSocket() {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("Connected to signaling server");
      createPeerConnection();
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (!pcRef.current) return;

      try {
        if (data.sdp) {
          // Handle SDP (offer or answer)
          if (data.sdp.type === "offer") {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            sendSignal({ sdp: pcRef.current.localDescription });
          } else if (data.sdp.type === "answer") {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          }
        } else if (data.candidate) {
          // Handle ICE candidate
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (e) {
            console.error("Error adding ICE candidate", e);
          }
        }
      } catch (e) {
        console.error("Error handling signaling data", e);
      }
    };

    ws.onclose = () => {
      setStatus("Disconnected from signaling server");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatus("WebSocket error");
    };
  }

  function sendSignal(message) {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }

  function createPeerConnection() {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pcRef.current = pc;

    // Create data channel as initiator
    const dc = pc.createDataChannel("chat");
    dcRef.current = dc;
    setupDataChannel(dc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ candidate: event.candidate });
      }
    };

    pc.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      dcRef.current = receiveChannel;
      setupDataChannel(receiveChannel);
    };

    pc.onconnectionstatechange = () => {
      setStatus(`Connection state: ${pc.connectionState}`);
      if (pc.connectionState === "connected") {
        setStatus("Connected to peer");
      }
    };

    // Create offer and send
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => {
        sendSignal({ sdp: pc.localDescription });
        setStatus("Offer sent, waiting for answer...");
      })
      .catch((err) => {
        console.error("Error creating offer:", err);
        setStatus("Error creating offer");
      });
  }

  function setupDataChannel(dc) {
    dc.onopen = () => {
      setStatus("Data channel open - you can chat now");
    };

    dc.onclose = () => {
      setStatus("Data channel closed");
    };

    dc.onmessage = (event) => {
      setMessages((msgs) => [...msgs, { who: "Peer", text: event.data, ts: new Date().toLocaleTimeString() }]);
    };
  }

  function sendMessage() {
    if (dcRef.current && dcRef.current.readyState === "open" && input.trim() !== "") {
      dcRef.current.send(input);
      setMessages((msgs) => [...msgs, { who: "Me", text: input, ts: new Date().toLocaleTimeString() }]);
      setInput("");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h2>LAN WebRTC Chat (Automatic Signaling)</h2>
      <p><b>Status:</b> {status}</p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 12,
          height: 300,
          overflowY: "auto",
          backgroundColor: "#fafafa",
          marginBottom: 12,
          borderRadius: 8,
        }}
      >
        {messages.length === 0 && <p style={{ color: "#999" }}>No messages yet.</p>}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.who === "Me" ? "right" : "left",
              marginBottom: 6,
            }}
          >
            <span
              style={{
                display: "inline-block",
                backgroundColor: msg.who === "Me" ? "#0b93f6" : "#e5e5ea",
                color: msg.who === "Me" ? "white" : "black",
                padding: "6px 12px",
                borderRadius: 20,
                maxWidth: "80%",
                wordWrap: "break-word",
              }}
            >
              <b>{msg.who}:</b> {msg.text}
              <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6 }}>{msg.ts}</div>
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flexGrow: 1, padding: 10, fontSize: 16, borderRadius: 4, border: "1px solid #ccc" }}
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0b93f6",
            border: "none",
            color: "white",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
