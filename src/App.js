// src/App.js
import React, { useState } from "react";
import Header from "./components/header";
import WebRTCChat from "./webRTC/index";

export default function App() {
  const [status, setStatus] = useState("Not connected");

  return (
    <div>
      {/* Header with dynamic status */}
      <Header status={status} />

      {/* WebRTC Chat — passes setStatus so it can update header */}
      <WebRTCChat setStatus={setStatus} />
    </div>
  );
}
