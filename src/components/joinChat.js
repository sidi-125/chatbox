import React, { useState, useRef } from "react";

export default function JoinChat() {
  const [offerSDP, setOfferSDP] = useState("");
  const [answerSDP, setAnswerSDP] = useState("");
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();

  const pcRef = useRef();
  const channelRef = useRef();

  const joinOffer = async () => {
    pcRef.current = new RTCPeerConnection();

    pcRef.current.ondatachannel = (event) => {
      channelRef.current = event.channel;
      channelRef.current.onmessage = (e) =>
        setMessages((m) => [...m, `Peer: ${e.data}`]);
    };

    const offer = JSON.parse(offerSDP);
    await pcRef.current.setRemoteDescription(offer);

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) return;
      setAnswerSDP(JSON.stringify(pcRef.current.localDescription));
    };
  };

  const sendMessage = () => {
    const msg = inputRef.current.value;
    channelRef.current.send(msg);
    setMessages((m) => [...m, `Me: ${msg}`]);
    inputRef.current.value = "";
  };

  return (
    <div>
      <h2>Receiver</h2>
      <h3>Paste Offer SDP:</h3>
      <textarea
        value={offerSDP}
        onChange={(e) => setOfferSDP(e.target.value)}
        rows={10}
        cols={60}
      />
      <button onClick={joinOffer}>Join Chat</button>
      <h3>Answer SDP (send to sender):</h3>
      <textarea value={answerSDP} readOnly rows={10} cols={60} />
      <hr />
      <h3>Chat</h3>
      <input ref={inputRef} />
      <button onClick={sendMessage}>Send</button>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
    </div>
  );
}
