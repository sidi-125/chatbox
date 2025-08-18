import React, { useState } from "react";
import useWebSocket from "./hooks/useWebSocket";

export default function ChatPage() {
    const senderId = 4;     // Current logged-in user ID
    const receiverId = 5;   // Person you're chatting with

    const { messages, sendMessage } = useWebSocket(senderId, receiverId);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input);
            setInput("");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Chat</h2>

            <div
                style={{
                    border: "1px solid #ccc",
                    height: "300px",
                    overflowY: "auto",
                    padding: "10px",
                    marginBottom: "10px"
                }}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: msg.sender === senderId ? "right" : "left",
                            margin: "5px 0"
                        }}
                    >
                        <strong>
                            {msg.sender === senderId ? "You" : "Them"}:
                        </strong>{" "}
                        {msg.content}
                        <div style={{ fontSize: "0.8em", color: "#888" }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
}
