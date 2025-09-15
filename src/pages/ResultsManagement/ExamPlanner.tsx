import { Add, Search } from "@mui/icons-material"
import { Button, Input } from "@mui/joy"
import { Stack } from "@mui/material"
import { IconCalendarEvent } from "@tabler/icons-react"
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2"

import ExamCardWithSchedule from "./ExamCardWithSchedule"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { useFirebase } from "context/firebaseContext"


function ExamPlanner() {

    const [exams, setExams] = useState<any[]>([]);
    const { db } = useFirebase()

    const navigate = useNavigate()

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const examQuery = query(
                    collection(db, "EXAMS"),
                    orderBy("createdAt", "desc")
                );

                const examSnap = await getDocs(examQuery);

                const examsData = examSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setExams(examsData);
            } catch (error) {
                console.error("Error fetching exams:", error);
            }
        };
        fetchExams()
    }, [])


    return (
        <>
            <BreadCrumbsV2
                Icon={IconCalendarEvent}
                Path="School Exams/Plan Exam"
            />
            <Stack direction={"row"} spacing={2} mt={2}>
                <Input
                    startDecorator={<Search />}
                    sx={{
                        mt: 4,
                        mb: 2,
                        flex: 1
                    }}
                    placeholder="Search for exams..."
                ></Input>
                <Button startDecorator={<Add />} onClick={() => navigate("/exams/add-exam")}>Add New Exam</Button>
            </Stack>
            <Stack mt={2} spacing={2}>
                {
                    exams && exams.map((exam, index) => {
                        return (
                            <ExamCardWithSchedule
                                index={index}
                                key={exam.examId}
                                examId={exam.examId}
                                examDescription={exam.examDescription}
                                examTitle={exam.examTitle}
                                createdAt={exam.createdAt} />
                        )
                    })
                }
            </Stack>
        </>
    )
}

export default ExamPlanner