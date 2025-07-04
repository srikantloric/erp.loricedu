import { Box, Button, FormControl, FormLabel, Input } from "@mui/joy";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { IconReport } from "@tabler/icons-react";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";
import { generateFacultyAttendanceReport } from "utilities/facultyReportGenerator";

export default function FacultyDailyAttendanceReport() {
    const [selectedDate, setSelectedDate] = useState("");

    const handleGenerateReport = async () => {
        if (!selectedDate) return;

        const db = await getFirestoreInstance();
        const attendanceQuery = query(
            collection(db, "FACULTY_ATTENDANCE"),
            where("date", "==", selectedDate)
        );

        try {
            const querySnapshot = await getDocs(attendanceQuery);
            const attendanceData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as any[];

            // Directly call the generator with attendance data only
            const doc = await generateFacultyAttendanceReport(attendanceData);
            if (doc) doc.save(`Faculty_Attendance_${selectedDate}.pdf`);
        } catch (error) {
            console.error("Error generating report:", error);
        }
    };

    return (
        <PageContainer>
            <Navbar />
            <LSPage>
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
                        disabled={!selectedDate}
                    >
                        Generate Report
                    </Button>
                </Box>
            </LSPage>
        </PageContainer>
    );
}
