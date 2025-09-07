import { Edit, Print } from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/joy";
import { styled } from "@mui/material/styles";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";


export interface ExamSession {
    session: string;
    subjects: { [className: string]: string };
}

export interface ExamData {
    date: string;
    sessions: ExamSession[];
}
interface ExamPlannerTableProps {
    examTitle?: string;
    examDescription?: string;
    schedule: any,
    examId: string,
    classList: string[]
}

export const examData: ExamData[] = [

    {
        date: "16/07/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "STD-2": "ENGLISH",
                    "STD-3": "ENGLISH",
                    "STD-4": "ENGLISH",
                    "STD-5": "MATHS",
                    "STD-6": "MATHS",
                    "STD-7": "MATHS",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-2": "HINDI",
                    "STD-3": "HINDI",
                    "STD-4": "HINDI",
                    "STD-5": "G.K",
                    "STD-6": "G.K",
                    "STD-7": "G.K",
                },
            }
        ],
    },
    {
        date: "17/07/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "HINDI",
                    "Nursery": "HINDI",
                    "LKG": "HINDI",
                    "UKG": "HINDI",
                    "STD-1": "HINDI",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "Pre-Nursery": "ORAL",
                    "Nursery": "ORAL",
                    "LKG": "ORAL",
                    "UKG": "ORAL",
                    "STD-1": "ENGLISH",
                },
            }
        ],
    },
    {
        date: "18/07/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "STD-2": "MATHS",
                    "STD-3": "MATHS",
                    "STD-4": "MATHS",
                    "STD-5": "SCIENCE",
                    "STD-6": "SCIENCE",
                    "STD-7": "SCIENCE",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-2": "G.K",
                    "STD-3": "G.K",
                    "STD-4": "G.K",
                    "STD-5": "COMPUTER",
                    "STD-6": "COMPUTER",
                    "STD-7": "COMPUTER",
                },
            }
        ],
    },
    {
        date: "19/07/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "ENGLISH",
                    "Nursery": "ENGLISH",
                    "LKG": "ENGLISH",
                    "UKG": "ENGLISH",
                    "STD-1": "MATHS",

                },
            },
            {
                session: "2nd",
                subjects: {
                    "Pre-Nursery": "ORAL",
                    "Nursery": "ORAL",
                    "LKG": "ORAL",
                    "UKG": "ORAL",
                    "STD-1": "G.K",
                },
            }
        ],
    },
    {
        date: "21/07/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "STD-2": "S.ST",
                    "STD-3": "S.ST",
                    "STD-4": "S.ST",
                    "STD-5": "ENGLISH",
                    "STD-6": "ENGLISH",
                    "STD-7": "ENGLISH",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-2": "COMPUTER",
                    "STD-3": "COMPUTER",
                    "STD-4": "COMPUTER",
                    "STD-5": "HINDI",
                    "STD-6": "HINDI",
                    "STD-7": "HINDI",
                },
            }
        ],
    },
    {
        date: "22/07/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "MATHS",
                    "Nursery": "MATHS",
                    "LKG": "MATHS",
                    "UKG": "MATHS",
                    "STD-1": "S.ST",

                },
            },
            {
                session: "2nd",
                subjects: {
                    "Pre-Nursery": "ORAL",
                    "Nursery": "ORAL",
                    "LKG": "ORAL",
                    "UKG": "G.K",
                    "STD-1": "COMPUTER",
                },
            }
        ],
    },
    {
        date: "23/07/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "STD-2": "SCIENCE",
                    "STD-3": "SCIENCE",
                    "STD-4": "SCIENCE",
                    "STD-5": "S.ST",
                    "STD-6": "S.ST",
                    "STD-7": "S.ST",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-2": "DRAWING",
                    "STD-3": "DRAWING",
                    "STD-4": "DRAWING",
                    "STD-5": "DRAWING",
                    "STD-6": "DRAWING",
                    "STD-7": "DRAWING",
                },
            }
        ],
    },
    {
        date: "24/07/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "DRAWING",
                    "Nursery": "DRAWING",
                    "LKG": "DRAWING",
                    "UKG": "DRAWING",
                    "STD-1": "SCIENCE",

                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-1": "DRAWING",
                },
            }
        ],
    },

];

const Table = styled("table")({
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "12px",
});

const Th = styled("th")({
    padding: "4px 6px",
    border: "1px solid #ddd",
    backgroundColor: "#f4f4f4",
    textAlign: "center",
    fontSize: "12px",
});

const Td = styled("td")({
    padding: "4px 6px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontSize: "12px",
});

const Tr = styled("tr")({
    "&:nth-of-type(even)": {
        backgroundColor: "#fafafa",
    },
    "&:hover": {
        backgroundColor: "#f1f1f1",
    },
});


const printTable = (examTitle?: string, examDescription?: string) => {
    const printContent = document.getElementById("exam-table");
    if (!printContent) return;

    const newWindow = window.open("", "", "width=900,height=700");
    if (!newWindow) return;

    newWindow.document.write(`
    <html>
      <head>
        <title>Print Exam Planner</title>
        <style>
          @media print {
            @page { size: landscape; }
          }
        footer {
              position: fixed;
              bottom: 0;
              width: 100%;
              text-align: center;
              font-weight: bold;
            }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 4px 6px;
            text-align: center;
          }
          th {
            background-color: #f4f4f4;
          }
          .header{
            text-align:center
          }  
        </style>
      </head>
      <body>
       <h1 class="header">Examination Schedule</h1>
       ${examTitle ? `<h3 class="header">${examTitle}</h3>` : ""}
        ${printContent.outerHTML}
        <br/>
        <footer>Powered by LoricEdu</footer>
      </body>
    </html>
  `);

    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
};



const ExamScheduleTable: React.FC<ExamPlannerTableProps> = ({ examTitle, examId, examDescription, schedule, classList }) => {


    const navigate = useNavigate()

    const handleEditSchedule = () => {

        if (examId) {

            navigate({
                pathname: "/schoolResults/add-exam",
                search: `?examId=${examId}`
            });
        } else {
            enqueueSnackbar("Unable to edit,please check with admin!", { variant: "error" })
        }

    }

    return (
        <div>
            <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                <Typography level="title-md" mb={1}>Exam Schedule</Typography>
                <Stack direction={"row"} spacing={2} alignItems={"center"}>
                    <IconButton
                        onClick={() => printTable(examTitle, examDescription)}
                    >
                        <Print />
                    </IconButton>
                    <IconButton
                        onClick={handleEditSchedule}
                    >
                        <Edit />
                    </IconButton>
                </Stack>
            </Stack>
            <div id="exam-table">
                <Table>
                    <thead>
                        <Tr>
                            <Th>Sl</Th>
                            <Th rowSpan={2}>Date</Th>
                            <Th rowSpan={2}>Seating</Th>
                            {classList.map((item) => (
                                <Th key={item}>{item}</Th>
                            ))}
                        </Tr>
                    </thead>
                    <tbody>
                        {schedule && schedule.papers?.map((exam: any, index: number) =>
                            exam.sessions.map((session: any, sIndex: number) => (
                                <Tr key={`${index}-${sIndex}`}>
                                    {sIndex === 0 && <Td rowSpan={exam.sessions.length}>{index + 1}</Td>}
                                    {sIndex === 0 && <Td rowSpan={exam.sessions.length}>{exam.date}</Td>}
                                    <Td>{session.session}</Td>
                                    {classList.map((item) => (
                                        <Td key={`${index}-${sIndex}-${item}`}>
                                            {session.subjects[item] || "-"}
                                        </Td>
                                    ))}
                                </Tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default ExamScheduleTable;