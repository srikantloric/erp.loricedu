import { Chip } from "@mui/joy"
import { StudentDetailsType } from "types/student"
import { getClassNameByValue } from "utilities/UtilitiesFunctions"
type StudentWithResult = StudentDetailsType & {
    latestResultMark: number;
    newClassRoll: number
};
export const ROLL_TABLE_COLS_SORT_ALPHA = [

    { title: "Student Id", field: "admission_no" },
    { title: "Student Name", field: "student_name" },
    {
        title: "Class", field: "class", render: (row: StudentDetailsType) => {
            return getClassNameByValue(row.class!)
        }
    },
    {
        title: "Section", field: "section"
    },

    // {
    //     title: "Marks Obtained Last Exam", field: "latestResultMark",
    // },
    {
        title: "Current Roll", field: "class_roll", render: (row: StudentWithResult) => {
            return (
                <Chip color="primary" variant="plain" sx={{ fontSize: "18px" }}>{row.class_roll}</Chip>
            )
        }
    },
    {
        title: "New Roll", field: "newClassRoll", render: (row: StudentWithResult) => {
            return (
                <Chip color="success" variant="solid" sx={{ fontSize: "18px" }}>{row.newClassRoll}</Chip>
            )
        }
    },
]
export const ROLL_TABLE_COLS_SORT_EXAM = [

    { title: "Student Id", field: "admission_no" },
    { title: "Student Name", field: "student_name" },
    {
        title: "Class", field: "class", render: (row: StudentDetailsType) => {
            return getClassNameByValue(row.class!)
        }
    },
    {
        title: "Section", field: "section"
    },

    // {
    //     title: "Marks Obtained Last Exam", field: "latestResultMark",
    // },
    {
        title: "Current Roll", field: "class_roll", render: (row: StudentWithResult) => {
            return (
                <Chip color="primary" variant="plain" sx={{ fontSize: "18px" }}>{row.class_roll}</Chip>
            )
        }
    },
    {
        title: "New Roll", field: "newClassRoll", render: (row: StudentWithResult) => {
            return (
                <Chip color="success" variant="solid" sx={{ fontSize: "18px" }}>{row.newClassRoll}</Chip>
            )
        }
    },
]
