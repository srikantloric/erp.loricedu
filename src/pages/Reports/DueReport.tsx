import TouchAppIcon from '@mui/icons-material/TouchApp';
import { Box, Button, Input, Option, Select, Stack, Typography } from "@mui/joy";
import { Paper } from "@mui/material";
import { IconReport } from "@tabler/icons-react";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import { DueTable } from 'components/Tables/DueTable';
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { SCHOOL_CLASSES, SCHOOL_FEE_MONTHS, SCHOOL_FEE_YEAR } from "config/schoolConfig";
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { DueReportType } from 'types/reports';
import { getClassNameByValue, getMonthTitleByValue, makeDoubleDigit } from 'utilities/UtilitiesFunctions';
import { StudentDetailsType } from 'types/student';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useFirebase } from 'context/firebaseContext';



function DueReport() {
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [dueStudentList, setDueStudentList] = useState<DueReportType[]>([]);

    //Get Firebase DB instance
   const {db} = useFirebase();

    async function getDueListByClass(className: number) {
        const dueList: DueReportType[] = [];
        console.log("Searching for class", className);
        setLoading(true);
    
        try {
            // Query students based on class
            const studentsRef = collection(db, "STUDENTS");
            const studentQuery = query(studentsRef, where("class", "==", className));
            const studentSnapshot = await getDocs(studentQuery);
    
            if (studentSnapshot.empty) {
                setLoading(false);
                enqueueSnackbar("No students found for this class.", { variant: "warning" });
                return dueList;
            }
    
            const constructedChallanId = `CHALLAN${makeDoubleDigit("" + selectedMonth)}${selectedYear}`;
    
            // Create an array of Firestore promises
            const challanPromises = studentSnapshot.docs.map(async (studentDoc) => {
                const studentData = studentDoc.data() as StudentDetailsType;
                const studentId = studentDoc.id;
    
                if (studentData?.generatedChallans?.includes(constructedChallanId)) {
                    const challanRef = doc(db, `STUDENTS/${studentId}/CHALLANS`, constructedChallanId);
                    const challanSnap = await getDoc(challanRef);
                    const challanData = challanSnap.data();
    
                    if (challanData && challanData.status !== "PAID") {
                        return {
                            studentId: studentData.admission_no,
                            studentName: studentData.student_name,
                            fatherName: studentData.father_name,
                            contact: studentData.contact_number,
                            dueAmount: challanData.totalAmount - challanData.amountPaid,
                            dueMonth: getMonthTitleByValue(selectedMonth!)!,
                            remark: "",
                            class: getClassNameByValue(selectedClass!)!,
                            sl: "",
                        };
                    }
                }
    
                return {
                    studentId: studentData.admission_no,
                    studentName: studentData.student_name,
                    fatherName: studentData.father_name,
                    contact: studentData.contact_number,
                    dueAmount: 0,
                    dueMonth: getMonthTitleByValue(selectedMonth!)!,
                    remark: "Challan not generated",
                    class: getClassNameByValue(selectedClass!)!,
                    sl: "",
                };
            });
    
            // Wait for all promises to resolve
            const results = await Promise.all(challanPromises);
            dueList.push(...results);
    
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
        if (!selectedYear) {
            enqueueSnackbar("Please select Year!", { variant: "error" })
            return
        }
        if (!selectedMonth) {
            enqueueSnackbar("Please select month!", { variant: "error" })
            return
        }

        //fetch due from PAYMENT COLLECTION
        const result = await getDueListByClass(selectedClass)
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
                <Paper sx={{ p: "10px", mt: "8px" }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography level="title-md">Due List</Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Input
                                placeholder="Search by student id.."

                            ></Input>
                            <Typography>Or</Typography>
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
                                placeholder="choose year"
                                value={selectedYear}
                                onChange={(e, val) => setSelectedYear(val)}
                            >
                                {SCHOOL_FEE_YEAR.map((item) => {
                                    return <Option value={item.value}>{item.title}</Option>;
                                })}
                            </Select>
                            <Select
                                placeholder="choose month"
                                value={selectedMonth}
                                onChange={(e, val) => setSelectedMonth(val)}
                            >
                                {SCHOOL_FEE_MONTHS.map((item) => {
                                    return <Option value={item.value}>{item.title}</Option>;
                                })}
                            </Select>
                            <Button
                                sx={{ ml: "8px" }}
                                startDecorator={<TouchAppIcon />}
                                onClick={handleGenerateDueReport}
                                loading={loading}
                            >
                                Generate Report
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
                <br />
                {dueStudentList.length > 0 &&
                    <DueTable dueData={dueStudentList} dueMonth={getMonthTitleByValue(selectedMonth!)!} dueYear={selectedYear!} />
                }
            </LSPage>
        </PageContainer>
    )
}

export default DueReport