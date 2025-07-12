import { styled } from "@mui/material/styles";
import { SCHOOL_CLASSES, SchoolClass } from "config/schoolConfig";


export interface ExamSession {
    session: string;
    subjects: { [className: string]: string };
}

export interface ExamData {
    date: string;
    sessions: ExamSession[];
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
});

const Th = styled("th")({
    padding: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#f4f4f4",
    textAlign: "center",
});

const Td = styled("td")({
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "center",
});

const Tr = styled("tr")(({ theme }) => ({
    "&:nth-of-type(even)": {
        backgroundColor: "#fafafa",
    },
    "&:hover": {
        backgroundColor: "#f1f1f1",
    },
}));

const ExamPlannerTable: React.FC = () => {
    return (

        <Table >
            <thead>
                <Tr>
                    <Th>Sl</Th>
                    <Th rowSpan={2}>Date</Th>
                    <Th rowSpan={2}>Seating</Th>
                    {SCHOOL_CLASSES.map((item: SchoolClass) => (
                        <Th key={item.id}>{item.title}</Th>
                    ))}
                </Tr>
            </thead>
            <tbody>
                {examData.map((exam: ExamData, index: number) =>
                    exam.sessions.map((session: ExamSession, sIndex: number) => (
                        <Tr key={`${index}-${sIndex}`}>
                            {sIndex === 0 && (
                                <Td rowSpan={exam.sessions.length}>{index + 1}</Td>
                            )}
                            {sIndex === 0 && <Td rowSpan={exam.sessions.length}>{exam.date}</Td>}
                            <Td>{session.session}</Td>

                            {SCHOOL_CLASSES.map((item: SchoolClass) => (
                                <Td key={`${index}-${sIndex}-${item.id}`}>
                                    {session.subjects[item.title] || "-"}
                                </Td>
                            ))}
                        </Tr>
                    ))
                )}
            </tbody>
        </Table>

    );
};
export default ExamPlannerTable;