
import {  KeyboardArrowRight } from "@mui/icons-material"
import { Avatar, Box, Button, Card, Typography, Stack } from "@mui/joy"
import ExamPlannerTable from "components/Exams/ExamPlannerTable";
import { useState } from "react";

function ExamCardWithSchedule() {
    const [isExamScheduleShowing, setIsExamScheduleShowing] = useState<boolean>(false);
    return (
        <>
            <Card
                size="sm"
                variant="outlined"
                sx={{ height: "100%"}}
            >
                <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    sx={{ height: "100%" }}
                    alignItems={"center"}
                >
                    <Stack direction={"row"} spacing={2} alignItems={"center"}>
                        <Avatar color="primary" variant="solid" >1</Avatar>
                        <Stack>
                            <Typography level="h4">Annual Exam (Term-4)</Typography>
                            <Typography level="body-sm">
                                Created On :01-25-2021
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack direction={"row"} spacing={2}>
                        {/* <Button
                            variant="soft"
                            color="neutral"
                            endDecorator={<Edit />}
                            sx={{ height: "100%" }}
                        >
                            Edit Exam Schedule
                        </Button> */}
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
                        pt: 2,
                        overflowX:"auto"
                    }}>
                        <Typography level="title-md" mb={1}>Exam Schedule</Typography>
                        <ExamPlannerTable />
                    </Box>
                </Stack>
            }
        </>
    )
}

export default ExamCardWithSchedule