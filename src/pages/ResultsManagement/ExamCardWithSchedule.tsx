
import { KeyboardArrowRight } from "@mui/icons-material"
import { Avatar, Box, Button, Card, Typography, Stack } from "@mui/joy"
import ExamScheduleTable from "components/Exams/ExamScheduleTable";
import { useFirebase } from "context/firebaseContext";
import { collection, doc, getDoc, Timestamp } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { ClassType } from "pages/MasterData/AddClasses";
import { useEffect, useState } from "react";

type ExamCardPropsType = {
    index: number
    examTitle: string,
    examDescription: string,
    examId: string,
    createdAt: Timestamp
}

const ExamCardWithSchedule: React.FC<ExamCardPropsType> = ({ index, examTitle, examId, examDescription, createdAt }) => {
    const [isExamScheduleShowing, setIsExamScheduleShowing] = useState<boolean>(false);
    const [classList, setClassList] = useState<string[]>([]);


    const [examSchedule, setExamSchedule] = useState<any>();
    const { db } = useFirebase()

    useEffect(() => {
        const fetchExamSchedule = async () => {
            if (!examId) return
            const schRef = doc(collection(db, "EXAM_SCHEDULES"), `${examId}_SCHEDULE`)
            try {
                const scheduleSnap = await getDoc(schRef);
                if (scheduleSnap.exists()) {
                    const schData = scheduleSnap.data();
                    setExamSchedule(schData)
                }

            } catch (err) {
                enqueueSnackbar("Err:" + err, { variant: "error" })
            }
        }
        fetchExamSchedule()
    }, [examId])
    useEffect(() => {
        const fetchPapers = async () => {
            const docRef = doc(collection(db, "MASTER_DATA"), "masterData");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const classes: ClassType[] = docSnap.data().classes as ClassType[];
                const clss = classes.map((item) => item.name)
                setClassList(clss)
            } else {
                console.log("Papers not found!");
                enqueueSnackbar("Failed to load config!", { variant: "error" })
            }
        };
        fetchPapers();
    }, []);

    return (
        <>
            <Card
                size="sm"
                variant="outlined"
                sx={{ height: "100%" }}
            >
                <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    sx={{ height: "100%" }}
                    alignItems={"center"}
                >
                    <Stack direction={"row"} spacing={2} alignItems={"center"}>
                        <Avatar color="primary" variant="solid" >{index + 1}</Avatar>
                        <Stack>
                            <Typography level="h4">{examTitle}</Typography>
                            <Typography level="body-sm">
                                Created On :{createdAt && createdAt.toDate().toLocaleDateString().toString()}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack direction={"row"} spacing={2}>
                        <Button
                            variant="soft"
                            color="neutral"
                            endDecorator={<KeyboardArrowRight />}
                            sx={{ height: "100%" }}
                            onClick={() => setIsExamScheduleShowing(!isExamScheduleShowing)}
                        >
                            View
                        </Button>
                    </Stack>
                </Stack>
            </Card>
            {isExamScheduleShowing &&

                <Stack justifyContent={"center"} alignItems={"center"} mb={4} >
                    <Box sx={{
                        width: "95%",
                        border: "1px solid #5D87FF",
                        borderTop: 0,
                        borderRadius: 10,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        p: 4,
                        pt: 1,
                        overflowX: "auto"
                    }}>

                        <Box >
                            <ExamScheduleTable classList={classList} examId={examId} examTitle={examTitle} examDescription={examDescription} schedule={examSchedule} />
                        </Box>
                    </Box>
                </Stack>
            }
        </>
    )
}

export default ExamCardWithSchedule