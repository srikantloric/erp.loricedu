import { Refresh, Search } from "@mui/icons-material"
import { Box, Divider, IconButton, Input, Stack, Tooltip, Typography } from "@mui/joy"
import IotAttendanceCard from "components/Card/IotAttendanceCard"
import { useFirebase } from "context/firebaseContext"
import { collectionGroup, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore"
import { enqueueSnackbar } from "notistack"
import { useEffect, useState } from "react"

export type IotAttendanceRecord = {
    date: string;
    studentId: string;
    id: string;
    name: string;
    profileImage: string;
    phone: string;
    timestamp: Timestamp;
    action: string;
    checkIn?: Timestamp;
    checkOut?: Timestamp;
}

function AttenzyIot() {
    const [attendanceRecords, setAttendanceRecords] = useState<IotAttendanceRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshCounter, setRefreshCounter] = useState(0);

    const { db } = useFirebase();

    const handleRefresh = () => {
        setRefreshCounter(prev => prev + 1);
    }

    useEffect(() => {
        const attendanceRef = query(
            collectionGroup(db, "MY_ATTENDANCE"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(
            attendanceRef,
            (attendanceSnap: any) => {
                const rawData = attendanceSnap.docs.map((doc: any) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const splitRecords = rawData.flatMap((record: any) => {
                    const result: IotAttendanceRecord[] = [];

                    if (record.checkIn) {
                        result.push({
                            ...record,
                            action: "Check In",
                            timestamp: record.checkIn,
                        });
                    }

                    if (record.checkOut) {
                        result.push({
                            ...record,
                            action: "Check Out",
                            timestamp: record.checkOut,
                        });
                    }

                    return result;
                });

                // Sort by timestamp (latest first)
                splitRecords.sort((a:any, b:any) => b.timestamp.seconds - a.timestamp.seconds);

                setAttendanceRecords(splitRecords);
            },
            (error: any) => {
                enqueueSnackbar("Failed to fetch attendance data!", { variant: "error" });
                console.error("Error fetching attendance:", error);
            }
        );

        return () => unsubscribe();
    }, [db, refreshCounter]);

    const filteredRecords = attendanceRecords.filter(record => {
        const query = searchQuery.toLowerCase();
        return `${record.studentId} ${record.name} ${record.phone}`.toLowerCase().includes(query);
    });

    return (
        <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                <Input
                    startDecorator={<Search />}
                    placeholder="Search by student id, admission no, father's name or rfid code"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ display: "flex", flex: 1 }}
                />
                <Tooltip title="Refresh">
                    <IconButton variant="solid" color="primary" onClick={handleRefresh}>
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Stack direction="row" spacing={2} flex={1} sx={{ mb: 2, mt: 3 }} justifyContent="space-between">
                <Stack sx={{ flex: 0.8 }}>
                    <Stack justifyContent="space-between" direction="row">
                        <Typography level="title-lg" fontSize={20}>Attendance Logs</Typography>
                    </Stack>
                    <Divider sx={{ mt: 1, mb: 1 }} />
                    <Box sx={{ height: "550px", overflowY: "auto", p: 2, backgroundColor: "#fff" }}>
                        {filteredRecords.map((record) => (
                            <IotAttendanceCard
                                key={`${record.id}-${record.action}-${record.timestamp.seconds}`}
                                id={record.id}
                                phone={record.phone}
                                name={record.name}
                                profileImage={record.profileImage}
                                date={record.date}
                                timestamp={record.timestamp}
                                action={record.action}
                            />
                        ))}
                    </Box>
                </Stack>

                <Divider orientation="vertical" />

                <Box sx={{ flex: 0.2 }}>
                    <Box
                        sx={{
                            height: "550px",
                            overflowY: "auto",
                            p: 2,
                            backgroundColor: "#fff",
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                background: "#f5f7fa",
                                borderRadius: 2,
                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                p: 2,
                                mb: 2,
                                textAlign: "center",
                            }}
                        >
                            <Typography level="title-lg" fontSize={20} sx={{ mb: 1 }}>
                                Attendance Summary
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ mb: 2 }}>
                                <Typography level="body-lg">
                                    Total punches today: {
                                        filteredRecords.filter(record => {
                                            const recordDate = new Date(record.date);
                                            const today = new Date();
                                            return recordDate.getDate() === today.getDate() &&
                                                recordDate.getMonth() === today.getMonth() &&
                                                recordDate.getFullYear() === today.getFullYear();
                                        }).length
                                    }
                                </Typography>
                            </Box>
                            <Box>
                                <Typography level="body-lg">
                                    Today's Date: {new Date().toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Stack>
        </>
    )
}

export default AttenzyIot;
