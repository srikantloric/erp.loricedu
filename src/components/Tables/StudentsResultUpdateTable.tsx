import MaterialTable from "@material-table/core"
import { Avatar, Stack, Typography } from "@mui/joy";
// import EditableMarksInput from "components/FormsUi/Textfield/EditableMarksInput";
import { examPapers } from "pages/ResultsManagement/UpdateResultBulk";
import { StudentDetailsType } from "types/student";

type TableProps = {
    studentData: StudentDetailsType[];
    examPapers: examPapers[];
}

const StudentsResultUpdateTable: React.FC<TableProps> = ({ studentData, examPapers }) => {

    const staticColumns = [
        {
            title: "Id", field: "studentId", render: (rowData: StudentDetailsType) => (
                <Stack direction={"row"} spacing={1} alignItems="center">
                    <Avatar src="A"></Avatar>
                    <Stack>
                        <Typography
                            level="body-lg"
                            sx={{ color: "#000", fontWeight: "500" }}
                        >
                            {rowData.student_name}
                        </Typography>
                        <Typography
                            level="body-sm"
                            sx={{ color: "#000" }}
                        >
                            {rowData.admission_no}
                        </Typography>
                    </Stack>
                </Stack>
            )
        },
    ];

    // Dynamic columns for each exam paper
    const dynamicColumns = examPapers.map((paper) => ({
        title: paper.paperTitle,
        field: paper.paperId,
        render: (rowData: any) => {
            return (
                <Stack>
                    {/* <EditableMarksInput helperText="Theory"/> */}
                    {/* <EditableMarksInput helperText="Practical"/> */}

                </Stack>
            );
        }
    }));

    const feeHeadColumns = [
        ...staticColumns,
        ...dynamicColumns
    ];



    return (
        <MaterialTable
            style={{
                display: "grid",
                overflow: "hidden",
                borderLeft: "1px solid oklch(.905 .013 255.508)",
                borderRight: "1px solid oklch(.905 .013 255.508)",
                borderTop: "1px solid oklch(.905 .013 255.508)",
                borderRadius: "10px 10px 0 0",
                boxShadow: "none",
            }}
            columns={feeHeadColumns}
            data={studentData}
            title="Fee Head List"
            options={{
                grouping: false,
                padding: "dense",
                search: false,
                paging: false,
                headerStyle: {
                    backgroundColor: "#5d87ff",
                    color: "#FFF",
                },
            }}
        />
    )
}

export default StudentsResultUpdateTable