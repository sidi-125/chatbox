import React, { useRef, useState } from "react";

/**
 * Offline WebRTC chat (manual signaling) - single-file beginner example.
 *
 * Replace your CRA src/App.js with this file.
 *
 * Note: For LAN-only testing we use an empty iceServers list. If you need NAT traversal
 * across different networks, provide STUN/TURN servers.
 */

export default function App() {
  const [offerLocal, setOfferLocal] = useState("");
  const [remoteOffer, setRemoteOffer] = useState("");
  const [answerLocal, setAnswerLocal] = useState("");
  const [remoteAnswer, setRemoteAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");

  // Refs to keep objects across renders
  const pcRef = useRef(null);
  const dcRef = useRef(null);

  // Helper to append chat messages
  const pushMessage = (who, text) => {
    setMessages((m) => [...m, { who, text, ts: new Date().toLocaleTimeString() }]);
  };

  // Helper to create RTCPeerConnection and set common handlers
  function makePeerConnection(isInitiator = false) {
    // For LAN-only testing you can leave iceServers empty.
    const pc = new RTCPeerConnection({ iceServers: [] });

    pc.onicecandidate = (ev) => {
      // When ev.candidate is null, ICE gathering is complete and localDescription is final
      if (!ev.candidate) {
        // we will pick up pc.localDescription from the caller's flow
        setStatus((s) => `${isInitiator ? "Offer" : "Answer"}: ICE gathering finished`);
      }
    };

    pc.onconnectionstatechange = () => {
      setStatus(`Connection: ${pc.connectionState}`);
    };

    // If remote creates a datachannel, receive it here
    pc.ondatachannel = (ev) => {
      const ch = ev.channel;
      setupDataChannel(ch);
    };

    return pc;
  }

  // Setup a DataChannel object (open/message/close)
  function setupDataChannel(ch) {
    dcRef.current = ch;

    ch.onopen = () => {
      setStatus("DataChannel: open");
      pushMessage("system", "Data channel opened — you can send messages.");
    };
    ch.onclose = () => {
      setStatus("DataChannel: closed");
      pushMessage("system", "Data channel closed.");
    };
    ch.onmessage = (ev) => {
      pushMessage("peer", ev.data);
    };
  }

  // Initiator: create offer, create data channel, set local description and wait for ICE
  async function createOffer() {
    try {
      setStatus("Creating offer...");
      // clean up old
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
        dcRef.current = null;
      }

      const pc = makePeerConnection(true);
      pcRef.current = pc;

      // Create data channel (initiator creates it)
      const ch = pc.createDataChannel("chat");
      setupDataChannel(ch);

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait until ICE gathering finishes (candidate becomes null). We'll poll the state.
      await waitForIceGatheringComplete(pc);

      // Now localDescription contains all gathered ICE candidates
      setOfferLocal(JSON.stringify(pc.localDescription));
      setStatus("Offer created — copy Offer (local) and send to peer B");
    } catch (err) {
      console.error("createOffer error", err);
      alert("Error creating offer: " + err.message);
      setStatus("error");
    }
  }

  // Responder: read remoteOffer, create answer, set local description and wait for ICE
  async function createAnswer() {
    try {
      if (!remoteOffer || !remoteOffer.trim()) {
        alert("Paste the remote Offer JSON into the Remote Offer field before creating an answer.");
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(remoteOffer.trim());
      } catch (err) {
        alert("Invalid Offer JSON: " + err.message);
        return;
      }

      // Clean old
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
        dcRef.current = null;
      }

      const pc = makePeerConnection(false);
      pcRef.current = pc;

      // ondatachannel handler in makePeerConnection will call setupDataChannel when the initiator's
      // data channel arrives.

      // Apply remote offer
      await pc.setRemoteDescription(parsed);

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Wait for ICE to finish gathering
      await waitForIceGatheringComplete(pc);

      setAnswerLocal(JSON.stringify(pc.localDescription));
      setStatus("Answer created — copy Answer (local) and send to peer A");
    } catch (err) {
      console.error("createAnswer error", err);
      alert("Error creating answer: " + err.message);
      setStatus("error");
    }
  }

  // Peer A: apply the remote answer JSON to finish the handshake
  async function applyAnswer() {
    try {
      if (!remoteAnswer || !remoteAnswer.trim()) {
        alert("Paste the remote Answer JSON into the Remote Answer field before applying it.");
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(remoteAnswer.trim());
      } catch (err) {
        alert("Invalid Answer JSON: " + err.message);
        return;
      }
      if (!pcRef.current) {
        alert("No peer connection found. Create offer first on this machine.");
        return;
      }
      await pcRef.current.setRemoteDescription(parsed);
      setStatus("Remote answer applied — waiting for connection");
    } catch (err) {
      console.error("applyAnswer error", err);
      alert("Error applying answer: " + err.message);
      setStatus("error");
    }
  }

  // Utility: wait until ICE gathering state complete.
  function waitForIceGatheringComplete(pc) {
    return new Promise((resolve) => {
      if (pc.iceGatheringState === "complete") {
        resolve();
      } else {
        function checkState() {
          if (pc.iceGatheringState === "complete") {
            pc.removeEventListener("icegatheringstatechange", checkState);
            resolve();
          }
        }
        pc.addEventListener("icegatheringstatechange", checkState);
      }
      // Also fallback: resolve after 3s in case some browsers don't change state quickly
      setTimeout(() => {
        if (pc && pc.iceGatheringState !== "complete") {
          resolve();
        }
      }, 3000);
    });
  }

  // Send chat message over datachannel
  function sendMessage() {
    if (!dcRef.current || dcRef.current.readyState !== "open") {
      alert("Data channel not open yet.");
      return;
    }
    if (!input.trim()) return;
    dcRef.current.send(input);
    pushMessage("me", input);
    setInput("");
  }

  // Small UI helper to clear state
  function resetAll() {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    dcRef.current = null;
    setOfferLocal("");
    setRemoteOffer("");
    setAnswerLocal("");
    setRemoteAnswer("");
    setMessages([]);
    setInput("");
    setStatus("idle");
  }

  return (
    <div style={{ maxWidth: 960, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Offline WebRTC Chat — React (No backend)</h1>
      <p>
        <b>Status:</b> {status}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* LEFT: Offer side */}
        <div style={{ border: "1px solid #ddd", padding: 12 }}>
          <h3>Peer A (Offer)</h3>
          <button onClick={createOffer}>Create Offer</button>
          <div style={{ marginTop: 8 }}>
            <label><small>Offer (local) — copy this ENTIRE JSON and give to Peer B:</small></label>
            <textarea value={offerLocal} readOnly style={{ width: "100%", height: 120 }} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label><small>Remote Answer — paste Peer B's Answer JSON here, then click Apply Answer:</small></label>
            <textarea value={remoteAnswer} onChange={(e) => setRemoteAnswer(e.target.value)} style={{ width: "100%", height: 120 }} />
            <div style={{ marginTop: 6 }}>
              <button onClick={applyAnswer}>Apply Answer (finish)</button>
            </div>
          </div>
        </div>

        {/* RIGHT: Answer side */}
        <div style={{ border: "1px solid #ddd", padding: 12 }}>
          <h3>Peer B (Answer)</h3>
          <div>
            <label><small>Remote Offer — paste Peer A's Offer JSON here:</small></label>
            <textarea value={remoteOffer} onChange={(e) => setRemoteOffer(e.target.value)} style={{ width: "100%", height: 120 }} />
            <div style={{ marginTop: 6 }}>
              <button onClick={createAnswer}>Create Answer (from pasted Offer)</button>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <label><small>Answer (local) — copy this ENTIRE JSON and give to Peer A:</small></label>
            <textarea value={answerLocal} readOnly style={{ width: "100%", height: 120 }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 12 }}>
        <h3>Chat</h3>
        <div id="chat" style={{ border: "1px solid #eee", height: 240, overflowY: "auto", padding: 8 }}>
          {messages.length === 0 && <div style={{ color: "#888" }}>No messages yet.</div>}
          {messages.map((m, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <b>{m.who}:</b> {m.text} <span style={{ color: "#999", fontSize: 12 }}> — {m.ts}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
            style={{ flex: 1, padding: 8 }}
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={resetAll}>Reset</button>
        </div>

        <p style={{ marginTop: 12, color: "#555" }}>
          Notes: copy-paste the **entire** Offer/Answer JSON (including braces). If parsing fails, the UI will show an alert.
        </p>
      </div>
    </div>
  );
}