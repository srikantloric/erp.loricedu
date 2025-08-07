
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";
import { generateFacultyAttendanceReport } from "utilities/GenerateFacultyAttendanceReport";
import { FacultyType, AttenzyAttendanceType } from "types/facuities";
import { enqueueSnackbar } from "notistack";
import { useSearchParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { Box } from "@mui/joy";

function TriggerFacultyDailyAttendanceReport() {
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)

    const [searchParams] = useSearchParams();
    const dateId = searchParams.get('date');



    const generateReport = async () => {
        if (!dateId) return;

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
                    where("date", "==", dateId)
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
                        attendanceDate: dateId,
                        isSmartAttendance: false,
                        comment: "N/A",
                        createdAt: new Date()
                    });
                }
            }

            // Generate the report with selected date
            const pdfResult = await generateFacultyAttendanceReport(attendanceData, dateId);
            if (pdfResult) {
                setPdfUrl(pdfResult);
                enqueueSnackbar("PDF generated successfully", { variant: "success" });
            }
        } catch (error) {
            console.error("Error generating report:", error);
            enqueueSnackbar("Error generating report", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateReport();
    }, [])
    if (!dateId) {
        return <p>Invalid Url</p>
    }
    return (
        <>
            {pdfUrl && (
                <>
                    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {loading &&
                            <>
                                Generating Report
                                <CircularProgress />
                            </>}
                        <iframe
                            src={pdfUrl}
                            title="PDF Viewer"
                            width="100%"
                            height="100%"
                            frameBorder={0}
                        />
                    </Box>
                </>
            )
            }
        </>
    )
}

export default TriggerFacultyDailyAttendanceReport