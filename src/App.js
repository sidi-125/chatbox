import React, { useRef, useState } from "react";

export default function App() {
  const [offerLocal, setOfferLocal] = useState("");
  const [remoteOffer, setRemoteOffer] = useState("");
  const [answerLocal, setAnswerLocal] = useState("");
  const [remoteAnswer, setRemoteAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");

  const pcRef = useRef(null);
  const dcRef = useRef(null);

  const pushMessage = (who, text) => {
    setMessages((m) => [
      ...m,
      { who, text, ts: new Date().toLocaleTimeString() }
    ]);
  };

  function makePeerConnection(isInitiator = false) {
    const pc = new RTCPeerConnection({ iceServers: [] });

    pc.onicecandidate = (ev) => {
      if (!ev.candidate) {
        setStatus(
          `${isInitiator ? "Offer" : "Answer"}: ICE gathering finished`
        );
      }
    };

    pc.onconnectionstatechange = () => {
      setStatus(`Connection: ${pc.connectionState}`);
    };

    pc.ondatachannel = (ev) => {
      setupDataChannel(ev.channel);
    };

    return pc;
  }

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

  async function createOffer() {
    try {
      setStatus("Creating offer...");
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
        dcRef.current = null;
      }

      const pc = makePeerConnection(true);
      pcRef.current = pc;

      const ch = pc.createDataChannel("chat");
      setupDataChannel(ch);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGatheringComplete(pc);

      setOfferLocal(JSON.stringify(pc.localDescription));
      setStatus("Offer created — copy Offer (local) and send to peer B");
    } catch (err) {
      console.error("createOffer error", err);
      alert("Error creating offer: " + err.message);
      setStatus("error");
    }
  }

  async function createAnswer() {
    try {
      if (!remoteOffer.trim()) {
        alert("Paste the remote Offer JSON first.");
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(remoteOffer.trim());
      } catch (err) {
        alert("Invalid Offer JSON: " + err.message);
        return;
      }

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
        dcRef.current = null;
      }

      const pc = makePeerConnection(false);
      pcRef.current = pc;

      await pc.setRemoteDescription(parsed);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitForIceGatheringComplete(pc);

      setAnswerLocal(JSON.stringify(pc.localDescription));
      setStatus("Answer created — copy Answer (local) and send to peer A");
    } catch (err) {
      console.error("createAnswer error", err);
      alert("Error creating answer: " + err.message);
      setStatus("error");
    }
  }

  async function applyAnswer() {
    try {
      if (!remoteAnswer.trim()) {
        alert("Paste the remote Answer JSON first.");
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
        alert("No peer connection found. Create offer first.");
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
      setTimeout(resolve, 3000);
    });
  }

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
      <p><b>Status:</b> {status}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #ddd", padding: 12 }}>
          <h3>Peer A (Offer)</h3>
          <button onClick={createOffer}>Create Offer</button>
          <textarea value={offerLocal} readOnly style={{ width: "100%", height: 120, marginTop: 8 }} />
          <textarea
            value={remoteAnswer}
            onChange={(e) => setRemoteAnswer(e.target.value)}
            style={{ width: "100%", height: 120, marginTop: 8 }}
            placeholder="Paste remote Answer JSON here"
          />
          <button onClick={applyAnswer} style={{ marginTop: 6 }}>Apply Answer</button>
        </div>

        <div style={{ border: "1px solid #ddd", padding: 12 }}>
          <h3>Peer B (Answer)</h3>
          <textarea
            value={remoteOffer}
            onChange={(e) => setRemoteOffer(e.target.value)}
            style={{ width: "100%", height: 120 }}
            placeholder="Paste remote Offer JSON here"
          />
          <button onClick={createAnswer} style={{ marginTop: 6 }}>Create Answer</button>
          <textarea value={answerLocal} readOnly style={{ width: "100%", height: 120, marginTop: 8 }} />
        </div>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 12 }}>
        <h3>Chat</h3>
        <div style={{ border: "1px solid #eee", height: 240, overflowY: "auto", padding: 8 }}>
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
      </div>
    </div>
  );
}
