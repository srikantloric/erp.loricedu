import { Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import { useTheme, useMediaQuery } from "@mui/material";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import StudentsResultUpdateTable from "components/Tables/StudentsResultUpdateTable";
import MobileResultFlow from "./MobileResultFlow/MobileResultFlow";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { useFirebase } from "context/firebaseContext";
import { useNavbar } from "context/NavbarContext";
import { useSidebar } from "context/SidebarContext";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";
import { StudentDetailsType } from "types/student";
import { Exam, ExamPaper } from "types/exam";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";

/* ---------------- TYPES ---------------- */

export type ResultsState = {
  [studentId: string]: {
    [paperId: string]: {
      theory: number | string;
      practical: number | string;
      grade?: string;
    };
  };
};

type StudentStatus = "pending" | "review" | "completed";

/* ---------------- COMPONENT ---------------- */

export default function UpdateResults() {
  const { db } = useFirebase();
  const { session } = useNavbar();
  const { setMini, isMini } = useSidebar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /* ---------------- STATE ---------------- */

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const [students, setStudents] = useState<StudentDetailsType[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamPapers, setSelectedExamPapers] = useState<ExamPaper[]>([]);

  const [results, setResults] = useState<ResultsState>({});
  const [savedStudents, setSavedStudents] = useState<Set<string>>(new Set());
  const [studentStatus, setStudentStatus] =
    useState<Record<string, StudentStatus>>({});
  const [statusFilter, setStatusFilter] =
    useState<StudentStatus | "all">("all");

  const [loading, setLoading] = useState(false);

  /* ---------------- REALTIME SUBSCRIPTIONS ---------------- */

  const unsubscribers = useRef<Unsubscribe[]>([]);

  const cleanupSubscriptions = () => {
    unsubscribers.current.forEach(unsub => unsub());
    unsubscribers.current = [];
  };

  useEffect(() => {
    return () => cleanupSubscriptions();
  }, []);

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    setMini(true);
  }, []);

  // Fetch exams (one-time)
  useEffect(() => {
    const q = query(
      collection(db, "EXAMS"),
      where("examSession", "==", session)
    );

    const unsub = onSnapshot(q, snap => {
      setExams(snap.docs.map(d => d.data() as Exam));
    });

    return () => unsub();
  }, [session]);

  // Fetch exam papers (class based)
  useEffect(() => {
    if (!selectedExam || !exams.length) return;

    const exam = exams.find(e => e.examId === selectedExam);
    if (!exam) return;

    if (!selectedClass) {
      setSelectedExamPapers(exam.papers);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "MASTER_DATA", "masterData"),
      snap => {
        const papersCfg = snap.data()?.papers || [];
        const className = getClassNameByValue(selectedClass);

        const filtered = exam.papers.filter(p =>
          papersCfg.some(
            (c: any) =>
              c.paperId === p.paperId &&
              Array.isArray(c.classes) &&
              c.classes.includes(className)
          )
        );

        setSelectedExamPapers(filtered);
      }
    );

    unsubscribers.current.push(unsub);
  }, [selectedExam, selectedClass, exams]);

  /* ---------------- REALTIME SEARCH ---------------- */

  const handleSearch = () => {
    if (!selectedClass || !selectedExam) {
      enqueueSnackbar("Please select class and exam", { variant: "warning" });
      return;
    }

    setLoading(true);
    cleanupSubscriptions();

    const studentsQuery = query(
      collection(db, "STUDENTS"),
      where("class", "==", selectedClass),
      where("is_active", "==", true)
    );

    const unsubStudents = onSnapshot(studentsQuery, snap => {
      const fetchedStudents = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as StudentDetailsType[];

      setStudents(fetchedStudents);

      fetchedStudents.forEach(student => {
        const resRef = doc(
          db,
          "STUDENTS",
          student.id,
          "PUBLISHED_RESULTS",
          selectedExam
        );

        const unsubResult = onSnapshot(resRef, snap => {
          setResults(prev => {
            const next = { ...prev };

            if (!snap.exists()) {
              delete next[student.id];
              return next;
            }

            const data = snap.data();
            next[student.id] = {};

            if (Array.isArray(data.result)) {
              data.result.forEach((r: any) => {
                next[student.id][r.paperId] = {
                  theory: r.theory ?? "",
                  practical: r.practical ?? "",
                  ...(r.grade ? { grade: r.grade } : {}),
                };
              });
            }

            return next;
          });

          setStudentStatus(prev => ({
            ...prev,
            [student.id]: snap.exists()
              ? snap.data().status ?? "completed"
              : "pending",
          }));

          setSavedStudents(prev => {
            const s = new Set(prev);
            snap.exists() ? s.add(student.id) : s.delete(student.id);
            return s;
          });

          setLoading(false);
        });

        unsubscribers.current.push(unsubResult);
      });
    });

    unsubscribers.current.push(unsubStudents);
  };

  /* ---------------- RESET ---------------- */

  const handleReset = () => {
    cleanupSubscriptions();

    setStudents([]);
    setResults({});
    setSavedStudents(new Set());
    setStudentStatus({});
    setSelectedClass(null);
    setSelectedExam(null);
    setStatusFilter("all");
  };

  /* ---------------- FILTERING ---------------- */

  const filteredStudents = students.filter(s => {
    if (statusFilter === "all") return true;
    return studentStatus[s.id] === statusFilter;
  });

  const statusCounts = {
    all: students.length,
    pending: students.filter(s => studentStatus[s.id] === "pending").length,
    review: students.filter(s => studentStatus[s.id] === "review").length,
    completed: students.filter(s => studentStatus[s.id] === "completed").length,
  };

  /* ---------------- RENDER ---------------- */

  return (
    <Box
      sx={{
        maxWidth: isMobile ? "100vw" : isMini ? "90vw" : "85vw",
        px: isMobile ? 1 : 0,
        backgroundColor: "#fff",
      }}
    >
      <PageHeaderWithHelpButton title="Update students result" />

      <Stack spacing={2} mt={2}>
        {/* CLASS & EXAM */}
        <Stack
          spacing={2}
          sx={{
            p: isMobile ? 1.5 : 2,
            border: "1px solid oklch(.929 .013 255.508)",
            borderRadius: 10,
          }}
        >
          <Typography level="title-md">Select Class & Exam</Typography>

          <Stack direction={isMobile ? "column" : "row"} spacing={1.5}>
            <Select
              placeholder="Choose class"
              value={selectedClass}
              onChange={(e, val) => setSelectedClass(val)}
            >
              {SCHOOL_CLASSES.map(c => (
                <Option key={c.id} value={c.value}>
                  {c.title}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Choose exam"
              value={selectedExam}
              onChange={(e, val) => setSelectedExam(val)}
            >
              {exams.map(exam => (
                <Option key={exam.examId} value={exam.examId}>
                  {exam.examTitle}
                </Option>
              ))}
            </Select>

            <Button
              startDecorator={<Search />}
              onClick={handleSearch}
              fullWidth={isMobile}
            >
              Search
            </Button>

            <Button variant="soft" onClick={handleReset} fullWidth={isMobile}>
              Reset
            </Button>
          </Stack>
        </Stack>

        {/* STATUS FILTERS */}
        {students.length > 0 && (
          <Box
            sx={{
              p: isMobile ? 1.5 : 2,
              border: "1px solid oklch(.929 .013 255.508)",
              borderRadius: 10,
            }}
          >
            <Typography level="title-sm" mb={1}>
              Filter by Status
            </Typography>

            <Stack direction="row" spacing={1} gap={1} flexWrap="wrap">
              {(["all", "pending", "review", "completed"] as const).map(key => (
                <Button
                  key={key}
                  size="sm"
                  color={
                    key === "review"
                      ? "warning"
                      : key === "completed"
                        ? "success"
                        : "neutral"
                  }
                  variant={statusFilter === key ? "solid" : "soft"}
                  disabled={statusCounts[key] === 0}
                  onClick={() => setStatusFilter(key)}
                >
                  {key.toUpperCase()} ({statusCounts[key]})
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        {loading && <LinearProgress />}

        <Divider />

        {/* RESULTS */}
        {isMobile ? (
          <MobileResultFlow
            students={filteredStudents}
            papers={selectedExamPapers}
            results={results}
            setResults={setResults}
            selectedExam={selectedExam}
            selectedExamTitle={
              exams.find(e => e.examId === selectedExam)?.examTitle || "N/A"
            }
            savedStudents={savedStudents}
            setSavedStudents={setSavedStudents}
            studentStatus={studentStatus}
          />
        ) : (
          <StudentsResultUpdateTable
            students={filteredStudents}
            papers={selectedExamPapers}
            results={results}
            setResults={setResults}
            selectedExam={selectedExam}
            selectedExamTitle={
              exams.find(e => e.examId === selectedExam)?.examTitle || "N/A"
            }
            savedStudents={savedStudents}
            setSavedStudents={setSavedStudents}
          />
        )}
      </Stack>
    </Box>
  );
}
