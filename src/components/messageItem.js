import { Box, Typography, useTheme } from "@mui/material";

export default function MessageItem({ msg, darkMode }) {
	const theme = useTheme();

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: msg.type === "sent" ? "flex-end" : "flex-start",
				mb: 1.5,
			}}
		>
			<Box
				sx={{
					bgcolor:
						msg.type === "sent"
							? darkMode
								? "linear-gradient(135deg, rgba(21,80,95,0.95), rgba(33,147,176,0.95))"
								: "#2193b0"
							: darkMode
							? "#1e293b"
							: "#e2e8f0",
					color:
						msg.type === "sent" ? "#fff" : darkMode ? "#e3f2fd" : "#1e293b",
					px: 2,
					py: 1.2,
					borderRadius: 2,
					maxWidth: "70%",
					wordBreak: "break-word",
					boxShadow:
						msg.type === "sent"
							? "0 2px 8px rgba(33,147,176,0.5)"
							: darkMode
							? "0 2px 6px rgba(0,0,0,0.4)"
							: "0 1px 4px rgba(0,0,0,0.1)",
					transition: "all 0.3s ease",
				}}
			>
				{/* Text */}
				{msg.text && (
					<Typography variant="body2" sx={{ lineHeight: 1.5 }}>
						{msg.text}
					</Typography>
				)}

				{/* Image */}
				{msg.image && (
					<Box sx={{ mt: 1 }}>
						<img
							src={msg.image}
							alt="uploaded"
							style={{
								maxWidth: "200px",
								maxHeight: "200px",
								borderRadius: "8px",
								boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
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
							color:
								msg.type === "sent" ? "#dcefff" : darkMode ? "#90b0d0" : "#555",
						}}
					>
						{new Date(msg.timestamp).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Typography>
				)}
			</Box>
		</Box>
	);
}
