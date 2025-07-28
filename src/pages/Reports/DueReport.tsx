import TouchAppIcon from '@mui/icons-material/TouchApp';
import { Box, Button, Checkbox, Divider, Option, Select, Stack, Typography } from "@mui/joy";
import { IconReport } from "@tabler/icons-react";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { SCHOOL_CLASSES, SCHOOL_FEE_MONTHS, SCHOOL_SESSIONS } from "config/schoolConfig";
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { getClassNameByValue, makeDoubleDigit } from 'utilities/UtilitiesFunctions';
import { StudentDetailsType } from 'types/student';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useFirebase } from 'context/firebaseContext';
import DueReportTable, { DueReportRow } from 'components/Tables/DueReportTable';
import SideBarContext from 'context/SidebarContext';


function DueReport() {
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedMonths, setSelectedMonths] = useState<number[]>([])
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [dueStudentList, setDueStudentList] = useState<DueReportRow[]>([]);

    //Get Firebase DB instance
    const { db } = useFirebase();
    const { setSidebarOpen } = useContext(SideBarContext);

    useEffect(() => {
        setSidebarOpen(false);
    }, [setSidebarOpen]);

    async function getDueListByClass(className: number, selectedMonths: number[]) {
        const dueList: any[] = [];
        setLoading(true);
        try {
            // Query students based on class
            const studentsRef = collection(db, "STUDENTS");
            const studentQuery = query(studentsRef, where("class", "==", className),where("is_active", "==", true));
            const studentSnapshot = await getDocs(studentQuery);

            if (studentSnapshot.empty) {
                setLoading(false);
                enqueueSnackbar("No students found for this class.", { variant: "warning" });
                return dueList;
            }

            // Only show columns for selected months
            const selectedMonthObjs = SCHOOL_FEE_MONTHS.filter(m => selectedMonths.includes(m.value));

            // For each student, fetch challan data for selected months
            const studentRows = await Promise.all(studentSnapshot.docs.map(async (studentDoc, idx) => {
                const studentData = studentDoc.data() as StudentDetailsType;

                const studentId = studentDoc.id;
                let paid = 0;
                let due = 0;
                const dueMonths: { month: string, value: number }[] = [];

                for (const monthObj of selectedMonthObjs) {
                    // Determine the correct year for the challan based on the month and session
                    let challanYear = "";
                    if (monthObj.value >= 4 && monthObj.value <= 12) {
                        challanYear = selectedSession?.split("-")[0] || "";
                    } else {
                        challanYear = selectedSession?.split("-")[1] || "";
                    }
                    const constructedChallanId = `CHALLAN${makeDoubleDigit("" + monthObj.value)}${challanYear}`;
                    let monthPaid = 0;
                    let monthDue = 0;

                    if (studentData?.generatedChallans?.includes(constructedChallanId)) {
                        const challanRef = doc(db, `STUDENTS/${studentId}/CHALLANS`, constructedChallanId);
                        const challanSnap = await getDoc(challanRef);
                        const challanData = challanSnap.data();
                        if (challanData) {
                            monthPaid = challanData.amountPaid || 0;
                            monthDue = (challanData.totalAmount || 0) - (challanData.amountPaid || 0) - (challanData.feeDiscount || 0) - (challanData.feeConsession || 0);
                        }
                    }
                    if (monthDue > 0) {
                        dueMonths.push({ month: monthObj.title, value: monthDue });
                    }
                    paid += monthPaid;
                    due += monthDue > 0 ? monthDue : 0;
                }

                // Build row for DueReportTable, only include dueMonths array
                const row: any = {
                    sl: idx + 1,
                    name: studentData.student_name,
                    fname: studentData.father_name,
                    contact: studentData.contact_number,
                    paid,
                    due,
                    dueMonths,
                };
                return row;
            }));

            dueList.push(...studentRows);
            setLoading(false);
            enqueueSnackbar("Report generated successfully!", { variant: "success" });
            return dueList;
        } catch (error) {
            setLoading(false);
            enqueueSnackbar("Failed to generate report.", { variant: "error" });
            console.error("Error fetching due list:", error);
            return [];
        }
    }

    //Generate Due Report
    const handleGenerateDueReport = async () => {
        if (!selectedClass) {
            enqueueSnackbar("Please select class!", { variant: "error" })
            return
        }
        if (!selectedSession) {
            enqueueSnackbar("Please select Year!", { variant: "error" })
            return
        }
        if (!selectedMonths) {
            enqueueSnackbar("Please select month!", { variant: "error" })

        }

        //fetch due from PAYMENT COLLECTION
        const result = await getDueListByClass(selectedClass, selectedMonths)
        setDueStudentList(result)
    }


    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <BreadCrumbsV2
                    Icon={IconReport}
                    Path="Fee Reports/Due Report"
                />
                <br />
                <Box sx={{ p: "10px", mt: "8px", border: "1px solid oklch(.929 .013 255.508)", borderRadius: "10px" }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        gap={1}
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography level="title-md">Due List</Typography>
                        </Box>
                        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" gap={1.5}>

                            <Select
                                placeholder="choose class"
                                value={selectedClass}
                                onChange={(e, val) => setSelectedClass(val)}
                            >
                                {SCHOOL_CLASSES.map((item) => {
                                    return <Option value={item.value}>{item.title}</Option>;
                                })}
                            </Select>
                            <Select
                                placeholder="choose session"
                                value={selectedSession}
                                onChange={(e, val) => setSelectedSession(val)}
                            >
                                {SCHOOL_SESSIONS.map((item) => {
                                    return <Option value={item.value}>{item.title}</Option>;
                                })}
                            </Select>
                            <Button
                                sx={{ ml: "8px" }}
                                startDecorator={<TouchAppIcon />}
                                onClick={handleGenerateDueReport}
                                loading={loading}
                                disabled={loading || !selectedClass || !selectedSession || selectedMonths.length === 0}
                            >
                                Generate Report
                            </Button>
                        </Stack>
                    </Stack>
                    <Divider sx={{ mt: 1, mb: 1 }} />
                    <Stack direction={"row"} flexWrap={"wrap"} justifyContent={"space-evenly"} gap={1}>
                        <Checkbox
                            label="Select all"
                            variant="soft"
                            defaultChecked
                            checked={selectedMonths.length === SCHOOL_FEE_MONTHS.length}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedMonths(SCHOOL_FEE_MONTHS.map((item) => item.value));
                                } else {
                                    setSelectedMonths([]);
                                }
                            }}
                        />
                        {SCHOOL_FEE_MONTHS.map((item) => {
                            return (
                                <Checkbox
                                    key={item.value}
                                    label={item.title}
                                    variant="soft"
                                    checked={selectedMonths?.includes(item.value)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedMonths((prev) => [...(prev || []), item.value]);
                                        } else {
                                            setSelectedMonths((prev) =>
                                                (prev || []).filter((month) => month !== item.value)
                                            );
                                        }
                                    }}
                                />
                            );
                        })}
                    </Stack>
                </Box>
                <br />
                {dueStudentList.length > 0 &&
                    <DueReportTable
                        selectedSession={selectedSession!}
                        selectedClass={"" + getClassNameByValue(selectedClass!)}
                        data={dueStudentList}
                        selectedMonths={
                            selectedMonths
                                .map(m => SCHOOL_FEE_MONTHS.find(month => month.value === m)?.title)
                                .filter((title): title is string => Boolean(title))
                        }
                    />
                }
            </LSPage>
        </PageContainer>
    )
}

export default DueReport