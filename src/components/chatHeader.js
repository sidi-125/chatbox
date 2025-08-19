// ChatHeader.jsx
import React, { useState } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function ChatHeader({
	receiver,
	onClearChat,
	onBlockUser,
	onUnblockUser,
	isBlocked,   
	darkMode,
}){
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
	const handleMenuClose = () => setAnchorEl(null);

	const handleClearChat = () => {
		handleMenuClose();
		if (onClearChat) onClearChat();
	};

	const handleBlockUser = () => {
		handleMenuClose();
		if (onBlockUser) onBlockUser();
	};

	const handleBlockToggle = () => {
		handleMenuClose();
		if (isBlocked) {
			if (onUnblockUser) onUnblockUser();
		} else {
			if (onBlockUser) onBlockUser();
		}
	};
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				p: 2,
				borderRadius: 2,
				mb: 2,
				bgcolor: darkMode ? "#205562ff" : "#2193b0",
				boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
				color: darkMode ? "#e3f2fd" : "#ffffffff",
				transition: "all 0.3s ease",
			}}
		>
			<Typography
				variant="h6"
				sx={{
					fontWeight: 700,
					letterSpacing: 1,
					textTransform: "capitalize",
				}}
			>
				{receiver}
			</Typography>

			<IconButton
				onClick={handleMenuOpen}
				sx={{
					color: "inherit",
					"&:hover": {
						bgcolor: darkMode
							? "rgba(255,255,255,0.1)"
							: "rgba(255,255,255,0.2)",
						transform: "scale(1.1)",
						transition: "all 0.2s ease",
					},
				}}
			>
				<MoreVertIcon />
			</IconButton>

			<Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
				<MenuItem onClick={handleClearChat}>Clear Chat</MenuItem>
				<MenuItem onClick={handleBlockToggle}>
					{isBlocked ? "Unblock User" : "Block User"}
				</MenuItem>
			</Menu>
		</Box>
	);
}
