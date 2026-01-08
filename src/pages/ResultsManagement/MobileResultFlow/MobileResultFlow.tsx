import {
    Box,
    Button,
    IconButton,
    Input,
    Option,
    Select,
    Stack,
    Typography,
} from "@mui/joy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneIcon from "@mui/icons-material/Done";
import SaveIcon from "@mui/icons-material/Save";
import { WarningAmber } from "@mui/icons-material";
import { StudentDetailsType } from "types/student";
import { ExamPaper } from "types/exam";
import { ResultsState } from "pages/ResultsManagement/UpdateResult";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { saveResults } from "components/Tables/StudentsResultUpdateTable";
import { Timestamp } from "firebase/firestore";

/* ---------------- TYPES ---------------- */

interface Props {
    students: StudentDetailsType[];
    papers: ExamPaper[];
    results: ResultsState;
    setResults: React.Dispatch<React.SetStateAction<ResultsState>>;
    selectedExam: string;
    selectedExamTitle: string;
    savedStudents: Set<string>;
    setSavedStudents: React.Dispatch<React.SetStateAction<Set<string>>>;
    studentStatus: Record<string, "pending" | "review" | "completed">;
}

/* ---------------- COMPONENT ---------------- */

export default function MobileResultFlow({
    students,
    papers,
    results,
    setResults,
    selectedExam,
    selectedExamTitle,
    setSavedStudents,
    studentStatus,
}: Props) {
    const [selectedStudent, setSelectedStudent] =
        useState<StudentDetailsType | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    /* ---------------- STATUS STYLES ---------------- */

    const statusBorderColor = {
        pending: "neutral.outlinedBorder",
        review: "warning.outlinedBorder",
        completed: "success.outlinedBorder",
    };

    /* ---------------- INPUT HANDLERS ---------------- */

    const handleMarksChange = (
        studentId: string,
        paperId: string,
        field: "theory" | "practical",
        value: string,
        max: number
    ) => {
        const num = value === "" ? "" : Number(value);
        if (num !== "" && (num < 0 || num > max)) return;

        setSavedStudents(prev => {
            const s = new Set(prev);
            s.delete(studentId);
            return s;
        });

        setResults(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [paperId]: {
                    ...prev[studentId]?.[paperId],
                    [field]: num,
                },
            },
        }));
    };

    const handleGradeChange = (
        studentId: string,
        paperId: string,
        value: string | null
    ) => {
        if (!value) return;

        setSavedStudents(prev => {
            const s = new Set(prev);
            s.delete(studentId);
            return s;
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

    /* ---------------- COMPLETENESS CHECK ---------------- */

    const isStudentResultComplete = (studentId: string): boolean => {
        return papers.every(paper => {
            const r = results[studentId]?.[paper.paperId];
            if (!r) return false;

            // Grade-based paper
            if (paper.scoreType === "grade") {
                return !!r.grade;
            }

            // Marks-based paper
            const theoryValid =
                r.theory !== "" && r.theory !== null && r.theory !== undefined;

            const practicalValid =
                paper.maxPractical > 0
                    ? r.practical !== "" &&
                    r.practical !== null &&
                    r.practical !== undefined
                    : true;

            return theoryValid && practicalValid;
        });
    };

    /* ---------------- SAVE ---------------- */

    const handleSave = async (
        student: StudentDetailsType,
        status: "review" | "completed"
    ) => {
        setIsSaving(true);

        const payload = [
            {
                studentId: student.id,
                examId: selectedExam,
                examTitle: selectedExamTitle,
                status,
                createdAt: Timestamp.now(),
                result: papers.map(p => ({
                    paperId: p.paperId,
                    paperTitle: p.paperTitle,
                    ...(p.scoreType === "grade"
                        ? { grade: results[student.id]?.[p.paperId]?.grade ?? "" }
                        : {
                            theory:
                                results[student.id]?.[p.paperId]?.theory ?? "",
                            practical:
                                results[student.id]?.[p.paperId]?.practical ??
                                "",
                        }),
                })),
            },
        ];

        const res = await saveResults(payload, selectedExam, status);

        if (res.success) {
            enqueueSnackbar(
                status === "completed"
                    ? "Final submission completed"
                    : "Saved for review",
                { variant: "success" }
            );
            setSavedStudents(prev => new Set(prev).add(student.id));
            setSelectedStudent(null)
        }

        setIsSaving(false);
    };

    /* ---------------- STUDENT LIST ---------------- */

    if (!selectedStudent) {
        return (
            <Stack spacing={1.5}>
                {students.map(s => (
                    <Box
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        sx={{
                            p: 1.5,
                            borderRadius: 10,
                            border: "1px solid",
                            borderColor:
                                statusBorderColor[
                                studentStatus[s.id] ?? "pending"
                                ],
                            cursor: "pointer",
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Box>
                                <Typography fontWeight={600}>
                                    {s.student_name}
                                </Typography>
                                <Typography fontWeight={400} fontSize={12} >
                                    FATHER: {s.father_name}
                                </Typography>

                                {studentStatus[s.id] === "review" && (
                                    <Typography level="body-xs" color="warning">
                                        Needs Review
                                    </Typography>
                                )}

                                {studentStatus[s.id] === "completed" && (
                                    <Typography level="body-xs" color="success">
                                        Completed
                                    </Typography>
                                )}
                                <Typography level="body-sm">
                                    Roll: {s.class_roll}
                                </Typography>
                            </Box>

                            {studentStatus[s.id] === "completed" && (
                                <DoneIcon color="success" />
                            )}

                            {studentStatus[s.id] === "review" && (
                                <WarningAmber color="warning" />
                            )}
                        </Stack>
                    </Box>
                ))}
            </Stack>
        );
    }

    /* ---------------- MARK ENTRY ---------------- */

    const student = selectedStudent;
    const isComplete = isStudentResultComplete(student.id);

    return (
        <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton onClick={() => setSelectedStudent(null)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography level="title-md">
                    {student.student_name}
                </Typography>
            </Stack>

            {papers.map(paper => {
                const r = results[student.id]?.[paper.paperId] ?? {};

                return (
                    <Box
                        key={paper.paperId}
                        sx={{
                            p: 2,
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <Typography fontWeight={600}>
                            {paper.paperTitle}
                        </Typography>

                        {paper.scoreType === "grade" ? (
                            <Select
                                value={r.grade ?? ""}
                                onChange={(e, val) =>
                                    handleGradeChange(
                                        student.id,
                                        paper.paperId,
                                        val
                                    )
                                }
                            >
                                {paper.grade?.map(g => (
                                    <Option key={g} value={g}>
                                        {g}
                                    </Option>
                                ))}
                            </Select>
                        ) : (
                            <Stack spacing={1}>
                                <Input
                                    type="number"
                                    placeholder={`Theory (Max ${paper.maxTheory})`}
                                    value={r.theory ?? ""}
                                    onChange={e =>
                                        handleMarksChange(
                                            student.id,
                                            paper.paperId,
                                            "theory",
                                            e.target.value,
                                            paper.maxTheory
                                        )
                                    }
                                />

                                {paper.maxPractical > 0 && (
                                    <Input
                                        type="number"
                                        placeholder={`Practical (Max ${paper.maxPractical})`}
                                        value={r.practical ?? ""}
                                        onChange={e =>
                                            handleMarksChange(
                                                student.id,
                                                paper.paperId,
                                                "practical",
                                                e.target.value,
                                                paper.maxPractical
                                            )
                                        }
                                    />
                                )}

                                <Typography level="body-sm">
                                    Total:{" "}
                                    {(Number(r.theory) || 0) +
                                        (Number(r.practical) || 0)}
                                </Typography>
                            </Stack>
                        )}
                    </Box>
                );
            })}

            {/* ---------- ACTION BUTTONS ---------- */}

            {!isComplete && (
                <Typography
                    level="body-xs"
                    color="warning"
                    sx={{ textAlign: "center" }}
                >
                    Enter marks for all subjects (use 0 if absent) to enable Final
                    Submit
                </Typography>
            )}

            <Box sx={{ position: "sticky", bottom: 0, bgcolor: "#fff", py: 1 }}>
                <Stack direction="row" spacing={1}>
                    {!isComplete && (
                        <Button
                            fullWidth
                            variant="soft"
                            loading={isSaving}
                            onClick={() => handleSave(student, "review")}
                        >
                            Save for Review
                        </Button>
                    )}

                    {isComplete && (
                        <Button
                            fullWidth
                            startDecorator={<SaveIcon />}
                            loading={isSaving}
                            onClick={() => handleSave(student, "completed")}
                        >
                            Final Submit
                        </Button>
                    )}
                </Stack>
            </Box>
        </Stack>
    );
}
