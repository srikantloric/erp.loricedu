import { Box, Button, FormControl, FormLabel, Select, Option } from "@mui/joy";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { IconReport } from "@tabler/icons-react";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";
import { generateMonthlyFacultyAttendanceReport } from "utilities/facultyReportGenerator";
import { FacultyType, AttenzyAttendanceType } from "types/facuities";
import { enqueueSnackbar } from "notistack";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

export default function FacultyMonthlyAttendanceReport() {
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        if (!selectedMonth || !selectedYear) return;

        setLoading(true);
        const db = await getFirestoreInstance();

        // Calculate date range for the selected month
        const monthIndex = months.indexOf(selectedMonth);
        const startDate = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
        const endDate = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-31`;

        try {
            // First, fetch all faculty members
            const facultyQuery = query(
                collection(db, "STUDENTS"),
                where("isFaculty", "==", true),
                where("isActive", "==", true)
            );

            const facultySnapshot = await getDocs(facultyQuery);
            const facultyMembers: FacultyType[] = facultySnapshot.docs.map((doc) => ({
                ...doc.data(),
                facultyId: doc.id,
            })) as FacultyType[];

            // Fetch attendance data for each faculty member for the entire month
            const attendanceData: { [date: string]: any[] } = {};

            for (const faculty of facultyMembers) {
                const attendanceQuery = query(
                    collection(db, "STUDENTS", faculty.facultyId, "MY_ATTENDANCE"),
                    where("date", ">=", startDate),
                    where("date", "<=", endDate)
                );

                const attendanceSnapshot = await getDocs(attendanceQuery);

                attendanceSnapshot.docs.forEach(doc => {
                    const attendanceRecord = doc.data() as AttenzyAttendanceType;
                    const date = attendanceRecord.date;

                    if (!attendanceData[date]) {
                        attendanceData[date] = [];
                    }

                    attendanceData[date].push({
                        id: faculty.facultyId,
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
            }

            // Generate dates for the month to show all days
            const daysInMonth = new Date(parseInt(selectedYear), monthIndex + 1, 0).getDate();
            const allDates: string[] = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const date = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                allDates.push(date);

                // If no attendance data exists for this date, initialize empty array
                if (!attendanceData[date]) {
                    attendanceData[date] = [];
                }
            }

            // Generate the report with month name and year
            const pdfResult = await generateMonthlyFacultyAttendanceReport(attendanceData, selectedMonth, selectedYear);
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
        <PageContainer>
            <Navbar />
            <LSPage>
                <BreadCrumbsV2 Icon={IconReport} Path="Faculty Monthly Attendance Report" />
                <Box sx={{ maxWidth: 400, mt: 4 }}>
                    <FormControl>
                        <FormLabel>Select Month</FormLabel>
                        <Select
                            value={selectedMonth}
                            onChange={(_, value) => setSelectedMonth(value as string)}
                            sx={{ mb: 2 }}
                        >
                            {months.map((month) => (
                                <Option key={month} value={month}>
                                    {month}
                                </Option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Select Year</FormLabel>
                        <Select
                            value={selectedYear}
                            onChange={(_, value) => setSelectedYear(value as string)}
                        >
                            {years.map((year) => (
                                <Option key={year} value={year}>
                                    {year}
                                </Option>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        sx={{ mt: 2 }}
                        onClick={handleGenerateReport}
                        disabled={!selectedMonth || !selectedYear || loading}
                        loading={loading}
                    >
                        {loading ? "Generating..." : "Generate Report"}
                    </Button>
                </Box>
            </LSPage>
        </PageContainer>
    );
}