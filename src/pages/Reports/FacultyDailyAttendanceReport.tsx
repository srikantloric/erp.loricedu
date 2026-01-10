import { Box, Button, FormControl, FormLabel, Input } from "@mui/joy";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";

import { IconReport } from "@tabler/icons-react";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";
import { generateFacultyAttendanceReport } from "utilities/GenerateFacultyAttendanceReport";
import { FacultyType } from "types/facuities";
import { enqueueSnackbar } from "notistack";
function getTodayIST() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}
export default function FacultyDailyAttendanceReport() {
    const [selectedDate, setSelectedDate] = useState(getTodayIST());
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        if (!selectedDate) return;

        setLoading(true);
        const db = await getFirestoreInstance();

        try {
            // ---------------------------------
            // 1. Load all active faculty
            // ---------------------------------
            const facultySnap = await getDocs(
                query(
                    collection(db, "STUDENTS"),
                    where("isFaculty", "==", true),
                    where("isActive", "==", true)
                )
            );

            const faculties = facultySnap.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as any),
            })) as FacultyType[];

            if (faculties.length === 0) {
                enqueueSnackbar("No faculty found", { variant: "warning" });
                return;
            }

            // ---------------------------------
            // 2. Load DAILY FACULTY attendance
            // ---------------------------------
            const dailySnap = await getDocs(
                collection(db, "ATTENDANCE_DAILY", selectedDate, "FACULTY")
            );

            const attendanceMap = new Map<string, any>();
            dailySnap.forEach((doc) => {
                attendanceMap.set(doc.id, doc.data());
            });

            // ---------------------------------
            // 3. Merge faculty + daily attendance
            // ---------------------------------
            const attendanceData = faculties.map((fac) => {
                const att = attendanceMap.get(fac.id!);

                if (att) {
                    return {
                        id: fac.id || "",
                        facultyName: fac.facultyName,
                        facultyPhone: Number(fac.facultyPhone || 0),
                        facultyImage: fac.facultyImage,
                        attendanceStatus: att.status,
                        attendanceDate: selectedDate,
                        isSmartAttendance: att.present === true,
                        comment: `In: ${att.firstIn ? att.firstIn.toDate().toLocaleTimeString() : "N/A"
                            }, Out: ${att.lastOut ? att.lastOut.toDate().toLocaleTimeString() : "N/A"
                            }`,
                        createdAt: att.firstIn || new Date(),
                    };
                }

                // No record = ABSENT
                return {
                    id: fac.id || "",
                    facultyName: fac.facultyName,
                    facultyPhone: Number(fac.facultyPhone || 0),
                    facultyImage: fac.facultyImage,
                    attendanceStatus: "ABSENT",
                    attendanceDate: selectedDate,
                    isSmartAttendance: false,
                    comment: "No attendance recorded",
                    createdAt: new Date(),
                };
            });

            // ---------------------------------
            // 4. Generate PDF
            // ---------------------------------
            const pdfResult = await generateFacultyAttendanceReport(
                attendanceData,
                selectedDate
            );

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