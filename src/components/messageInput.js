import { Box, TextField, Button } from "@mui/material";

export default function MessageInput({
	input,
	setInput,
	handleSend,
	handleFileUpload,
	receiver,
	darkMode,
	isBlocked, // <-- add this prop
}) {
	if (isBlocked) {
		return (
			<Box sx={{ p: 2, textAlign: "center", color: darkMode ? "#f28b82" : "#d32f2f" }}>
				⚠️ You have blocked {receiver}, unblock to send text.
			</Box>
		);
	}

	return (
		<Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
			<TextField
				fullWidth
				size="small"
				placeholder={`Message to ${receiver}`}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && handleSend()}
				sx={{
					bgcolor: darkMode ? "#1a2533" : "#fff",
					input: { color: darkMode ? "#e3f2fd" : "#1e293b" },
					borderRadius: 1,
				}}
				disabled={isBlocked} // disable input just in case
			/>

			<input
				type="file"
				accept="image/*"
				style={{ display: "none" }}
				id="upload-image"
				onChange={handleFileUpload}
				disabled={isBlocked} // disable upload
			/>
			<label htmlFor="upload-image">
				<Button
					variant="outlined"
					component="span"
					disabled={isBlocked} // disable button
					sx={{
						color: darkMode ? "#e3f2fd" : "#1e293b",
						borderColor: darkMode ? "#90caf9" : "#2193b0",
						"&:hover": { borderColor: darkMode ? "#64b5f6" : "#2193b0" },
					}}
				>
					Upload
				</Button>
			</label>

			<Button
				variant="contained"
				onClick={handleSend}
				disabled={isBlocked} // disable send
				sx={{
					bgcolor: "#2193b0",
					color: "#fff",
					"&:hover": { bgcolor: darkMode ? "rgba(21, 80, 95, 0.95)" : "#1976d2" },
				}}
			>
				Send
			</Button>
		</Box>
	);
}
