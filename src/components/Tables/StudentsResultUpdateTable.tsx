
import { Done, Save } from '@mui/icons-material';
import { IconButton, Input, Option, Select, Tooltip } from '@mui/joy';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/FormsUi/Table/Table';
import { getFirestoreInstance } from 'context/firebaseUtility';
import { doc, Timestamp, writeBatch } from 'firebase/firestore';
import { enqueueSnackbar } from 'notistack';
import { ResultsState } from 'pages/ResultsManagement/UpdateResult';
import React, { useState, useTransition } from 'react';
import { ExamPaper } from 'types/exam';
import { ResultStatus, resultTypeNew } from 'types/results';
import { StudentDetailsType } from 'types/student';



interface StudentResultsTableProps {
    students: StudentDetailsType[];
    papers: ExamPaper[];
    results: ResultsState,
    setResults: React.Dispatch<React.SetStateAction<ResultsState>>
    selectedExam: string,
    savedStudents: Set<string>;
    setSavedStudents: React.Dispatch<React.SetStateAction<Set<string>>>
    selectedExamTitle: string
}

// Inline style objects
const tableContainerStyle: React.CSSProperties = {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#fff",
};

const stickyLeftStyle = {
    position: "sticky" as const,
    left: 0,
    background: "#fff",
    zIndex: 10,
    fontWeight: 500,
    minWidth: 200,
};

const stickyRightStyle = {
    position: "sticky" as const,
    right: 0,
    background: "#fff",
    zIndex: 10,
    minWidth: 120,
    textAlign: "center" as const,
    fontWeight: 500,
    borderLeft: "1px solid #e5e7eb",
};

const headCellStyle = {
    fontWeight: 700,
    textAlign: "center" as const,
    borderLeft: "1px solid #e5e7eb",
};


const inputStyle = {
    width: 96,
    padding: "6px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: "1rem",
};

const errorInputStyle = {
    ...inputStyle,
    border: "1px solid #dc2626",
    boxShadow: "0 0 0 2px #fee2e2",
};

const studentIdStyle = {
    fontSize: "0.9em",
    color: "#6b7280",
};

const totalCellStyle = {
    fontWeight: 600,
    fontSize: "1.1rem",
};


