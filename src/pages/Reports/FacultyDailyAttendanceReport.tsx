import { Box, Button, FormControl, FormLabel, Input } from "@mui/joy";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";

import { IconReport } from "@tabler/icons-react";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";
import { generateFacultyAttendanceReport } from "utilities/GenerateFacultyAttendanceReport";
import { FacultyType, AttenzyAttendanceType } from "types/facuities";
import { enqueueSnackbar } from "notistack";

export default function FacultyDailyAttendanceReport() {
    const [selectedDate, setSelectedDate] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        if (!selectedDate) return;

        console.log("selected date", selectedDate)

        setLoading(true);
        const db = await getFirestoreInstance();

        try {
            // First, fetch all faculty members
            const facultyQuery = query(
                collection(db, "STUDENTS"),
                where("isFaculty", "==", true),
                where("isActive", "==", true)
            );

            const facultySnapshot = await getDocs(facultyQuery);
            const facultyMembers: FacultyType[] = facultySnapshot.docs.map((doc: any) => ({
                ...doc.data(),
                id: doc.id,
            })) as FacultyType[];

            // Now fetch attendance data for each faculty member
            const attendanceData: any[] = [];

            for (const faculty of facultyMembers) {
                const attendanceQuery = query(
                    collection(db, "STUDENTS", faculty.id!, "MY_ATTENDANCE"),
                    where("date", "==", selectedDate)
                );

                const attendanceSnapshot = await getDocs(attendanceQuery);

                if (attendanceSnapshot.docs.length > 0) {
                    attendanceSnapshot.docs.forEach(doc => {
                        const attendanceRecord = doc.data() as AttenzyAttendanceType;
                        attendanceData.push({
                            id: attendanceRecord.id,
                            facultyName: attendanceRecord.name,
                            facultyPhone: attendanceRecord.phone,
                            facultyImage: attendanceRecord.profileImage,
                            attendanceStatus: attendanceRecord.status,
                            attendanceDate: attendanceRecord.date,
                            checkIn: attendanceRecord.checkIn,
                            checkOut: attendanceRecord.checkOut,
                            isSmartAttendance: true,
                            comment: `Check-in: ${attendanceRecord.checkIn ? attendanceRecord.checkIn.toDate().toLocaleTimeString() : 'N/A'}, Check-out: ${attendanceRecord.checkOut ? attendanceRecord.checkOut.toDate().toLocaleTimeString() : 'N/A'}`,
                            createdAt: attendanceRecord.timestamp
                        });
                    });
                } else {
                    // Faculty has no attendance record for this date - mark as absent
                    attendanceData.push({
                        id: faculty.facultyId,
                        facultyName: faculty.facultyName,
                        facultyPhone: faculty.facultyPhone,
                        facultyImage: faculty.facultyImage,
                        attendanceStatus: "Absent",
                        attendanceDate: selectedDate,
                        isSmartAttendance: false,
                        comment: "N/A",
                        createdAt: new Date()
                    });
                }
            }

            // Generate the report with selected date
            const pdfResult = await generateFacultyAttendanceReport(attendanceData, selectedDate);
            if (pdfResult) {
                window.open(pdfResult as string, "_blank");
                enqueueSnackbar("PDF generated successfully", { variant: "success" });
            }
        } catch (error) {
            console.error("Error generating report:", error);
            enqueueSnackbar("Error generating report", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BreadCrumbsV2 Icon={IconReport} Path="Faculty Daily Attendance Report" />
            <Box sx={{ maxWidth: 400, mt: 4 }}>
                <FormControl>
                    <FormLabel>Select Date</FormLabel>
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        slotProps={{
                            input: {
                                min: "2020-01-01",
                            }
                        }}
                    />
                </FormControl>
                <Button
                    sx={{ mt: 2 }}
                    onClick={handleGenerateReport}
                    disabled={!selectedDate || loading}
                    loading={loading}
                >
                    {loading ? "Generating..." : "Generate Report"}
                </Button>
            </Box>
        </>
    );
}