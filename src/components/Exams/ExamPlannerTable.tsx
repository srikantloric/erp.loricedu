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
        date: "23/06/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "ENGLISH",
                    "Nursery": "MATHS",
                    "LKG": "DRAWING",
                    "UKG": "HINDI",

                    "STD-1": "ENGLISH",
                    "STD-2": "MATHS",
                    "STD-3": "SCIENCE",
                    "STD-4": "SST",
                    "STD-5": "COMPUTER",
                    "STD-6": "G.K + CONV.",
                    "STD-7": "HINDI",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-1": "ORAL",
                    "STD-2": "ORAL",
                    "STD-3": "ORAL",
                    "STD-4": "ORAL",
                    "STD-5": "ORAL",
                    "STD-6": "ORAL",
                    "STD-7": "ORAL",
                },
            }
        ],
    },
    {
        date: "24/06/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "MATHS",
                    "Nursery": "DRAWING",
                    "LKG": "HINDI",
                    "UKG": "ENGLISH",

                    "STD-1": "MATHS",
                    "STD-2": "SCIENCE",
                    "STD-3": "SST",
                    "STD-4": "COMPUTER",
                    "STD-5": "G.K + CONV.",
                    "STD-6": "HINDI",
                    "STD-7": "ENGLISH",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-1": "ORAL",
                    "STD-2": "ORAL",
                    "STD-3": "ORAL",
                    "STD-4": "ORAL",
                    "STD-5": "ORAL",
                    "STD-6": "ORAL",
                    "STD-7": "ORAL",
                },
            }
        ],
    },
    {
        date: "25/06/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "DRAWING",
                    "Nursery": "HINDI",
                    "LKG": "ENGLISH",
                    "UKG": "MATHS",

                    "STD-1": "SCIENCE",
                    "STD-2": "SST",
                    "STD-3": "COMPUTER",
                    "STD-4": "G.K + CONV.",
                    "STD-5": "HINDI",
                    "STD-6": "ENGLISH",
                    "STD-7": "MATHS",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-1": "ORAL",
                    "STD-2": "ORAL",
                    "STD-3": "ORAL",
                    "STD-4": "ORAL",
                    "STD-5": "ORAL",
                    "STD-6": "ORAL",
                    "STD-7": "ORAL",
                },
            }
        ],
    },
    {
        date: "26/06/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "ORAL-HINDI",
                    "Nursery": "ORAL-ENGLISH",
                    "LKG": "ORAL-MATHS",
                    "UKG": "ORAL-HINDI",

                    "STD-1": "SST",
                    "STD-2": "COMPUTER",
                    "STD-3": "G.K + CONV.",
                    "STD-4": "HINDI",
                    "STD-5": "ENGLISH",
                    "STD-6": "MATHS",
                    "STD-7": "SCIENCE",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-1": "ORAL",
                    "STD-2": "ORAL",
                    "STD-3": "ORAL",
                    "STD-4": "ORAL",
                    "STD-5": "ORAL",
                    "STD-6": "ORAL",
                    "STD-7": "ORAL",
                },
            }
        ],
    },
    {
        date: "27/06/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "ORAL-ENGLISH",
                    "Nursery": "ORAL-MATHS",
                    "LKG": "ORAL-HINDI",
                    "UKG": "ORAL-ENGLISH",

                    "STD-1": "COMPUTER",
                    "STD-2": "G.K + CONV.",
                    "STD-3": "HINDI",
                    "STD-4": "ENGLISH",
                    "STD-5": "MATHS",
                    "STD-6": "SCIENCE",
                    "STD-7": "SST",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-1": "ORAL",
                    "STD-2": "ORAL",
                    "STD-3": "ORAL",
                    "STD-4": "ORAL",
                    "STD-5": "ORAL",
                    "STD-6": "ORAL",
                    "STD-7": "ORAL",
                },
            }
        ],
    },
    {
        date: "28/06/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "ORAL-MATHS",
                    "Nursery": "ORAL-HINDI",
                    "LKG": "ORAL-ENGLISH",
                    "UKG": "ORAL-MATHS",

                    "STD-1": "G.K + CONV.",
                    "STD-2": "HINDI",
                    "STD-3": "ENGLISH",
                    "STD-4": "MATHS",
                    "STD-5": "SCIENCE",
                    "STD-6": "SST",
                    "STD-7": "COMPUTER",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-1": "ORAL",
                    "STD-2": "ORAL",
                    "STD-3": "ORAL",
                    "STD-4": "ORAL",
                    "STD-5": "ORAL",
                    "STD-6": "ORAL",
                    "STD-7": "ORAL",
                },
            }
        ],
    },
    {
        date: "30/06/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery": "HINDI",
                    "Nursery": "ENGLISH",
                    "LKG": "MATH",
                    "UKG": "DRAWING",

                    "STD-1": "HINDI",
                    "STD-2": "ENGLISH",
                    "STD-3": "MATH",
                    "STD-4": "SCIENCE",
                    "STD-5": "SST",
                    "STD-6": "COMPUTER",
                    "STD-7": "G.K + CONV.",
                },
            },
            {
                session: "2nd",
                subjects: {
                    "STD-1": "ORAL",
                    "STD-2": "ORAL",
                    "STD-3": "ORAL",
                    "STD-4": "ORAL",
                    "STD-5": "ORAL",
                    "STD-6": "ORAL",
                    "STD-7": "ORAL",
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