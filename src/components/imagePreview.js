import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ImagePreview({ image, setImage }) {
	if (!image) return null;

	return (
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
	);
}
