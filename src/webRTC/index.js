import React, { useState, useRef } from "react";

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
      console.log("Offer created:", JSON.stringify(pcRef.current.localDescription));
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
    const offer = JSON.parse(offerValue); // <--- ERROR happens if field is empty
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) return;
      console.log("Answer created:", JSON.stringify(pcRef.current.localDescription));
      setAnswerValue(JSON.stringify(pcRef.current.localDescription));
    };
  };

  const addAnswer = async () => {
    const answer = JSON.parse(answerValue);
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const sendMessage = () => {
    dataChannelRef.current.send(input);
    setMessages((prev) => [...prev, { sender: "You", text: input }]);
    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>WebRTC Offline Chat</h2>
      <div>
        <button onClick={createOffer}>Create Offer</button>
        <textarea
          placeholder="Offer"
          value={offerValue}
          onChange={(e) => setOfferValue(e.target.value)}
          style={{ width: "100%", height: "100px" }}
        />
      </div>
      <div>
        <button onClick={createAnswer}>Create Answer</button>
        <textarea
          placeholder="Answer"
          value={answerValue}
          onChange={(e) => setAnswerValue(e.target.value)}
          style={{ width: "100%", height: "100px" }}
        />
      </div>
      <div>
        <button onClick={addAnswer}>Add Answer</button>
      </div>
      <div>
        <h3>Messages</h3>
        <div style={{ border: "1px solid gray", padding: 10, height: "200px", overflowY: "scroll" }}>
          {messages.map((msg, i) => (
            <div key={i}><b>{msg.sender}:</b> {msg.text}</div>
          ))}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
