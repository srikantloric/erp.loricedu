import {
    Box,
    LinearProgress,
    FormControl,
    FormLabel,
    Select,
    Option,
    Typography
} from "@mui/joy";
import MaterialTable from "@material-table/core";
import { ExportCsv, ExportPdf } from "@material-table/exporters";
import { useEffect, useState } from "react";
import { Avatar, Chip } from "@mui/joy";
import { format } from "date-fns";

import { SCHOOL_CLASSES } from "config/schoolConfig";
import { getClassNameByValue, getSessionMonths } from "utilities/UtilitiesFunctions";
import { useNavbar } from "context/NavbarContext";

import { getMonthlyAttendanceForClass } from "services/firestore.attendance";

function MonthlyAttendance() {
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [monthsOfSession, setMonthsOfSession] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    const [datesInMonth, setDatesInMonth] = useState<string[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);

    const { session } = useNavbar();

    // Load session months
    useEffect(() => {
        const monthSession = getSessionMonths(session);
        setMonthsOfSession(monthSession);
    }, []);

    // Generate day columns for selected month
    useEffect(() => {
        if (!selectedMonth) return;

        const [yearStr, monthStr] = selectedMonth.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr) - 1;

        const daysInThisMonth = new Date(year, month + 1, 0).getDate();

        const dateList = [...Array(daysInThisMonth)].map((_, i) =>
            format(new Date(year, month, i + 1), "yyyy-MM-dd")
        );

        setDatesInMonth(dateList);
    }, [selectedMonth]);

    // Fetch attendance
    useEffect(() => {
        if (!selectedClass || !selectedMonth || datesInMonth.length === 0) return;

        async function load() {
            setLoading(true);

            const results = await getMonthlyAttendanceForClass(
                selectedClass!,
                selectedMonth,
                datesInMonth
            );

            setTableData(results);
            setLoading(false);
        }

        load();
    }, [selectedClass, selectedMonth, datesInMonth]);

    /* BASE COLUMNS */
    const baseColumns = [
        {
            field: "profilePicUrl",
            title: "Profile",
            render: (rowData: any) => (
                <Avatar src={rowData.profilePicUrl}>
                    {rowData.name?.charAt(0)}
                </Avatar>
            ),
            width: 70,
            export: false,
        },
        { field: "name", title: "Name", width: 180 },
        {
            field: "presentSummary",
            title: "P/W",
            width: 80,
            render: (row: any) => (
                <Chip
                    color="primary"
                    variant="solid"
                    sx={{ fontWeight: "bold", paddingX: 1 }}
                >
                    {row.presentSummary}
                </Chip>
            )
        },
        { field: "totalAbsent", title: "A", width: 50 },
        { field: "totalLeave", title: "L", width: 50 },
    ];

    /* DATE COLUMNS */
    const dateColumns = datesInMonth.map((fullDate) => ({
        field: fullDate,
        title: fullDate.slice(-2),
        width: 40,
        render: (row: any) => {
            const val = row[fullDate] || "-";

            const color =
                val === "P"
                    ? "success"
                    : val === "A"
                        ? "danger"
                        : val === "L"
                            ? "warning"
                            : val === "H"
                                ? "primary"
                                : "neutral";

            return (
                <Chip
                    size="sm"
                    variant="soft"
                    color={color}
                    sx={{
                        fontWeight: "bold",
                        minWidth: 28,
                        justifyContent: "center",
                        borderRadius: "6px",
                        paddingX: "6px",
                        paddingY: "2px",
                        fontSize: "0.75rem",
                    }}
                >
                    {val}
                </Chip>
            );
        },
    }));

    const columns = [...baseColumns, ...dateColumns];

    const showTable = selectedClass && selectedMonth;

    return (
        <>
            {/* FILTERS */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <FormControl>
                    <FormLabel>Select Month</FormLabel>
                    <Select
                        required
                        placeholder="Month"
                        value={selectedMonth}
                        onChange={(e, val) => setSelectedMonth(val!)}
                        sx={{ minWidth: 180 }}
                    >
                        {monthsOfSession.map((month) => (
                            <Option key={month} value={month}>
                                {month}
                            </Option>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <FormLabel>Class</FormLabel>
                    <Select
                        required
                        placeholder="Class"
                        value={selectedClass}
                        onChange={(e, val) => setSelectedClass(val)}
                        sx={{ minWidth: 180 }}
                    >
                        {SCHOOL_CLASSES.map((item) => (
                            <Option key={item.id} value={item.value}>
                                {item.title}
                            </Option>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <br />

            {/* IF NO SELECTION — SHOW GUIDE TEXT */}
            {!showTable && (

                <Box
                    sx={{
                        textAlign: "center",
                        padding: "40px",
                        border: "1px dashed #b5b5b5",
                        borderRadius: "12px",
                        color: "gray",
                        fontSize: "1.2rem",
                        backgroundColor: "#fafafa",
                    }}
                >
                    <Typography level="body-md" sx={{ fontWeight: 600 }}>
                        Please select both Class and Month to view the attendance.
                    </Typography>
                </Box>
            )}

            {/* TABLE */}
            {showTable && (
                <>
                    <Box
                        sx={{
                            mt: 2,
                            mb: 1,
                            p: 2,
                            borderRadius: "10px",
                            border: "1px solid #e0e0e0",
                        }}
                    >
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                            <Chip size="sm" variant="solid" color="success">P — Present</Chip>
                            <Chip size="sm" variant="solid" color="danger">A — Absent</Chip>
                            <Chip size="sm" variant="solid" color="warning">L — Leave</Chip>
                            <Chip size="sm" variant="solid" color="primary">H — Holiday</Chip>
                            <Chip size="sm" variant="solid" color="neutral">- — No Data</Chip>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                            <Chip variant="outlined" color="primary" size="sm" sx={{ fontWeight: "bold" }}>
                                P/W — Present Days/Working Days
                            </Chip>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            border: "1px solid oklch(.900 .013 255.508)",
                            borderRadius: "10px",
                            padding: "2px",
                            marginTop: "8px",
                        }}
                    >
                        {loading && <LinearProgress />}

                        <MaterialTable
                            style={{
                                display: loading ? "none" : "grid",
                                boxShadow: "none",
                            }}
                            columns={columns}
                            data={tableData}
                            title={`Monthly Attendance - ${selectedMonth}`}
                            options={{
                                paging: true,
                                pageSize: 10,
                                headerStyle: {
                                    backgroundColor: "#5d87ff",
                                    color: "#FFF",
                                },
                                exportMenu: [
                                    {
                                        label: "Export PDF",
                                        exportFunc: (cols, data) =>
                                            ExportPdf(
                                                cols,
                                                data,
                                                `Monthly-${getClassNameByValue(
                                                    selectedClass!
                                                )}-${selectedMonth}`
                                            ),
                                    },
                                    {
                                        label: "Export CSV",
                                        exportFunc: (cols, data) =>
                                            ExportCsv(
                                                cols,
                                                data,
                                                `Monthly-${getClassNameByValue(
                                                    selectedClass!
                                                )}-${selectedMonth}`
                                            ),
                                    },
                                ],
                            }}
                        />
                    </Box>
                </>
            )}
        </>
    );
}

export default MonthlyAttendance;
