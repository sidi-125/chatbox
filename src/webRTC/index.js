let pc;
let dataChannel;
let socket; // For signaling

export function initConnection(username, onMessage) {
  // 1. Create peer connection
  pc = new RTCPeerConnection();

  // 2. Setup data channel (sender)
  dataChannel = pc.createDataChannel("chat");
  dataChannel.onopen = () => console.log("Data channel open");
  dataChannel.onmessage = (event) => onMessage(event.data);

  // 3. Handle receiving data channel (receiver)
  pc.ondatachannel = (event) => {
    event.channel.onmessage = (e) => onMessage(e.data);
  };

  // 4. ICE candidate handling
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.send(JSON.stringify({
        type: "ice-candidate",
        candidate: event.candidate
      }));
    }
  };

  // 5. Setup signaling via WebSocket
  socket = new WebSocket("ws://192.168.0.100:8000"); // Replace with LAN server
  socket.onopen = async () => {
    socket.send(JSON.stringify({ type: "join", username }));
    await createOffer(); // Automatically create offer on join
  };

  socket.onmessage = async (msg) => {
    const data = JSON.parse(msg.data);

    if (data.type === "offer") {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.send(JSON.stringify({ type: "answer", answer }));
    }
    else if (data.type === "answer") {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
    else if (data.type === "ice-candidate" && data.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };
}

async function createOffer() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.send(JSON.stringify({ type: "offer", offer }));
}

export function sendMessage(message) {
  if (dataChannel && dataChannel.readyState === "open") {
    dataChannel.send(message);
  } else {
    console.error("Data channel not open yet.");
  }
}
