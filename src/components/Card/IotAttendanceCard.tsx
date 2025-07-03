import { Box, Divider, Stack, Typography } from "@mui/joy"
import { Avatar, Paper } from "@mui/material"
import { Timestamp } from "firebase/firestore";

type IotAttendanceCardProps = {
    date: string;
    id: string;
    name: string;
    profileImage: string;
    phone: string;
    timestamp: Timestamp;
    action: string,
};

function IotAttendanceCard(props: IotAttendanceCardProps) {
    return (
        <Stack>
            <Paper
                sx={{
                    pt: 1,
                    pb: 1,
                    pl: 2,
                    pr: 2,
                    borderRadius: 2,
                    background: "linear-gradient(90deg, #e3f2fd 0%, #fce4ec 100%)",
                    minWidth: 400,
                    display: "flex",
                    alignItems: "center",
                    mb: 2,

                }}
                elevation={0}
            >
                <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={4} alignItems="center" justifyContent={"space-between"}>
                        <Box>
                            <Stack direction={"row"} spacing={2} alignItems="center">
                                <Avatar src={props.profileImage}></Avatar>
                                <Stack direction="column">
                                    <Typography level="title-lg">{props.name}</Typography>
                                    <Typography>{props.phone}</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                        <Box>
                            <Box sx={{ fontWeight: 500, color: "#1976d2" }}>Date</Box>
                            <Box sx={{ fontSize: 15 }}>
                                {props.date || "N/A"}
                            </Box>
                        </Box>
                        <Box>
                            <Box sx={{ fontWeight: 500, color: "#d32f2f" }}>Timestamp</Box>
                            <Box sx={{ fontSize: 15 }}>
                                {props.timestamp ? props.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </Box>
                        </Box>
                        <Box>
                            <Box sx={{ fontWeight: 500, color: "#6d4c41" }}>Action</Box>
                            <Box
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color:
                                        "#388e3c"

                                }}
                            >
                                {props.action || "N/A"}
                            </Box>
                        </Box>

                    </Stack>
                </Box>
            </Paper>
            <Divider sx={{ mb: 2 }} />
        </Stack>
    )
}

export default IotAttendanceCard