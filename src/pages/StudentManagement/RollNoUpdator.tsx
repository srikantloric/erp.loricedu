
import { Button, LinearProgress, Option, Select, Stack, Tab, TabList, TabPanel, Tabs } from "@mui/joy"

import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from "config/schoolConfig"
import { useFirebase } from "context/firebaseContext"
import { collection, getDocs, query, where } from "firebase/firestore"
import { enqueueSnackbar } from "notistack"
import { useState } from "react"
import { resultType } from "types/results"

import SortStudentByAlpha from "./Tabs/SortStudentByAlpha"
import { StudentDetailsType } from "types/student"
import SortStudentByExam from "./Tabs/SortStudentByExam"
type StudentWithResult = StudentDetailsType & {
    latestResultMark: number;
    newClassRoll: number
};
function RollNoUpdator() {
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [selectedSection, setSelectedSection] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false);
    const [students, setStudents] = useState<StudentWithResult[]>([]);
    // const [value, setValue] = useState('marks');

    const { db } = useFirebase();

    const fetchStudents = async () => {
        setStudents([])
        // Fetch students for selected class

        if (!selectedClass || !selectedSection) {
            enqueueSnackbar("Please select a class/section", { variant: "warning" });
            return;
        }

        let studentsQuery;
        if (selectedSection === "all") {
            studentsQuery = query(collection(db, "STUDENTS"), where("class", "==", selectedClass));
        } else {
            studentsQuery = query(collection(db, "STUDENTS"), where("class", "==", selectedClass), where("section", "==", selectedSection));
        }

        setLoading(true);
        const studentsSnap = await getDocs(studentsQuery);

        if (studentsSnap.empty) {
            setLoading(false);
            enqueueSnackbar("No result found :)", { variant: "warning" });
            return;
        }

        // Step 2: Map and fetch latest result from nested collection
        const studentList: StudentWithResult[] = await Promise.all(
            studentsSnap.docs.map(async (doc) => {
                const studentData = doc.data() as StudentWithResult;
                const studentId = doc.id;

                // Step 2: Query student's PUBLISHED_RESULT subcollection for examId
                const examResultQuery = query(
                    collection(db, "STUDENTS", studentId, "PUBLISHED_RESULTS"),
                    where("examId", "==", "APXAM202501"),
                );
                const resultSnap = await getDocs(examResultQuery);
                console.log(resultSnap)
                if (!resultSnap.empty) {
                    const latestResult = resultSnap.docs[0].data() as resultType;
                    let marksObtained = latestResult.result.reduce((total, item) => {
                        const obtainedMarkCalculated =
                            item.paperId === "DRAWING"
                                ? 0
                                : Number(item.paperMarkTheory) +
                                Number(item.paperMarkPractical);

                        return total + obtainedMarkCalculated;
                    }, 0);
                    studentData.latestResultMark = marksObtained; // You can type this if needed
                } else {
                    studentData.latestResultMark = 0; // You can type this if needed
                }
                return studentData;
            })
        );

        studentList.sort((a, b) => {
            const nameA = a.student_name?.toLowerCase() || "";
            const nameB = b.student_name?.toLowerCase() || "";
            return nameA.localeCompare(nameB);
        });

        studentList.forEach((student, index) => {
            student.newClassRoll = index + 1;
        });

        setStudents(studentList)
        setLoading(false);
    }
    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <PageHeaderWithHelpButton title="Student Roll Number Updation" />
                <Stack justifyContent={"flex-end"} direction={"row"} mt={2} mb={1}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Select
                            placeholder="choose class"
                            onChange={(e, val) => setSelectedClass(val)}
                        >
                            {SCHOOL_CLASSES.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>;
                            })}
                        </Select>
                        <Select
                            placeholder="choose section"
                            onChange={(e, val) => setSelectedSection(val)}
                        >
                            <Option value="all">All</Option>
                            {SCHOOL_SECTIONS.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>;
                            })}
                        </Select>
                        <Button
                            sx={{ ml: "8px" }}
                            onClick={fetchStudents}
                            loading={loading}
                        >Fetch Students</Button>
                    </Stack>
                </Stack>

                {loading && <LinearProgress />}
                <Tabs aria-label="Basic tabs" defaultValue={0}>
                    <TabList>
                        <Tab>Sort Student By Alphabet</Tab>
                        <Tab>Sort Student By Exam Marks</Tab>
                    </TabList>

                    <TabPanel value={0}>
                        <SortStudentByAlpha students={students} fetchStudents={fetchStudents} />
                    </TabPanel>
                    <TabPanel value={1}>
                        <SortStudentByExam students={students} fetchStudents={fetchStudents} />
                    </TabPanel>
                </Tabs>
            </LSPage>
        </PageContainer >
    )
}

export default RollNoUpdator