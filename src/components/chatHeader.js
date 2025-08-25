import React, { useState } from "react";
import {
	Box,
	Typography,
	IconButton,
	Menu,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function ChatHeader({
	receiver,
	onClearChat,
	onBlockUser,
	onUnblockUser,
	isBlocked,
	onSetDisappearOption,
	activeDisappearOption,
	darkMode,
}) {
	const [anchorEl, setAnchorEl] = useState(null);
	const [openModal, setOpenModal] = useState(false);
	const open = Boolean(anchorEl);

	const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
	const handleMenuClose = () => setAnchorEl(null);

	const handleClearChat = () => {
		handleMenuClose();
		if (onClearChat) onClearChat();
	};

	const handleBlockToggle = () => {
		handleMenuClose();
		if (isBlocked) {
			if (onUnblockUser) onUnblockUser();
		} else {
			if (onBlockUser) onBlockUser();
		}
	};

	const handleDisappearClick = () => {
		handleMenuClose();
		setOpenModal(true);
	};

	const handleOptionSelect = (option) => {
		setOpenModal(false);
		if (onSetDisappearOption) onSetDisappearOption(option);
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
			<Box>
				<Typography
					variant="h6"
					sx={{ fontWeight: 700, letterSpacing: 1, textTransform: "capitalize" }}
				>
					{receiver}
				</Typography>

				{/* Disappearing timer label */}
				{activeDisappearOption && activeDisappearOption !== "off" && (
					<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
						⏳ Disappearing: {formatOptionLabel(activeDisappearOption)}
					</Typography>
				)}
			</Box>

			<IconButton
				onClick={handleMenuOpen}
				sx={{
					color: "inherit",
					"&:hover": {
						bgcolor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)",
						transform: "scale(1.1)",
						transition: "all 0.2s ease",
					},
				}}
			>
				<MoreVertIcon />
			</IconButton>

			{/* Menu */}
			<Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
				<MenuItem onClick={handleClearChat}>Clear Chat</MenuItem>
				<MenuItem onClick={handleBlockToggle}>
					{isBlocked ? "Unblock User" : "Block User"}
				</MenuItem>
				<MenuItem onClick={handleDisappearClick}>Disappearing Messages</MenuItem>
			</Menu>

			{/* Modal */}
			<Dialog open={openModal} onClose={() => setOpenModal(false)}>
				<DialogTitle>Disappearing Messages</DialogTitle>
				<DialogContent>
					<Button fullWidth onClick={() => handleOptionSelect("off")}>Off</Button>
					<Button fullWidth onClick={() => handleOptionSelect("1min")}>1 min</Button>
					<Button fullWidth onClick={() => handleOptionSelect("24h")}>24 hrs</Button>
					<Button fullWidth onClick={() => handleOptionSelect("7d")}>7 days</Button>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenModal(false)}>Cancel</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}

// Helper to format option labels
function formatOptionLabel(option) {
	switch (option) {
		case "1min":
			return "1 min";
		case "24h":
			return "24 hrs";
		case "7d":
			return "7 days";
		default:
			return "Off";
	}
}