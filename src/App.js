import React, { useState } from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	CssBaseline,
	Box,
	TextField,
	Button,
	List,
	ListItem,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useWebSocket from "./hooks/websocket";
import ChatHeader from "./components/chatHeader";

const drawerWidth = 250;
const headerHeight = 64;

export default function App() {
	const [username] = useState("Yashal"); // Current device username
	const [receiver, setReceiver] = useState("Sidra");
	const [input, setInput] = useState("");
	const [image, setImage] = useState(null); // store base64 image

	// Map numeric IDs from backend to usernames
	const userMap = {
		4: "Yashal",
		5: "Sidra",
	};

	const { messages, sendMessage, deleteChat } = useWebSocket(username, receiver, userMap);


	// handle sending message
	const handleSend = () => {
		if (!input.trim() && !image) return;

		sendMessage(input.trim(), image);

		setInput("");
		setImage(null);
	};

	// handle file upload
	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			setImage(reader.result); // base64 string
		};
		reader.readAsDataURL(file);
	};

	return (
		<Box sx={{ display: "flex", height: "100vh" }}>
			<CssBaseline />

			{/* HEADER */}
			<AppBar position="fixed" sx={{ zIndex: 1300 }}>
				<Toolbar>
					<Typography variant="h6">Chat App - {username}</Typography>
				</Toolbar>
			</AppBar>

			{/* SIDEBAR */}
			<Box
				sx={{
					width: drawerWidth,
					borderRight: "1px solid #ccc",
					mt: `${headerHeight}px`,
					p: 2,
					bgcolor: "#f0f0f0",
				}}
			>
				<Typography variant="h6">Online Users</Typography>
				{[{ name: "Sidra" }].map((user) => (
					<Box
						key={user.name}
						sx={{
							display: "flex",
							alignItems: "center",
							p: 1,
							cursor: "pointer",
							bgcolor: receiver === user.name ? "primary.light" : "transparent",
							borderRadius: 1,
							mb: 1,
						}}
						onClick={() => setReceiver(user.name)}
					>
						<Typography>{user.name}</Typography>
					</Box>
				))}
			</Box>

			{/* MAIN CHAT AREA */}
			<Box
				sx={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					mt: `${headerHeight}px`,
					p: 3,
				}}
			>
				{/* Chat Header */}
				<ChatHeader receiver={receiver} onClearChat={deleteChat} />

				{/* Messages */}
				<Box
					sx={{
						flexGrow: 1,
						overflowY: "auto",
						border: "1px solid #ccc",
						borderRadius: 1,
						p: 2,
						mb: 2,
						bgcolor: "#fafafa",
					}}
				>
					{messages.length === 0 ? (
						<Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
							No messages yet
						</Typography>
					) : (
						<List>
							{messages.map((msg, index) => {
								// Normalize message text (in case backend sends objects)
								const text =
									typeof msg.message === "string"
										? msg.message
										: msg.message?.text || "";

								return (
									<ListItem
										key={index}
										sx={{
											display: "flex",
											justifyContent:
												msg.type === "sent" ? "flex-end" : "flex-start",
										}}
									>
										<Box
											sx={{
												bgcolor:
													msg.type === "sent" ? "primary.main" : "grey.300",
												color:
													msg.type === "sent"
														? "primary.contrastText"
														: "text.primary",
												px: 2,
												py: 1,
												borderRadius: 2,
												maxWidth: "70%",
												wordBreak: "break-word",
											}}
										>
											{/* Sender */}
											<Typography
												variant="body2"
												fontWeight="bold"
												sx={{ mb: 0.3 }}
											>
												{msg.sender}:
											</Typography>
											{/* Show text */}
											{msg.text && (
												<Typography variant="body2">{msg.text}</Typography>
											)}

											{/* Image */}
											{msg.image && typeof msg.image === "string" && (
												<Box sx={{ mt: 1 }}>
													<img
														src={msg.image}
														alt="uploaded"
														style={{
															maxWidth: "200px",
															maxHeight: "200px",
															borderRadius: "8px",
														}}
													/>
												</Box>
											)}

											{/* Timestamp */}
											{msg.timestamp && (
												<Typography
													variant="caption"
													sx={{
														display: "block",
														textAlign: msg.type === "sent" ? "right" : "left",
														mt: 0.5,
														color: msg.type === "sent" ? "#dcefff" : "#555",
													}}
												>
													{new Date(msg.timestamp).toLocaleTimeString([], {
														hour: "2-digit",
														minute: "2-digit",
													})}
												</Typography>
											)}
										</Box>
									</ListItem>
								);
							})}
						</List>
					)}
				</Box>

				{/* Image Preview*/}
				{image && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							mb: 1,
							p: 1,
							border: "1px solid #ccc",
							borderRadius: 2,
							bgcolor: "#fff",
						}}
					>
						<img
							src={image}
							alt="preview"
							style={{
								maxWidth: "100px",
								maxHeight: "100px",
								borderRadius: "8px",
								marginRight: "8px",
							}}
						/>
						<IconButton onClick={() => setImage(null)} size="small">
							<CloseIcon />
						</IconButton>
					</Box>
				)}

				{/* Input + Upload */}
				<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
					<TextField
						fullWidth
						placeholder={`Message to ${receiver}`}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSend()}
					/>
					<input
						type="file"
						accept="image/*"
						style={{ display: "none" }}
						id="upload-image"
						onChange={handleFileUpload}
					/>
					<label htmlFor="upload-image">
						<Button variant="outlined" component="span">
							Upload
						</Button>
					</label>
					<Button variant="contained" onClick={handleSend}>
						Send
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
