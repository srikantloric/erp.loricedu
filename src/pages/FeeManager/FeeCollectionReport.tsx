import MaterialTable, { Column } from "@material-table/core";
import { Button, Typography } from "@mui/joy";
import { Box, Chip, Stack, TextField } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import { useState } from "react";
import { IPaymentNLForChallan } from "types/payment";

import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import { ExportCsv, ExportPdf } from "@material-table/exporters";

function FeeCollectionReport() {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [collectionList, setCollectionList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const { db } = useFirebase();

    const baseColumns: Column<any>[] = [
        { title: "ID", field: "studentDetails.admission_no" },
        { title: "Name", field: "studentDetails.student_name" },
        {
            title: "Class", field: "studentDetails.class",
            render: (row) => {
                return (
                    <Typography>{getClassNameByValue(row.studentDetails.class) || "N/A"}</Typography>
                )
            },
        },
        { title: "Challan", field: "challanTitle" },
        {
            title: "Received Amount", field: "amountPaid",
            render: (row) => {
                return (
                    <Chip label={`Rs. ${row.amountPaid}`} variant="outlined" color="primary" />
                )
            },
        },
        {
            title: "Received At",
            field: "timestamp",
            render: (rowData) => {
                if (!rowData.timestamp) return "N/A";
                const recievedOn = rowData.timestamp as Timestamp
                // ✅ Format dd/mm/yyyy hh:mm AM/PM
                return recievedOn.toDate().toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true, // 12-hour format with AM/PM
                });
            },
        },
        {
            title: "Received By",
            field: "recievedBy",
        },
    ];

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) return;

        const start = new Date(startDate);
        const end = new Date(endDate);

        setLoading(true)

        try {
            // 1. Fetch payments
            const q = query(
                collection(db, "MY_PAYMENTS"),
                where("timestamp", ">=", start),
                where("timestamp", "<=", end),
                orderBy("timestamp","desc")
            );

            const snapshot = await getDocs(q);
            const payments = snapshot.docs.map((doc) => ({
                ...doc.data(),
            })) as IPaymentNLForChallan[];

            if (payments.length === 0) {
                setCollectionList([]);
                setLoading(false)
                return;
            }

            // 2. Collect unique studentIds from payments
            const studentIds = [
                ...new Set(payments.map((p) => p.studentId).filter(Boolean)),
            ];

            // 3. Fetch student details in batch
            const studentDetailsMap: Record<string, any> = {};
            for (const studentId of studentIds) {
                const studentRef = collection(db, "STUDENTS");
                const studentSnap = await getDocs(
                    query(studentRef, where("id", "==", studentId))
                );
                if (!studentSnap.empty) {
                    studentDetailsMap[studentId] = studentSnap.docs[0].data();
                }
            }

            // 4. Merge student details into payment records
            const enrichedPayments = payments.map((p) => ({
                ...p,
                studentDetails: studentDetailsMap[p.studentId] || {},
            }));

            setLoading(false)
            setCollectionList(enrichedPayments);
        } catch (err) {
            setLoading(false)
            console.error("Error fetching payments:", err);
        }
    };
    return (
        <>
            <Box
                sx={{
                    p: "10px",
                    mt: "8px",
                    border: "1px solid oklch(.929 .013 255.508)",
                    borderRadius: "10px",
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    gap={1}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography level="title-md">Fee Collection Report</Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" gap={1.5}>
                        {/* ✅ Native datetime-local inputs */}
                        <TextField
                            label="Start Date & Time"
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />

                        <TextField
                            label="End Date & Time"
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            inputProps={{ min: startDate }} // ensure end >= start
                        />

                        <Button
                            sx={{ ml: "8px" }}
                            startDecorator={<TouchAppIcon />}
                            onClick={handleGenerateReport}
                            loading={loading}
                        >
                            Generate Report
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <br />
            <MaterialTable
                style={{
                    display: "grid",
                    overflow: "hidden",
                    border: "1px solid oklch(.905 .013 255.508)",
                    borderRadius: "10px",
                    boxShadow: "none",
                    fontSize: "0.85rem",
                }}
                title="Collected Payments"
                columns={baseColumns}
                data={collectionList}
                renderSummaryRow={({ column, data }) => {
                    // Total for amountPaid
                    if (column.field === "amountPaid") {
                        const total = data.reduce((sum, row) => sum + (row.amountPaid || 0), 0);
                        return {
                            value: `Total: Rs. ${total}`,
                            style: { fontWeight: "bold", textAlign: "center" },
                        };
                    }

                    // Optional: you can add other columns if needed
                    if (column.field === "challanTitle") {
                        return { value: "Summary", style: { fontWeight: "bold" } };
                    }

                    return null;
                }}
                options={{
                    actionsColumnIndex: -1,
                    pageSizeOptions: [5, 10, 20, 50, 100],
                    pageSize: 10,
                    padding: "dense",
                    exportAllData: true,
                    exportMenu: [
                        {
                            label: "Export PDF",
                            exportFunc: (cols, data) => {
                                ExportPdf(cols, data, "Fee Collection Report");
                            },
                        },
                        {
                            label: "Export CSV",
                            exportFunc: (cols, data) => {
                                ExportCsv(cols, data, "Fee Collection Report");
                            },
                        },
                    ],
                }}
            />
        </>
    );
}

export default FeeCollectionReport;
