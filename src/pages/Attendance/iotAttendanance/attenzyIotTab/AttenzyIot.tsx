import { Refresh, Search } from "@mui/icons-material"
import { Box, Divider, IconButton, Input, Stack } from "@mui/joy"
import { Typography } from "@mui/joy"
import FacultyAttendanceCard from "components/Card/FacultyAttendanceCard"
import { useFirebase } from "context/firebaseContext"
import { collectionGroup, getDocs, orderBy, query } from "firebase/firestore"
import { enqueueSnackbar } from "notistack"
import { useEffect, useState } from "react"

function AttenzyIot() {

    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([

    ]);

    const { db } = useFirebase()

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const attendanceRef = query(
                    collectionGroup(db, "MY_ATTENDANCE"),
                    orderBy("timestamp", "desc")
                );
                const attendanceSnap = await getDocs(attendanceRef);
                const attendanceData = attendanceSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAttendanceRecords(attendanceData);
            } catch (error) {
                enqueueSnackbar("Failed to fetch attendance data!", { variant: "error" });
                console.error("Error fetching attendance:", error);
            }
        };

        fetchAttendance();


    }, [])


    return (
        <>
            <Stack
                direction={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                gap={4}
            >
                <Input
                    startDecorator={<Search />}
                    placeholder="Search by student id, admission no, father's name or rfid code"
                    sx={{ width: "80%" }}
                />
                <Stack>
                    <Typography level="body-lg" >
                        Total ID card punch today: 0
                    </Typography>
                </Stack>
            </Stack>
            <Stack direction="row" spacing={2} flex={1} sx={{ mb: 2, mt: 3 }} justifyContent={"space-between"}>
                <Stack sx={{ flex: 0.8 }}>
                    <Stack justifyContent={"space-between"} direction={"row"}>
                        <Typography level="title-lg" fontSize={20}>Attendance Logs</Typography>
                        <IconButton variant="solid" color="primary"><Refresh /></IconButton>
                    </Stack>
                    <Divider sx={{ mt: 1, mb: 1 }} />
                    <Box sx={{ height: "550px", overflowY: "auto", p: 2, backgroundColor: "#fff" }}>
                        {attendanceRecords && attendanceRecords.map((record) => (
                            <>
                                <FacultyAttendanceCard key={record.id} checkIn={record.checkIn} checkOut={record.checkOut} date={record.date} />
                            </>
                        ))}
                    </Box>
                </Stack>
                <Divider orientation="vertical"></Divider>
                <Box sx={{ flex: 0.2 }}>
                    Right Pannel
                </Box>

            </Stack>
        </>

    )
}

export default AttenzyIot