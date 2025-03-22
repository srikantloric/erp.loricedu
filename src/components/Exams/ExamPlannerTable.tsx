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
        date: "06/03/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery":"HINDI",
                    "Nursery":"HINDI",
                    "LKG":"ENGLISH",
                    "UKG":"MATHS",

                    "STD-1": "HINDI",
                    "STD-2": "ENGLISH",
                    "STD-3": "MATH",
                    "STD-4": "SCIENCE",
                    "STD-5": "SST",
                    "STD-6": "COMPUTER",
                },
            }, 
        ],
    },
    {
        date: "07/03/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery":"ENGLISH",
                    "Nursery":"ENGLISH",
                    "LKG":"MATHS",
                    "UKG":"HINDI",

                    "STD-1": "ENGLISH",
                    "STD-2": "MATHS",
                    "STD-3": "SCIENCE",
                    "STD-4": "SST",
                    "STD-5": "COMPUTER",
                    "STD-6": "HINDI",
                },
            }, 
        ],
    },
    {
        date: "08/03/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery":"MATHS",
                    "Nursery":"MATHS",
                    "LKG":"HINDI",
                    "UKG":"ENGLISH",

                    "STD-1": "MATHS",
                    "STD-2": "SCIENCE",
                    "STD-3": "SST",
                    "STD-4": "COMPUTER",
                    "STD-5": "HINDI",
                    "STD-6": "ENGLISH",
                },
            }, 
        ],
    },
    {
        date: "10/03/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery":"DRAWING",
                    "Nursery":"DRAWING",
                    "LKG":"DRAWING",
                    "UKG":"DRAWING",

                    "STD-1": "SCIENCE",
                    "STD-2": "SST",
                    "STD-3": "COMPUTER",
                    "STD-4": "HINDI",
                    "STD-5": "ENGLISH",
                    "STD-6": "MATHS",
                },
            }, 
        ],
    },
    {
        date: "11/03/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery":"ORAL",
                    "Nursery":"ORAL",
                    "LKG":"ORAL",
                    "UKG":"ORAL",

                    "STD-1": "SST",
                    "STD-2": "COMPUTER",
                    "STD-3": "HINDI",
                    "STD-4": "ENGLISH",
                    "STD-5": "MATHS",
                    "STD-6": "SCIENCE",
                },
            }, 
        ],
    },
    {
        date: "12/03/2025",
        sessions: [
            {
                session: "1st",
                subjects: {
                    "Pre-Nursery":"ORAL",
                    "Nursery":"ORAL",
                    "LKG":"ORAL",
                    "UKG":"ORAL",
                    "STD-1": "COMPUTER",
                    "STD-2": "HINDI",
                    "STD-3": "ENGLISH",
                    "STD-4": "MATHS",
                    "STD-5": "SCIENCE",
                    "STD-6": "SST.",
                },
            }, 
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