import { useEffect, useRef, useState, useCallback } from "react";

export default function useWebSocket(username, receiver, userMap) {
	const [messages, setMessages] = useState([]);
	const wsRef = useRef(null);
	const messageQueue = useRef([]);

	const BASE_URL = process.env.REACT_APP_WS_BASE_URL;

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
				const senderName = userMap[msg.sender] || "unknown";
				const type = senderName === username ? "sent" : "received";
				return {
					sender: senderName,
					text: msg.content || "",
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

		const wsUrl =`wss://${BASE_URL}/ws/chat/${username}/`;
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log("WebSocket connected");
			// flush queued messages
			messageQueue.current.forEach((msg) => ws.send(JSON.stringify(msg)));
			messageQueue.current = [];
			fetchHistory(); // only once on connect
		};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        const incomingMessage = {
            sender: data.sender || data.from || "Unknown",
            text: data.message?.trim() || "",  // <-- use `message` here
            image: data.image || null,
            timestamp: data.timestamp || new Date().toISOString(),
            type: data.sender === username ? "sent" : "received",
        };
        setMessages((prev) => [...prev, incomingMessage]);
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

	return { messages, sendMessage, deleteChat, blockUser, unblockUser };
}