import { useEffect, useRef, useState, useCallback } from "react";

export default function useWebSocket(username, receiver, userMap) {
	const [messages, setMessages] = useState([]);
	const wsRef = useRef(null);
	const messageQueue = useRef([]);

	const BASE_URL = process.env.REACT_APP_WS_BASE_URL;

	// Helper to convert disappear_option string to milliseconds
	function parseDisappearOption(option) {
		switch (option) {
			case "1min": // 1 minute
				return 60 * 1000;
			case "24h": // 24 hours
				return 24 * 60 * 60 * 1000;
			case "7d": // 7 days
				return 7 * 24 * 60 * 60 * 1000;
			default:
				return 0; // "off"
		}
	}

	// Fetch latest chat history
	const fetchHistory = useCallback(async () => {
		if (!username || !receiver) return;
		try {
			const res = await fetch(
				`https://${BASE_URL}/history/${username}/${receiver}/`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ username, receiver }),
				}
			);
			if (!res.ok) throw new Error("Failed to fetch messages");

			const data = await res.json();
			const filteredMessages = data.map((msg) => {
				return {
					sender: userMap[msg.sender] || msg.sender, // display name for UI
					text: msg.content || msg.message || "",
					image: msg.image || null,
					timestamp: msg.timestamp,
					type: msg.sender === username ? "sent" : "received", // <-- FIXED
				};
			});
			setMessages((prev) => {
				const existingKeys = new Set(prev.map((m) => m.sender + m.timestamp));
				const newMsgs = filteredMessages.filter(
					(m) => !existingKeys.has(m.sender + m.timestamp)
				);
				return [...prev, ...newMsgs];
			});
		} catch (err) {
			console.error("Error fetching history:", err);
		}
	}, [username, receiver, userMap]);

	// WebSocket connection
	useEffect(() => {
		if (!username || !receiver) return;

		const wsUrl = `wss://${BASE_URL}/ws/chat/${username}/`;
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log("WebSocket connected");
			// flush queued messages
			messageQueue.current.forEach((msg) => ws.send(JSON.stringify(msg)));
			messageQueue.current = [];
			fetchHistory();
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				const incomingMessage = {
					sender: data.sender || data.from || "Unknown",
					text: data.message?.trim() || "", // <-- use message here
					image: data.image || null,
					timestamp: data.timestamp || new Date().toISOString(),
					type: data.sender === username ? "sent" : "received",
					disappearOption: data.disappear_option || null,
				};
				setMessages((prev) => [...prev, incomingMessage]);

				if (incomingMessage.disappearOption) {
					const durationMs = parseDisappearOption(
						incomingMessage.disappearOption
					);
					setTimeout(() => {
						setMessages((prev) =>
							prev.filter(
								(m) =>
									!(
										m.sender === incomingMessage.sender &&
										m.timestamp === incomingMessage.timestamp
									)
							)
						);
					}, durationMs);
				}
				fetchHistory(); // merge safely
			} catch (err) {
				console.error("Error parsing WS message", err);
			}
		};

		ws.onclose = () => {
			console.warn("WebSocket closed. Reconnecting in 2s...");
			setTimeout(() => {
				if (username && receiver && !wsRef.current) {
					wsRef.current = new WebSocket(wsUrl);
				}
			}, 2000);
		};

		return () => {
			wsRef.current = null;
			ws.close();
		};
	}, [username, receiver]);

	// Send message
	const sendMessage = async (
		text = "",
		image = null,
		disappearOption = null
	) => {
		const payload = {
			receiver,
			message: text || " ",
			image: image || null,
		};

		console.log("WS payload:", JSON.stringify(payload));

		if (disappearOption) {
			payload.disappear_option = disappearOption; // add disappearing option
			console.log("⏳ Sending disappearing message:", payload);
		}

		setMessages((prev) => [
			...prev,
			{
				sender: username,
				text: text || "",
				image,
				timestamp: new Date().toISOString(),
				type: "sent",
				disappearOption: disappearOption || null,
			},
		]);

		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(payload));
		} else {
			messageQueue.current.push(payload);
		}
		fetchHistory();
	};

	// Delete chat
	const deleteChat = async () => {
		if (!username || !receiver) return;

		try {
			const res = await fetch(
				`https://${BASE_URL}/chat/delete/${username}/${receiver}/`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (!res.ok) throw new Error("Failed to delete chat");

			console.log("Chat deleted successfully");
			setMessages([]); // clear chat only for the user who deleted
		} catch (err) {
			console.error("Error deleting chat:", err);
		}
	};

	// Block user
	const blockUser = async () => {
		if (!username || !receiver) return;

		try {
			const res = await fetch(`https://${BASE_URL}/block-user/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ blocker: username, blocked: receiver }),
			});

			if (!res.ok) throw new Error("Failed to block user");

			console.log(`${receiver} has been blocked by ${username}`);
		} catch (err) {
			console.error("Error blocking user:", err);
		}
	};

	//unblock user
	const unblockUser = async () => {
		if (!username || !receiver) return;

		try {
			const res = await fetch(`https://${BASE_URL}/unblock-user/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ blocker: username, blocked: receiver }),
			});
			if (!res.ok) throw new Error("Failed to unblock user");

			console.log(`${receiver} has been unblocked by ${username}`);
		} catch (err) {
			console.error("Error unblocking user:", err);
		}
	};

	return { messages, sendMessage, deleteChat, blockUser, unblockUser };
}