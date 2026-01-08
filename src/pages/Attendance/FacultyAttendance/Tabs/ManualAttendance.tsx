// pages/ManualAttendance.tsx

import { Divider, LinearProgress } from "@mui/material";
import {
    Avatar,
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Option,
    Radio,
    RadioGroup,
    Select,
    Sheet,
    Table,
} from "@mui/joy";

import { Refresh, Save, Search } from "@mui/icons-material";
import { useState } from "react";
import { getCurrentDate } from "utilities/UtilitiesFunctions";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getFacultiessWithAttendance } from "services/attendance/firestore.attendance";

import { enqueueSnackbar } from "notistack";
import { AttendanceStatus, FacultyAttendance } from "types/AttendanceType";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

/* ---------------------------------------
   STATUS MAP (UI → FIRESTORE)
--------------------------------------- */

const statusMapping: Record<string, AttendanceStatus> = {
    P: "PRESENT",
    A: "ABSENT",
    H: "HOLIDAY",
    L: "LEAVE",
    S: "HALF_DAY",
};

/* ---------------------------------------
   COMPONENT
--------------------------------------- */

function ManualAttendance() {
    const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [faculties, setFaculties] = useState<FacultyAttendance[]>([]);

    const { db } = useFirebase();

    /* ---------------------------------------
       LOAD FACULTY + ATTENDANCE
    --------------------------------------- */

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const data = await getFacultiessWithAttendance(selectedDate);
            setFaculties(data);
        } catch (err) {
            console.error(err);
            enqueueSnackbar("Failed to load faculty", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    /* ---------------------------------------
       SEARCH FILTER
    --------------------------------------- */

    const filteredFaculties = faculties.filter((f) =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* ---------------------------------------
       RADIO CHANGE
    --------------------------------------- */

    const handleRadioSelect = (
        e: React.ChangeEvent<HTMLInputElement>,
        faculty: FacultyAttendance
    ) => {
        const newValue = e.target.value;

        setFaculties((prev) =>
            prev.map((f) =>
                f.facultyId !== faculty.facultyId
                    ? f
                    : {
                        ...f,
                        selected_option: newValue,
                        hasChanged: f.originalStatus !== newValue,
                    }
            )
        );
    };

    /* ---------------------------------------
       MARK ALL
    --------------------------------------- */

    const handleMarkAll = (val: string | null) => {
        if (!val || val === "none") return;

        setFaculties((prev) =>
            prev.map((f) => ({
                ...f,
                selected_option: val,
                hasChanged: f.originalStatus !== val,
            }))
        );
    };

    /* ---------------------------------------
       SAVE (EVENT-DRIVEN)
    --------------------------------------- */

    const handleSave = async () => {
        if (faculties.length === 0) {
            enqueueSnackbar("No faculty loaded!", { variant: "warning" });
            return;
        }

        const changedFaculties = faculties.filter((f) => f.hasChanged);

        if (changedFaculties.length === 0) {
            enqueueSnackbar("No changes to save.", { variant: "info" });
            return;
        }

        try {
            setLoading(true);

            const promises = changedFaculties.map((fac) => {
                const eventId = `FACULTY_${fac.facultyId}_${selectedDate}`;

                return setDoc(
                    doc(db, "ATTENDANCE_EVENTS", eventId),
                    {
                        eventId,
                        userId: fac.facultyId,
                        userType: "FACULTY",
                        departmentId: fac.departmentId || "NOT_CONFIGURED",
                        date: selectedDate,
                        status: statusMapping[fac.selected_option || "P"],
                        timestamp: serverTimestamp(),
                        source: "MANUAL",
                    },
                    { merge: true } // 🔒 idempotent
                );
            });

            await Promise.all(promises);

            enqueueSnackbar("Attendance saved successfully!", {
                variant: "success",
            });

            await fetchFaculty();
        } catch (err) {
            console.error(err);
            enqueueSnackbar("Error saving attendance", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    /* ---------------------------------------
       UI
    --------------------------------------- */

    return (
        <>
            <PageHeaderWithHelpButton title="Mark Faculty Attendance Manually" />
            <br />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 300px" },
                    gap: 3,
                }}
            >
                {/* LEFT PANEL */}
                <Box>
                    {loading && <LinearProgress />}

                    {faculties.length > 0 && (
                        <>
                            <Divider />
                            <br />

                            {/* SEARCH + MARK ALL + SAVE */}
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Input
                                    startDecorator={<Search />}
                                    placeholder="Search faculty"
                                    sx={{ flex: 0.6 }}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Select
                                        defaultValue="P"
                                        sx={{ minWidth: "200px" }}
                                        onChange={(e, val) => handleMarkAll(val)}
                                    >
                                        <Option value="none">None</Option>
                                        <Option value="P">Present</Option>
                                        <Option value="A">Absent</Option>
                                        <Option value="H">Holiday</Option>
                                        <Option value="L">Leave</Option>
                                        <Option value="S">Half Day</Option>
                                    </Select>

                                    <Button startDecorator={<Save />} onClick={handleSave}>
                                        Save
                                    </Button>
                                </Box>
                            </Box>

                            {/* TABLE */}
                            <Table variant="plain">
                                <thead>
                                    <tr>
                                        <th>Faculty</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredFaculties.map((fac) => (
                                        <tr key={fac.facultyId}>

                                            <td>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Avatar src={fac.profilePicUrl || ""} />
                                                    {fac.name}
                                                </Box>
                                            </td>

                                            <td>
                                                <RadioGroup
                                                    value={fac.selected_option}
                                                    onChange={(e) => handleRadioSelect(e, fac)}
                                                    orientation="horizontal"
                                                    sx={{ gap: 1 }}
                                                >
                                                    {["P", "A", "H", "L", "S"].map((val) => (
                                                        <Sheet
                                                            key={val}
                                                            sx={{
                                                                p: 1,
                                                                borderRadius: "md",
                                                                boxShadow: "sm",
                                                            }}
                                                        >
                                                            <Radio
                                                                label={val}
                                                                overlay
                                                                disableIcon
                                                                value={val}
                                                            />
                                                        </Sheet>
                                                    ))}
                                                </RadioGroup>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Box>

                {/* RIGHT PANEL */}
                <Box
                    sx={{
                        border: "1px solid #ddd",
                        p: 2,
                        borderRadius: "12px",
                        height: "100vh",
                        position: "sticky",
                        top: 80,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <FormControl>
                        <FormLabel>Select Date</FormLabel>
                        <Calendar
                            onChange={(date: any) => {
                                const yyyy = date.getFullYear();
                                const mm = String(date.getMonth() + 1).padStart(2, "0");
                                const dd = String(date.getDate()).padStart(2, "0");
                                setSelectedDate(`${yyyy}-${mm}-${dd}`);
                            }}
                            value={new Date(selectedDate)}
                        />
                    </FormControl>

                    <Button startDecorator={<Refresh />} onClick={fetchFaculty}>
                        Load Faculty
                    </Button>
                </Box>
            </Box>
        </>
    );
}

export default ManualAttendance;
