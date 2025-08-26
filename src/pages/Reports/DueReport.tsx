import TouchAppIcon from '@mui/icons-material/TouchApp';
import { Box, Button, Checkbox, Divider, Option, Select, Stack, Typography } from "@mui/joy";
import { IconReport } from "@tabler/icons-react";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { SCHOOL_CLASSES, SCHOOL_FEE_MONTHS, SCHOOL_SESSIONS } from "config/schoolConfig";
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useRef, useState } from 'react';
import { getClassNameByValue } from 'utilities/UtilitiesFunctions';
import DueReportTable, { DueReportRow } from 'components/Tables/DueReportTable';
import SideBarContext from 'context/SidebarContext';
import { GetDueListByClassAndMonths, GetDueListByClassAndSessions } from 'utilities/ReportUtilityFunctions';


function DueReport() {

    const isFirstRender1 = useRef(true);
    const isFirstRender2 = useRef(true);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [selectedMonths, setSelectedMonths] = useState<number[]>([])
    const [selectedSessions, setSelectedSessions] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [dueStudentListWithMonths, setDueStudentListWithMonths] = useState<DueReportRow[]>([]);
    const [dueStudentListWithSessions, setDueStudentListWithSessions] = useState<DueReportRow[]>([]);


    const { setSidebarOpen } = useContext(SideBarContext);

    useEffect(() => {
        setSidebarOpen(false);
    }, [setSidebarOpen]);



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

        if (selectedSession === "all" && !selectedSessions) {
            enqueueSnackbar("Please select sessions!", { variant: "error" })
        }

        //fetch due from PAYMENT COLLECTION
        setLoading(true)
        if (selectedSession === "all") {
            const result = await GetDueListByClassAndSessions(selectedClass, selectedSession, selectedSessions)
            
            setDueStudentListWithMonths([]);
            console.log(result)
            setDueStudentListWithSessions(result)

        } else {
            const result = await GetDueListByClassAndMonths(selectedClass, selectedMonths, selectedSession)
            console.log(result)
            setDueStudentListWithSessions([])
            setDueStudentListWithMonths(result)
        }
        setLoading(false)
    }
    // Show snackbar only after initial render
    useEffect(() => {
        if (isFirstRender1.current) {
            isFirstRender1.current = false
            return
        }
        enqueueSnackbar("New Session selected or removed, please click on Generate Report Button! ", { variant: "warning" });
    }, [selectedSessions]);

    useEffect(() => {
        if (isFirstRender2.current) {
            isFirstRender2.current = false
            return
        }
        enqueueSnackbar("New month selected or removed, please click on Generate Report Button! ", { variant: "warning" })
    }, [selectedMonths])


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
                                <Option value={"all"}>All</Option>
                            </Select>
                            <Button
                                sx={{ ml: "8px" }}
                                startDecorator={<TouchAppIcon />}
                                onClick={handleGenerateDueReport}
                                loading={loading}
                                disabled={
                                    loading ||
                                    !selectedClass ||
                                    !selectedSession ||
                                    (selectedSession === "all"
                                        ? selectedSessions.length === 0
                                        : selectedMonths.length === 0)
                                }
                            >
                                Generate Report
                            </Button>
                        </Stack>
                    </Stack>
                    <Divider sx={{ mt: 1, mb: 1 }} />
                    {selectedSession === "all" ?
                        <>
                            <Stack direction={"row"} flexWrap={"wrap"} gap={3}>
                                <Checkbox
                                    label="Select all"
                                    variant="soft"
                                    defaultChecked
                                    checked={selectedSessions.length === SCHOOL_SESSIONS.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedSessions(SCHOOL_SESSIONS.map((item) => item.value));
                                        } else {
                                            setSelectedSessions([]);
                                        }
                                    }}
                                />
                                {SCHOOL_SESSIONS.map((item) => {
                                    return (
                                        <Checkbox
                                            key={item.value}
                                            label={item.title}
                                            variant="soft"
                                            checked={selectedSessions?.includes(item.value)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedSessions((prev) => [...(prev || []), item.value]);
                                                } else {
                                                    setSelectedSessions((prev) =>
                                                        (prev || []).filter((session) => session !== item.value)
                                                    );
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </Stack>
                        </>
                        :
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
                    }
                </Box>
                <br />

                {dueStudentListWithSessions.length > 0 &&
                    <DueReportTable
                        selectedSession={selectedSession!}
                        selectedClass={"" + getClassNameByValue(selectedClass!)}
                        data={dueStudentListWithSessions}
                        selectedSessions={
                            selectedSessions
                                .map(m => SCHOOL_SESSIONS.find(month => month.value === m)?.title)
                                .filter((title): title is string => Boolean(title))
                        }
                    />
                }

                {dueStudentListWithMonths.length > 0 &&
                    <DueReportTable
                        selectedSession={selectedSession!}
                        selectedClass={"" + getClassNameByValue(selectedClass!)}
                        data={dueStudentListWithMonths}
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