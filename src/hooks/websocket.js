import { useEffect, useRef, useState, useCallback } from "react";

export default function useWebSocket(username, receiver, userMap) {
	const [messages, setMessages] = useState([]);
	const wsRef = useRef(null);
	const messageQueue = useRef([]);

	// Fetch latest chat history
	const fetchHistory = useCallback(async () => {
		if (!username || !receiver) return;
		try {
			const res = await fetch(
				`https://58a9b00b5441.ngrok-free.app/chat/${username}/${receiver}/`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ username, receiver }),
				}
			);
			if (!res.ok) throw new Error("Failed to fetch messages");

			const data = await res.json();
			const filteredMessages = data.map((msg) => {
				const senderName = userMap[msg.sender] || "unknown";
				const type = senderName === username ? "sent" : "received";
				return {
					sender: senderName,
					text: msg.content || "", // use text here
					image: msg.image || null,
					timestamp: msg.timestamp,
					type,
				};
			});

			setMessages(filteredMessages);
		} catch (err) {
			console.error("Error fetching history:", err);
		}
	}, [username, receiver, userMap]);

	// WebSocket connection
	useEffect(() => {
		if (!username || !receiver) return;

		const wsUrl = `wss://58a9b00b5441.ngrok-free.app/ws/chat/${username}/`;
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log("✅ WebSocket connected");
			// flush queued messages
			messageQueue.current.forEach((msg) => ws.send(JSON.stringify(msg)));
			messageQueue.current = [];
			fetchHistory(); // only once on connect
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				console.log("WS received:", data);

				const incomingMessage = {
					sender: data.from || "Unknown",
					text: data.message?.trim() || "",
					image: data.image || null,
					timestamp: data.timestamp || new Date().toISOString(),
					type: data.from === username ? "sent" : "received",
				};

				setMessages((prev) => [...prev, incomingMessage]);
			} catch (err) {
				console.error("Error parsing WS message", err);
			}
		};

		ws.onclose = () => {
			console.warn("❌ WebSocket closed. Reconnecting in 2s...");
			setTimeout(() => {
				if (username && receiver && !wsRef.current) {
					// reconnect
					wsRef.current = new WebSocket(wsUrl);
				}
			}, 2000);
		};

		return () => {
			wsRef.current = null;
			ws.close();
		};
	}, [username, receiver]); // 👈 fetchHistory removed from deps!

	// Send message
	const sendMessage = async (text = "", image = null) => {
		const payload = {
			receiver,
			message: text || " ",
			image: image || null,
		};

		setMessages((prev) => [
			...prev,
			{
				sender: username,
				text: text || "",
				image,
				timestamp: new Date().toISOString(),
				type: "sent",
			},
		]);

		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(payload));
		} else {
			messageQueue.current.push(payload);
		}
	};

	return { messages, sendMessage };
}
