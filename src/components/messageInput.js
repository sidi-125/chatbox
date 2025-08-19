import { Box, TextField, Button } from "@mui/material";

export default function MessageInput({
	input,
	setInput,
	handleSend,
	handleFileUpload,
	receiver,
	darkMode, // add darkMode prop
}) {
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
			/>

			<input
				type="file"
				accept="image/*"
				style={{ display: "none" }}
				id="upload-image"
				onChange={handleFileUpload}
			/>
			<label htmlFor="upload-image">
				<Button
					variant="outlined"
					component="span"
					sx={{
						color: darkMode ? "#e3f2fd" : "#1e293b",
						borderColor: darkMode ? "#90caf9" : "#2193b0",
						"&:hover": {
							borderColor: darkMode ? "#64b5f6" : "#2193b0",
							backgroundColor: darkMode
								? "rgba(141976d24,202,249,0.1)"
								: "rgba(25,118,210,0.1)",
						},
					}}
				>
					Upload
				</Button>
			</label>

			<Button
				variant="contained"
				onClick={handleSend}
				sx={{
					bgcolor: "#2193b0", // same color for dark/light
					color: "#fff",
					"&:hover": {
						bgcolor: darkMode ? "rgba(21, 80, 95, 0.95)" : "#1976d2",
					},
				}}
			>
				Send
			</Button>
		</Box>
	);
}
