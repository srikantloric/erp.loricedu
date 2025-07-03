import { Refresh } from "@mui/icons-material"
import { Box, Divider, IconButton, Stack, Typography } from "@mui/joy"
import NewAttendanceCalendar from "components/Calendar/NewAttendanceCalander"
import FacultyAttendanceCard from "components/Card/FacultyAttendanceCard"
import { useFirebase } from "context/firebaseContext";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { StudentDetailsType } from "types/student";


interface AttendanceTabProps {
    studentData: StudentDetailsType;
}
const AttendanceTab: React.FC<AttendanceTabProps> = ({ studentData }) => {

    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const { db } = useFirebase();

    useEffect(() => {
        if (!studentData.id) return; // Ensure 'id' is available
        const fetchAttendance = async () => {
            try {
                const attendanceRef = query(
                    collection(db, "STUDENTS", studentData.id, "MY_ATTENDANCE"),
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
    }, [studentData])


    return (
        <Stack direction="row" spacing={2} flex={1} sx={{ mb: 2 }} justifyContent={"space-between"}>
            <Box sx={{ flex: 0.6 }}>
                <NewAttendanceCalendar attendanceData={attendanceRecords} />
            </Box>
            <Divider orientation="vertical"></Divider>
            <Stack sx={{ flex: 0.4 }}>
                <Stack justifyContent={"space-between"} direction={"row"}>
                    <Typography level="title-lg" fontSize={24}>Attendance Logs</Typography>
                    <IconButton variant="solid" color="primary"><Refresh /></IconButton>
                </Stack>
                <Divider sx={{ mt: 1, mb: 1 }} />
                <Box sx={{ height: "550px", overflowY: "auto", p: 2, backgroundColor: "#fff" }}>
                    {attendanceRecords && attendanceRecords.map((record) => (
                        <>
                            <FacultyAttendanceCard key={record.id} checkIn={record.checkIn} checkOut={record.checkOut} date={record.date} />
                        </>
                    ))}
                    {attendanceRecords.length === 0 && (
                        <Typography level="body-md" sx={{ textAlign: "center", mt: 2 }}>
                            No attendance records found.
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Stack>
    )
}

export default AttendanceTab