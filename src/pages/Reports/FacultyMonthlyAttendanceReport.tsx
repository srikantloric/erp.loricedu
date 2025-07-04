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

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const years = Array.from({ length: 6 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

export default function FacultyMonthlyAttendanceReport() {
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const handleGenerateReport = async () => {
        if (!selectedMonth || !selectedYear) return;

        const db = await getFirestoreInstance();
        const startDate = `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-01`;
        const endDate = `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-31`;

        try {
            const attendanceQuery = query(
                collection(db, "FACULTY_ATTENDANCE"),
                where("date", ">=", startDate),
                where("date", "<=", endDate)
            );

            const querySnapshot = await getDocs(attendanceQuery);
            const attendanceData: { [date: string]: any[] } = {};

            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (!attendanceData[data.date]) {
                    attendanceData[data.date] = [];
                }
                attendanceData[data.date].push({
                    ...data,
                    id: doc.id
                });
            });

            // Directly call the generator with attendance data only
            const doc = await generateMonthlyFacultyAttendanceReport(attendanceData);
            if (doc) doc.save(`Faculty_Monthly_Attendance_${selectedMonth}_${selectedYear}.pdf`);
        } catch (error) {
            console.error("Error generating report:", error);
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
                        disabled={!selectedMonth || !selectedYear}
                    >
                        Generate Report
                    </Button>
                </Box>
            </LSPage>
        </PageContainer>
    );
}
