import { Search } from "@mui/icons-material";
import { Box, Button, Card, Divider, FormControl, FormHelperText, FormLabel, LinearProgress, Option, Select, Stack, Typography } from "@mui/joy";
import { Paper } from "@mui/material";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import ArrowMigration from "../../assets/arrow-migration.png"
import WarningIcon from '@mui/icons-material/Warning';
import MaterialTable from "@material-table/core";
import { StudentDetailsType } from "types/student";
import { arrayUnion, collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

import StudentPromotionConfirmationModal from "components/Modals/StudentPromotionConfirmationModal";



function StudentMigration() {
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [selectedData, setSelectedData] = useState<StudentDetailsType[]>([]);
    const [afterMigrationClass, setAfterMigrationClass] = useState<any>(null)
    const [students, setStudents] = useState<StudentDetailsType[]>([])
    const [loading, setLoading] = useState(false);
    const [studentPromotionModalOpen, setStudentPromotionModalOpen] = useState<boolean>(false)

    //Get Firebase DB instance
    const { db } = useFirebase();


    const handleStudentSearch = async () => {
        //fetch students based on selected class
        if (!selectedClass) {
            enqueueSnackbar("Please select the class for which you want the migration!", { variant: "info" });
            return
        }

        const sessionId = "SESSION_2024_25";
        //fetch already promoted students id from session
        const promotionRef = doc(db, "STUDENTS_PROMOTIONS", sessionId)
        const promotionSnap = await getDoc(promotionRef);
        const promotedStudents = promotionSnap.exists() ? promotionSnap.data().promotedStudents : [];


        // Fetch students for selected class
        const studentsQuery = query(collection(db, "STUDENTS"), where("class", "==", selectedClass));
        const studentsSnap = await getDocs(studentsQuery);

        if (studentsSnap.empty) {
            setLoading(false);
            enqueueSnackbar("No student found :)", { variant: "warning" });
            return;
        }

        const studentList = studentsSnap.docs.map(doc => ({
            id: doc.id, ...doc.data()
        })).filter(student => !promotedStudents.includes(student.id))

        setStudents(studentList as StudentDetailsType[]);
    }

    const handleInputResetBtn = () => {
        //reset inputs
    }

    useEffect(() => {
        //change after migration
        if (selectedClass) {
            console.log(selectedClass)
            if (selectedClass === 14) {
                setAfterMigrationClass(1)
            } else {
                setAfterMigrationClass(selectedClass + 1)
            }
        }
    }, [selectedClass])

    //students table columns
    const columnMat = [
        {
            title: "Student Id", field: "admission_no",
            cellStyle: {
                fontSize: '14px',
            },
        },
        {
            title: "Student Name", field: "student_name", cellStyle: {
                fontSize: '14px',
            },
        },
        {
            title: "Father Name", field: "father_name", cellStyle: {
                fontSize: '14px',
            },
        },
        {
            title: "Roll No", field: "class_roll", cellStyle: {
                fontSize: '14px',
            },
        }
    ]

    const handlePromoteStudents = async () => {
        if (!selectedData || selectedData.length === 0) {
            enqueueSnackbar("No Student selected for promotion!", { variant: "info" });
            return;
        }

        if (!afterMigrationClass) {
            enqueueSnackbar("After promotion class cannot be determined!", { variant: "error" });
            return;
        }

        const sessionId = "SESSION_2024_25";
        const promotionRef = doc(db, "STUDENTS_PROMOTIONS", sessionId);

        try {
            // Fetch the default monthly fee map from CONFIG -> PAYMENT_CONFIG
            const paymentConfigRef = doc(db, "CONFIG", "PAYMENT_CONFIG");
            const paymentConfigSnap = await getDoc(paymentConfigRef);
            const defaultMonthlyFeeMap = paymentConfigSnap.exists() ? paymentConfigSnap.data().defaultMonthlyFee || {} : {};
            const defaultMonthlyFee = defaultMonthlyFeeMap[`class_${afterMigrationClass}`] || 0;


            await runTransaction(db, async (transaction) => {
                for (const student of selectedData) {
                    const studentDocRef = doc(db, "STUDENTS", student.id);

                    transaction.set(studentDocRef, {
                        lastPromotedAt: serverTimestamp(),
                        promotionHistory: [...(student.promotionHistory || []), {
                            from: student.class,
                            to: afterMigrationClass,
                            date: new Date()
                        }],
                        status: "Promoted",
                        class: afterMigrationClass,
                        monthly_fee: defaultMonthlyFee  // Update with new monthly fee
                    }, { merge: true });
                }

                transaction.set(promotionRef, {
                    promotedStudents: arrayUnion(...selectedData.map(s => s.id))
                }, { merge: true });
            });

            enqueueSnackbar("Students promoted successfully!", { variant: "success" });
            handleStudentSearch();
        } catch (error) {
            console.error("Transaction failed: ", error);
            enqueueSnackbar("Failed to promote students!", { variant: "error" });
        }
    };


    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <PageHeaderWithHelpButton title="Promote Students Class" />
                <Paper sx={{ p: "10px", mt: "8px" }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography level="title-md">Search Student</Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" gap={1.5}>

                            <Select
                                placeholder="choose class"
                                onChange={(e, val) => setSelectedClass(val)}
                            >
                                {SCHOOL_CLASSES.map((item) => {
                                    return <Option value={item.value} key={item.id}>{item.title}</Option>;
                                })}
                            </Select>

                            <Button
                                sx={{ ml: "8px" }}
                                startDecorator={<Search />}
                                onClick={handleStudentSearch}
                            ></Button>
                            <Button
                                variant="soft"
                                sx={{ ml: "8px" }}
                                onClick={handleInputResetBtn}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
                <br />
                {
                    selectedClass &&
                    <Box>
                        <Card
                            size="sm"
                            variant="outlined"
                            color="warning"
                            sx={{ height: "100%" }}
                        >
                            <Stack
                                direction={"row"}
                                justifyContent={"center"}
                                sx={{ height: "100%" }}
                                alignItems={"center"}
                            >
                                <Stack direction={"row"} spacing={4} justifyContent={"center"} alignItems={"center"}>

                                    <FormControl>
                                        <FormLabel>Current Class</FormLabel>
                                        <Select
                                            value={selectedClass}
                                        >
                                            {SCHOOL_CLASSES.map((item) => {
                                                return <Option value={item.value} key={item.id}>{item.title}</Option>;
                                            })}
                                        </Select>
                                        <FormHelperText>Total Count: {students.length}</FormHelperText>
                                    </FormControl>
                                    <img src={ArrowMigration} height={40} />
                                    <FormControl>
                                        <FormLabel>After Promotion Class</FormLabel>
                                        <Select
                                            placeholder="choose migration class"
                                            value={afterMigrationClass}
                                            onChange={(e, val) => setAfterMigrationClass(val)}
                                        >
                                            {SCHOOL_CLASSES.map((item) => {
                                                return <Option value={item.value} key={item.id}>{item.title}</Option>;
                                            })}
                                        </Select>
                                        <FormHelperText>Total Count: N/A</FormHelperText>
                                    </FormControl>

                                </Stack>

                            </Stack>
                            <Divider />
                            <Stack direction={"row"}>
                                <Typography color="warning" level="body-xs" startDecorator={<WarningIcon />}>Please execute this transaction with utmost care, as incorrect execution may lead to system misalignment. You also have the option to select or deselect students who should not be promoted.</Typography>
                                <Stack>
                                    <Button size="sm" onClick={() => setStudentPromotionModalOpen(true)}>Promote Students</Button>
                                </Stack>

                            </Stack>
                        </Card>
                        <br />
                        <Card variant="outlined">
                            {loading && <LinearProgress />}
                            <MaterialTable
                                style={{ display: "grid", boxShadow: "none" }}
                                columns={columnMat}
                                data={students}
                                title="Students List"
                                onSelectionChange={(data) => setSelectedData(data)}
                                options={{
                                    selection: true,
                                    grouping: false,
                                    headerStyle: {
                                        backgroundColor: "#F4F4F4",
                                    },
                                }}
                            />
                        </Card>
                    </Box>
                }

                <StudentPromotionConfirmationModal open={studentPromotionModalOpen} setModalOpen={setStudentPromotionModalOpen} handlePromoteStudents={handlePromoteStudents} />

            </LSPage>
        </PageContainer>
    )
}

export default StudentMigration