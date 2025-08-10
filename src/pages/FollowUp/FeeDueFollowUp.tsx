import { Box, Button, Chip, Option, Select, Stack, Typography } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { SCHOOL_CLASSES } from "config/schoolConfig"
import { enqueueSnackbar } from "notistack"
import { useState } from "react"
import TouchAppIcon from '@mui/icons-material/TouchApp';
import MaterialTable, { Column } from "@material-table/core"
import { PhoneForwarded } from "@mui/icons-material"
import { GetDueListByClass } from "utilities/ReportUtilityFunctions"
import { DueListType } from "types/reports"
// import { FollowUpModal } from "components/Modals/follow-ups/FollowUpModal"
function FeeDueFollowUp() {
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [dueList, setDueList] = useState<DueListType[]>([])
    const [loading, setLoading] = useState<boolean>(false)


    //Generate Due Report
    const handleGenerateDueReport = async () => {
        if (!selectedClass) {
            enqueueSnackbar("Please select class!", { variant: "error" })
            return
        }
        setLoading(true)
        const dueList = await GetDueListByClass(selectedClass)
        setDueList(dueList!)
        setLoading(false)

    }

    const baseColumns: Column<DueListType>[] = [
        {
            title: 'ID', field: 'studentDetails.studentId',
            cellStyle: {
                maxWidth: "200px",
                border: '1px solid #ccc'
            },
            headerStyle: {
                backgroundColor: '#5D87FF',
                color: "#FFF",
                maxWidth: "200px",
                border: '1px solid #ccc'
            },
        },
        {
            title: 'Name', field: 'studentDetails.studentName',
            cellStyle: {
                maxWidth: "200px",
                border: '1px solid #ccc'
            },
            headerStyle: {
                backgroundColor: '#5D87FF',
                color: "#FFF",
                maxWidth: "200px",
                border: '1px solid #ccc'
            },
        },
        {
            title: 'Father Name', field: 'studentDetails.fatherName',
            cellStyle: {
                maxWidth: "200px",
                border: '1px solid #ccc'
            },
            headerStyle: {
                backgroundColor: '#5D87FF',
                color: "#FFF",
                maxWidth: "200px",
                border: '1px solid #ccc'
            }
        },
        {
            title: 'Contact', field: 'studentDetails.phoneNumber',
            cellStyle: {
                maxWidth: "200px",
                border: '1px solid #ccc'
            },
            headerStyle: {
                backgroundColor: '#5D87FF',
                color: "#FFF",
                maxWidth: "200px",
                border: '1px solid #ccc'
            }
        },
        {
            title: 'Due Amount', field: 'dueTotal', render: (row) => {
                return <Typography level="title-lg" color="danger" >₹{row.dueTotal}</Typography>
            },
            cellStyle: {
                maxWidth: "200px",
                border: '1px solid #ccc'
            },
            headerStyle: {
                backgroundColor: '#5D87FF',
                color: "#FFF",
                maxWidth: "200px",
                border: '1px solid #ccc'
            }
        },
        {
            title: 'Last Follow Up', field: 'dueTotal', render: (row) => {
                return (
                    <>
                        <Chip variant="solid" color="success" >
                            25/02/2025
                        </Chip>
                    </>
                )
            },
            cellStyle: {
                maxWidth: "200px",
                border: '1px solid #ccc',

            },
            headerStyle: {
                backgroundColor: '#5D87FF',
                color: "#FFF",
                maxWidth: "200px",
                border: '1px solid #ccc'
            }
        },

    ];



    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <PageHeaderWithHelpButton title="Fee Dues Follow Up With Parents" />

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

                </Box>

                <br />

                <MaterialTable
                    columns={baseColumns}
                    data={dueList}
                    options={{
                        actionsColumnIndex: -1,
                        pageSizeOptions: [5, 10, 20, 50, 100],
                        pageSize: 10,
                    }}
                    actions={[
                        {
                            icon: () => <PhoneForwarded sx={{ color: "var(--bs-primary)" }} />,
                            tooltip: "Edit Row",
                            onClick: (event, rowData: any) => {
                            },
                        },
                    ]}
                />

                {/* <FollowUpModal
                    open={true}
                    onClose={() => { }}
                /> */}

            </LSPage>
        </PageContainer>
    )
}

export default FeeDueFollowUp