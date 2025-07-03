import { Box, Divider, Stack } from "@mui/joy"
import { Paper } from "@mui/material"
import { Timestamp } from "firebase/firestore";

type FacultyAttendanceCardProps = {
    date: string;
    checkIn: Timestamp;
    checkOut: Timestamp;
};
function FacultyAttendanceCard(props: FacultyAttendanceCardProps) {
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
                            <Box sx={{ fontWeight: 500, color: "#1976d2" }}>Date</Box>
                            <Box sx={{ fontSize: 15 }}>
                                {props.date || "N/A"}
                            </Box>
                        </Box>
                        <Box>
                            <Box sx={{ fontWeight: 500, color: "#388e3c" }}>Check-In</Box>
                            <Box sx={{ fontSize: 15 }}>
                                {props.checkIn ? props.checkIn.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </Box>
                        </Box>
                        <Box>
                            <Box sx={{ fontWeight: 500, color: "#d32f2f" }}>Check-Out</Box>
                            <Box sx={{ fontSize: 15 }}>
                                {props.checkOut ? props.checkOut.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </Box>
                        </Box>
                        <Box>
                            <Box sx={{ fontWeight: 500, color: "#6d4c41" }}>Status</Box>
                            <Box
                                sx={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color:
                                        "#388e3c"

                                }}
                            >
                                {"Present"}
                            </Box>
                        </Box>

                    </Stack>
                </Box>
            </Paper>
            <Divider sx={{ mb: 2 }} />
        </Stack>
    )
}

export default FacultyAttendanceCard