export async function saveResults(results: any[], selectedExam: string, status: ResultStatus): Promise<{ success: boolean; message: string }> {
    console.log('Saving results to Firestore:', results);

    if (!results || results.length === 0) {
        return { success: false, message: 'No results to save.' };
    }
    const db = await getFirestoreInstance()
    try {
        const batch = writeBatch(db);
        results.forEach(result => {

            const studentRef = doc(db, 'STUDENTS', `${result.studentId}`);
            const resRef = doc(studentRef, "PUBLISHED_RESULTS", selectedExam);

            batch.set(resRef, {
                ...result,
                status,
                updatedAt: Timestamp.now(),
            }, { merge: true });
        });

        await batch.commit();
        console.log(`${results.length} result(s) saved successfully to Firestore.`);
        return { success: true, message: 'Results saved successfully!' };

    } catch (error) {
        console.error('Error saving results to Firestore:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to save results. ${message}` };
    }
}


export default function StudentResultsTable({ students, papers, results, setResults, selectedExam, selectedExamTitle, savedStudents, setSavedStudents }: StudentResultsTableProps) {
    const [_savingId, setSavingId] = useState<string | null>(null)
    const [_, startSaving] = useTransition();


    const isStudentComplete = (studentId: string): boolean => {
        return papers.every(paper => {
            const r = results[studentId]?.[paper.paperId];
            if (!r) return false;

            if (paper.scoreType === "grade") {
                return !!r.grade;
            }

            const theoryOk = r.theory !== '' && r.theory !== undefined;
            const practicalOk =
                paper.maxPractical > 0
                    ? r.practical !== '' && r.practical !== undefined
                    : true;

            return theoryOk && practicalOk;
        });
    };


    const handleInputChange = (
        studentId: string,
        paperId: string,
        type: 'theory' | 'practical',
        value: string,
        max: number
    ) => {
        const numericValue = value === '' ? '' : parseInt(value, 10);
        if (numericValue !== '' && (isNaN(numericValue) || numericValue < 0)) return;
        if (numericValue !== '' && numericValue > max) return;

        setSavedStudents(prev => {
            const newSet = new Set(prev);
            newSet.delete(studentId);
            return newSet;
        });

        setResults(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [paperId]: {
                    ...prev[studentId]?.[paperId],
                    [type]: numericValue,
                },
            },
        }));
    };

    const handleGradeChange = (studentId: string, paperId: string, value: string | null) => {
        if (!value) return
        setSavedStudents(prev => {
            const newSet = new Set(prev);
            newSet.delete(studentId);
            return newSet;
        });

        setResults(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [paperId]: {
                    ...prev[studentId]?.[paperId],
                    grade: value,
                },
            },
        }));
    };

    const handleSave = (student: StudentDetailsType, status: ResultStatus) => {
        const id = student.id || 'all';
        setSavingId(id);

        const save = async () => {
            const studentsToSave = id ? students.filter(s => s.id === id) : students;

            let resultsToSave: resultTypeNew[] = studentsToSave.map(student => {
                const studentResults: any[] = papers.map(paper => ({
                    paperId: paper.paperId,
                    paperTitle: paper.paperTitle,
                    ...(
                        paper.scoreType === "grade"
                            ? { grade: results[student.id]?.[paper.paperId]?.grade ?? '' }
                            : {
                                theory: results[student.id]?.[paper.paperId]?.theory ?? '',
                                practical: results[student.id]?.[paper.paperId]?.practical ?? '',
                            }
                    ),
                }));

                return {
                    studentId: student.id,
                    examId: selectedExam,
                    examTitle: selectedExamTitle,
                    createdAt: Timestamp.now(),
                    result: studentResults,
                };
            });

            if (resultsToSave.length === 0) {
                enqueueSnackbar("Nothing to save, no marks have been entered.")
                setSavingId(null);
                return;
            }

            const response = await saveResults(resultsToSave, selectedExam, status);
            if (response.success) {
                enqueueSnackbar("Success", { variant: "success" });

                // Add studentId(s) to saved list
                setSavedStudents(prev => {
                    const newSet = new Set(prev);
                    studentsToSave.forEach(s => newSet.add(s.id));
                    return newSet;
                });
            } else {
                enqueueSnackbar("Failed to save", { variant: "error" });
            }
            setSavingId(null);
        };

        startSaving(() => {
            void save();
        });
    };


    return (
        <>
            <div style={tableContainerStyle}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead style={stickyLeftStyle} rowSpan={2}>Student</TableHead>
                            {papers.map(paper => (
                                <TableHead

                                    key={paper.paperId}
                                    style={{
                                        ...headCellStyle,
                                        fontWeight: 700,
                                        minWidth: paper.maxPractical > 0 ? 360 : 240,
                                    }}
                                    colSpan={paper.maxPractical > 0 ? 3 : 2}
                                >
                                    {paper.paperTitle}
                                </TableHead>
                            ))}
                            <TableHead style={stickyRightStyle} rowSpan={2}>Actions</TableHead>
                        </TableRow>
                        <TableRow>
                            {papers.map(paper => (
                                <React.Fragment key={`${paper.paperId}-sub`}>
                                    {paper.scoreType === "grade" ? (
                                        <>
                                            <TableHead style={{ ...headCellStyle, minWidth: 240 }} colSpan={2}>Grade</TableHead>
                                        </>
                                    ) : (
                                        <>
                                            <TableHead style={{ ...headCellStyle, minWidth: 120 }}>Theory ({paper.maxTheory})</TableHead>
                                            {paper.maxPractical > 0 && (
                                                <TableHead style={{ ...headCellStyle, minWidth: 120 }}>Practical ({paper.maxPractical})</TableHead>
                                            )}
                                            <TableHead style={{ ...headCellStyle, minWidth: 100 }}>Total</TableHead>
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(student => {
                            const complete = isStudentComplete(student.id);
                            return (
                                <TableRow key={student.id}>
                                    <TableCell style={stickyLeftStyle}>
                                        <div style={{ fontWeight: 500 }}>{student.student_name}</div>
                                        <div style={studentIdStyle}>ID: {student.admission_no}</div>
                                        <div style={studentIdStyle}>Roll: {student.rollNumber}</div>
                                    </TableCell>
                                    {papers.map(paper => {
                                        const result = results[student.id]?.[paper.paperId];
                                        const theory = result?.theory ?? '';
                                        const practical = result?.practical ?? '';
                                        const grade = result?.grade ?? '';

                                        return (
                                            <React.Fragment key={`${student.id}-${paper.paperId}`}>
                                                {paper.scoreType === "grade" ? (
                                                    <>
                                                        <TableCell colSpan={2} style={{ textAlign: "center" }}>
                                                            <Select

                                                                value={grade}
                                                                onChange={(e, val) =>
                                                                    handleGradeChange(student.id, paper.paperId, val)
                                                                }
                                                            >
                                                                {paper.grade && paper.grade.map((grade) => {
                                                                    return (
                                                                        <Option value={grade} key={grade}>
                                                                            {grade}
                                                                        </Option>
                                                                    )
                                                                })}
                                                            </Select>

                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell style={{ borderLeft: "1px solid #e5e7eb" }}>
                                                            <Input
                                                                type="number"
                                                                value={theory}
                                                                onChange={e =>
                                                                    handleInputChange(student.id, paper.paperId, 'theory', e.target.value, paper.maxTheory)
                                                                }
                                                                style={Number(theory) > paper.maxTheory ? errorInputStyle : inputStyle}
                                                            />
                                                        </TableCell>
                                                        {paper.maxPractical > 0 && (
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={practical}
                                                                    onChange={e =>
                                                                        handleInputChange(student.id, paper.paperId, 'practical', e.target.value, paper.maxPractical)
                                                                    }
                                                                    style={Number(practical) > paper.maxPractical ? errorInputStyle : inputStyle}
                                                                />
                                                            </TableCell>
                                                        )}
                                                        <TableCell style={totalCellStyle}>
                                                            {(Number(theory) || 0) + (Number(practical) || 0)}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                    <TableCell style={{
                                        ...stickyRightStyle,
                                    }} >
                                        {savedStudents.has(student.id) ? (
                                            <Done color="success" />
                                        ) : complete ? (
                                            <Tooltip title="Final Submit">
                                                <IconButton
                                                    color="success"
                                                    onClick={() => handleSave(student, "completed")}
                                                >
                                                    <Save />
                                                </IconButton>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Save for Review" placement='left' >
                                                <IconButton
                                                    color="warning"
                                                    onClick={() => handleSave(student, "review")}
                                                >
                                                    <Save />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}