import { Search } from "@mui/icons-material"
import { Box, Button, Input, Option, Select, Stack, Typography } from "@mui/joy"
import { Paper } from "@mui/material"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { SCHOOL_CLASSES } from "config/schoolConfig"
import {  useState } from "react"
import { StudentDetailsType } from "types/student"
import { getDocs, collection } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext"
import { query, where } from "firebase/firestore";

function AttendanceConfiguration() {
    const [studentIdInput, setStudentIdInput] = useState<string>("");
    const [selectedClass, setSelectedClass] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);
    const [students, setStudents] = useState<StudentDetailsType[]>([])

    const { db } = useFirebase();


    const fetchStudents = async () => {
        try {
            setLoading(true)
            const studentsQuery = query(
                collection(db, "STUDENTS"),
                where("class", "==", selectedClass)
            );
            const querySnapshot = await getDocs(studentsQuery);
            const studentsData = querySnapshot.docs.map(doc => ({
                ...doc.data()
            }));
            setStudents(studentsData as StudentDetailsType[]);
            setLoading(false)
        } catch (error) {
            console.error("Error fetching students: ", error);
            setLoading(false)
        } finally {
            setLoading(false);
        }
    }




    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <PageHeaderWithHelpButton title="Expense Management" />
                <Paper sx={{ p: "10px", mt: "8px" }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography level="title-md">Update Student RFID </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Input
                                placeholder="Search by student id.."
                                value={studentIdInput!}
                                onChange={(e) => setStudentIdInput(e.target.value)}
                            ></Input>
                            <Typography>Or</Typography>
                            <Select
                                placeholder="choose class"
                                onChange={(e, val) => setSelectedClass(val)}
                            >
                                {SCHOOL_CLASSES.map((item) => {
                                    return <Option value={item.value}>{item.title}</Option>;
                                })}
                            </Select>
                            <Button
                                sx={{ ml: "8px" }}
                                startDecorator={<Search />}
                                loading={loading}
                                onClick={fetchStudents}
                            ></Button>
                        </Stack>
                    </Stack>
                </Paper>

                                

            </LSPage>
        </PageContainer>
    )
}

export default AttendanceConfiguration