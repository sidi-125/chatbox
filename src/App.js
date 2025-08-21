import React, { useState, useEffect } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import useWebSocket from "./hooks/websocket";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import ChatHeader from "./components/chatHeader";
import MessageList from "./components/messageList";
import ImagePreview from "./components/imagePreview";
import MessageInput from "./components/messageInput";

const drawerWidth = 250;
const headerHeight = 64;

export default function App() {
	const [username] = useState("Sidra"); // hardcoded for simplicity
	const [receiver, setReceiver] = useState("Sana");
	const [input, setInput] = useState("");
	const [image, setImage] = useState(null);
	const [darkMode, setDarkMode] = useState(false);

	const [isBlocked, setIsBlocked] = useState(false); // new

	const userMap = { 18: "Sana", 17: "Sidra" };
	const users = Object.values(userMap);

	const { messages, sendMessage, deleteChat, blockUser, unblockUser } = useWebSocket(
		username,
		receiver,
		userMap
	);

	const handleSend = () => {
  if (!input.trim() && !image) return;
  sendMessage(input.trim(), image); // pass only string + image
  setInput("");
  setImage(null);
};


	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onloadend = () => setImage(reader.result);
		reader.readAsDataURL(file);
	};

	// Wrap block/unblock to also update state
	const handleBlockUser = async () => {
		await blockUser();
		setIsBlocked(true);
	};

	const handleUnblockUser = async () => {
		await unblockUser();
		setIsBlocked(false);
	};

	const theme = createTheme({
		palette: { mode: darkMode ? "dark" : "light" },
	});

	return (
		<ThemeProvider theme={theme}>
			<Box sx={{ display: "flex", height: "100vh" }}>
				<CssBaseline />
				<Header username={username} darkMode={darkMode} setDarkMode={setDarkMode} />

				<Sidebar
					users={users}
					receiver={receiver}
					setReceiver={setReceiver}
					drawerWidth={drawerWidth}
					headerHeight={headerHeight}
					darkMode={darkMode}
				/>

				<Box
					sx={{
						flexGrow: 1,
						display: "flex",
						flexDirection: "column",
						mt: `${headerHeight}px`,
						p: 3,
					}}
				>
					<ChatHeader
						receiver={receiver}
						onClearChat={deleteChat}
						onBlockUser={handleBlockUser}
						onUnblockUser={handleUnblockUser}
						isBlocked={isBlocked}   
						darkMode={darkMode}
					/>

					<Box
						sx={{
							flexGrow: 1,
							overflowY: "auto",
							borderRadius: 2,
							p: 2,
							mb: 2,
							position: "relative",
							background: darkMode
								? "linear-gradient(135deg, #1a1a1a, #222, #2a2a2a, #1a1a1a)"
								: "linear-gradient(135deg, #f0f0f0, #e6e6e6, #f9f9f9, #f0f0f0)",
							backgroundSize: "400% 400%",
							animation: "gradientAnimation 15s ease infinite",
							boxShadow: darkMode
								? "inset 0 0 20px rgba(0,0,0,0.6)"
								: "inset 0 0 20px rgba(0,0,0,0.1)",
							"&::before": {
								content: '""',
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: "100%",
								backgroundImage:
									'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.05)" /></svg>\')',
								pointerEvents: "none",
								borderRadius: "inherit",
							},
						}}
					>
						<MessageList messages={messages} />
					</Box>

					<ImagePreview image={image} setImage={setImage} />
					<MessageInput
						input={input}
						setInput={setInput}
						handleSend={handleSend}
						handleFileUpload={handleFileUpload}
						receiver={receiver}
						darkMode={darkMode}
					/>
				</Box>
			</Box>
		</ThemeProvider>
	);
}