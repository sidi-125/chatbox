import { useState } from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function Sidebar({
	users = [],
	receiver,
	setReceiver,
	drawerWidth,
	headerHeight,
	darkMode,
}) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<Box
			sx={{
				width: collapsed ? "48px" : drawerWidth,
				mt: `${headerHeight}px`,
				p: 2,
				height: `calc(100vh - ${headerHeight}px)`,
				overflowY: "auto",
				zIndex: 1200,
				background: darkMode
					? "linear-gradient(to bottom, rgba(21, 80, 95, 0.95), rgba(2, 48, 58, 0.95))"
					: "linear-gradient(to bottom, #6dd5ed, #2193b0)",
				color: darkMode ? "#f5f5f5" : "#fff",
				boxShadow: darkMode
					? "inset 0 0 10px rgba(0,0,0,0.4)"
					: "0 4px 12px rgba(0,0,0,0.08)",
				backdropFilter: "blur(6px)",
				borderRight: darkMode
					? "1px solid rgba(255,255,255,0.08)"
					: "1px solid rgba(0,0,0,0.08)",
				transition: "all 0.3s ease",
				position: "relative",
			}}
		>
			{/* Collapse / Expand Button */}
			<IconButton
				onClick={() => setCollapsed(!collapsed)}
				sx={{
					position: "absolute",
					top: 8,
					right: 8,
					color: darkMode ? "#90caf9" : "#1e293b",
					transform: collapsed ? "rotate(180deg)" : "none",
					transition: "transform 0.3s ease",
				}}
			>
				{collapsed ? <MenuIcon /> : <CloseIcon />}
			</IconButton>

			{/* Only show content if not collapsed */}
			{!collapsed && (
				<>
					<Typography
						variant="subtitle2"
						sx={{
							mb: 2,
							fontWeight: 700,
							color: darkMode ? "#90caf9" : "#1e293b",
							textAlign: "center",
							letterSpacing: 1,
							textTransform: "uppercase",
						}}
					>
						Online Users
					</Typography>

					{users
						.filter((user) => {
							const username = typeof user === "string" ? user : user?.name;
							return username && username == receiver; // hide self
						})
						.map((user, index) => {
							const username =
								typeof user === "string" ? user : user?.name || "Unknown";
							const isActive = receiver === username;

							return (
								<Box
									key={user?.id || username || index}
									onClick={() => setReceiver(username)}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1.2,
										p: 1,
										borderRadius: 2,
										mb: 1,
										cursor: "pointer",
										transition: "all 0.25s ease",
										bgcolor: isActive
											? darkMode
												? "rgba(144,202,249,0.2)"
												: "rgba(33,147,176,0.15)"
											: "transparent",
										"&:hover": {
											bgcolor: darkMode
												? "rgba(255,255,255,0.08)"
												: "rgba(255,255,255,0.4)",
											transform: "translateX(4px)",
										},
									}}
								>
									<Avatar
										sx={{
											width: 36,
											height: 36,
											bgcolor: isActive
												? "#2193b0"
												: darkMode
												? "#0d3b4c"
												: "#e2e8f0",
											fontSize: "0.9rem",
											color: isActive
												? "#fff"
												: darkMode
												? "#90b0d0ff"
												: "#1e293b",
										}}
									>
										{username.charAt(0).toUpperCase()}
									</Avatar>
									<Typography
										sx={{
											fontWeight: isActive ? 600 : 400,
											fontSize: "0.95rem",
											letterSpacing: 0.3,
											color: darkMode ? "#e3f2fd" : "#1e293b",
										}}
									>
										{username}
									</Typography>
								</Box>
							);
						})}
				</>
			)}
		</Box>
	);
}
