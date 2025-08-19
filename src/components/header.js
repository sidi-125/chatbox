import {
	AppBar,
	Toolbar,
	Typography,
	Box,
	Avatar,
	IconButton,
	useTheme,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function Header({ username, darkMode, setDarkMode }) {
	const theme = useTheme();

	return (
		<AppBar
			position="fixed"
			elevation={0}
			sx={{
				zIndex: 1300,
				background: darkMode
					? "linear-gradient(135deg, rgba(21, 80, 95, 0.95), rgba(2, 48, 58, 0.95))"
					: "linear-gradient(135deg, #6dd5ed, #2193b0)",

				boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
				backdropFilter: "blur(6px)",
			}}
		>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				{/* Left side - App Title */}
				<Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1.5 }}>
					💬 Chat App
				</Typography>

				{/* Center - User info */}
				<Box sx={{ textAlign: "center" }}>
					<Typography variant="subtitle1" fontWeight="600">
						{username}
					</Typography>
					<Typography variant="caption" sx={{ opacity: 0.8 }}>
						Online
					</Typography>
				</Box>

				{/* Right side - Theme Toggle */}
				<IconButton
					onClick={() => setDarkMode(!darkMode)}
					sx={{
						color: "white",
						"&:hover": {
							backgroundColor: "rgba(255,255,255,0.2)",
						},
					}}
				>
					{darkMode ? <DarkModeIcon /> : <LightModeIcon />}
				</IconButton>
			</Toolbar>
		</AppBar>
	);
}
