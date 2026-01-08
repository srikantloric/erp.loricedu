import { Refresh, Search } from "@mui/icons-material";
import {
    Box,
    Divider,
    IconButton,
    Input,
    Stack,
    Tooltip,
    Typography,
} from "@mui/joy";
import { collection, getDocs, limit, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import IotAttendanceCard from "components/Card/IotAttendanceCard";
import { useFirebase } from "context/firebaseContext";

/* ---------------------------------------------
   TYPES
--------------------------------------------- */

export type IotAttendanceRecord = {
    id: string;
    userId: string;
    userType: "STUDENT" | "FACULTY";
    name: string;
    phone?: string;
    profileImage?: string;
    date: string;
    timestamp: Timestamp;
    action: string;
};

/* ---------------------------------------------
   HELPERS
--------------------------------------------- */

// Firestore IN() supports max 10 ids
async function fetchUsersByIds(db: any, ids: string[]) {
    const result: Record<string, any> = {};
    const chunks: string[][] = [];

    while (ids.length) chunks.push(ids.splice(0, 10));

    for (const chunk of chunks) {
        const snap = await getDocs(
            query(
                collection(db, "STUDENTS"),
                where("__name__", "in", chunk)
            )
        );

        snap.docs.forEach((doc) => {
            result[doc.id] = doc.data();
        });
    }

    return result;
}

/* ---------------------------------------------
   COMPONENT
--------------------------------------------- */

function AttenzyIot() {
    const { db } = useFirebase();

    const [attendanceRecords, setAttendanceRecords] = useState<IotAttendanceRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshCounter, setRefreshCounter] = useState(0);

    const handleRefresh = () => setRefreshCounter((p) => p + 1);

    /* ---------------------------------------------
       REALTIME ATTENDANCE EVENTS
    --------------------------------------------- */

    useEffect(() => {
        const attendanceRef = query(
            collection(db, "ATTENDANCE_EVENTS"),
            orderBy("timestamp", "desc"),
            limit(300)
        );

        const unsubscribe = onSnapshot(
            attendanceRef,
            async (snap) => {
                const events = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as any[];

                if (!events.length) {
                    setAttendanceRecords([]);
                    return;
                }

                // Collect unique userIds
                const userIds = Array.from(
                    new Set(
                        events
                            .map((e) => e.userId)
                            .filter((id): id is string => typeof id === "string" && id.length > 0)
                    )
                );

                // Fetch user details
                const usersMap = await fetchUsersByIds(db, [...userIds]);

                // Build UI records
                const records: IotAttendanceRecord[] = events.map((event) => {
                    const user = usersMap[event.userId] || {};

                    const isFaculty = event.userType === "FACULTY";

                    return {
                        id: event.id,
                        userId: event.userId,
                        userType: event.userType,
                        name: isFaculty
                            ? user.facultyName || "Unknown Faculty"
                            : user.student_name || "Unknown Student",
                        phone: isFaculty
                            ? user.facultyPhone
                            : user.contact_number,
                        profileImage: isFaculty
                            ? user.facultyImage
                            : user.profil_url,
                        date: event.date,
                        timestamp: event.timestamp,
                        action: event.status,
                    };
                });
                setAttendanceRecords(records);
            },
            (error) => {
                console.error(error);
                enqueueSnackbar("Failed to fetch attendance data!", {
                    variant: "error",
                });
            }
        );

        return () => unsubscribe();
    }, [db, refreshCounter]);

    /* ---------------------------------------------
       SEARCH FILTER
    --------------------------------------------- */

    const filteredRecords = attendanceRecords.filter((record) => {
        const q = searchQuery.toLowerCase();
        return `${record.userId} ${record.name} ${record.phone || ""}`
            .toLowerCase()
            .includes(q);
    });
    function getISTDateString(): string {
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        // en-CA gives YYYY-MM-DD format
        return formatter.format(new Date());
    }

    const today = getISTDateString()
    console.log(today)

    const totalToday = filteredRecords.filter(
        (r) => r.date === today
    ).length;

    /* ---------------------------------------------
       UI
    --------------------------------------------- */

    return (
        <>
            <Stack direction="row" gap={2} alignItems="center">
                <Input
                    startDecorator={<Search />}
                    placeholder="Search by user id, name or phone"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1 }}
                />
                <Tooltip title="Refresh">
                    <IconButton variant="solid" color="primary" onClick={handleRefresh}>
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                {/* LEFT: LOGS */}
                <Stack sx={{ flex: 0.8 }}>
                    <Typography level="title-lg" fontSize={20}>
                        Attendance Logs
                    </Typography>
                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ height: 550, overflowY: "auto", p: 2, bgcolor: "#fff" }}>
                        {filteredRecords.map((record) => (
                            <IotAttendanceCard
                                key={record.id}
                                id={record.id}
                                phone={record.phone || ""}
                                name={record.name}
                                profileImage={record.profileImage || ""}
                                date={record.date}
                                timestamp={record.timestamp}
                                action={record.action}
                            />
                        ))}
                    </Box>
                </Stack>

                <Divider orientation="vertical" />

                {/* RIGHT: SUMMARY */}
                <Box sx={{ flex: 0.2 }}>
                    <Box
                        sx={{
                            height: 550,
                            p: 2,
                            bgcolor: "#fff",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            textAlign: "center",
                        }}
                    >
                        <Typography level="title-lg" fontSize={20}>
                            Attendance Summary
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Typography level="body-lg">
                            Total punches today: <b>{totalToday}</b>
                        </Typography>

                        <Typography level="body-lg" sx={{ mt: 1 }}>
                            Today: {new Date().toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>
            </Stack>
        </>
    );
}

export default AttenzyIot;
