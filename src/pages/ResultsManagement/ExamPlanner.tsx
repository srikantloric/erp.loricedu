import { Add, Search } from "@mui/icons-material"
import { Button,Input} from "@mui/joy"
import { Stack } from "@mui/material"
import { IconCalendarEvent } from "@tabler/icons-react"
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
// import { useState } from "react"
import ExamCardWithSchedule from "./ExamCardWithSchedule"


function ExamPlanner() {
   
    return (
        <PageContainer>
            <Navbar />
            <LSPage>
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
                    <Button startDecorator={<Add />}>Add New Exam</Button>
                </Stack>
                <Stack mt={2}>
                    <ExamCardWithSchedule />
                </Stack>

            </LSPage>
        </PageContainer>
    )
}

export default ExamPlanner