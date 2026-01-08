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
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
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

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    setMini(true);
  }, []);

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      const q = query(
        collection(db, "EXAMS"),
        where("examSession", "==", session)
      );
      const snap = await getDocs(q);
      setExams(snap.docs.map(d => d.data() as Exam));
    };
    fetchExams();
  }, [session]);

  // Fetch exam papers (class based)
  useEffect(() => {
    const fetchPapers = async () => {
      if (!selectedExam || !exams.length) return;

      const exam = exams.find(e => e.examId === selectedExam);
      if (!exam) return;

      if (!selectedClass) {
        setSelectedExamPapers(exam.papers);
        return;
      }

      const cfgRef = doc(db, "MASTER_DATA", "masterData");
      const cfgSnap = await getDoc(cfgRef);
      const papersCfg = cfgSnap.data()?.papers || [];

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
    };

    fetchPapers();
  }, [selectedExam, selectedClass, exams]);

  /* ---------------- HANDLERS ---------------- */

  const handleSearch = async () => {
    if (!selectedClass || !selectedExam) {
      enqueueSnackbar("Please select class and exam", { variant: "warning" });
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "STUDENTS"),
        where("class", "==", selectedClass),
        where("is_active", "==", true)
      );

      const snap = await getDocs(q);
      const fetchedStudents = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as StudentDetailsType[];

      const fetchedResults: ResultsState = {};
      const savedSet = new Set<string>();
      const statusMap: Record<string, StudentStatus> = {};

      for (const s of fetchedStudents) {
        const resRef = doc(
          db,
          "STUDENTS",
          s.id,
          "PUBLISHED_RESULTS",
          selectedExam
        );
        const resSnap = await getDoc(resRef);

        if (resSnap.exists()) {
          const data = resSnap.data();
          statusMap[s.id] = data.status ?? "completed";

          if (Array.isArray(data.result)) {
            fetchedResults[s.id] = {};
            savedSet.add(s.id);

            data.result.forEach((r: any) => {
              fetchedResults[s.id][r.paperId] = {
                theory: r.theory ?? "",
                practical: r.practical ?? "",
                ...(r.grade ? { grade: r.grade } : {}),
              };
            });
          }
        } else {
          statusMap[s.id] = "pending";
        }
      }

      setStudents(fetchedStudents);
      setResults(fetchedResults);
      setSavedStudents(savedSet);
      setStudentStatus(statusMap);
    } catch (err) {
      enqueueSnackbar("Failed to fetch students", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStudents([]);
    setResults({});
    setSavedStudents(new Set());
    setStudentStatus({});
    setSelectedClass(null);
    setSelectedExam(null);
    setStatusFilter("all");
  };

  /* ---------------- FILTERED STUDENTS ---------------- */

  const filteredStudents = students.filter(s => {
    if (statusFilter === "all") return true;
    return studentStatus[s.id] === statusFilter;
  });

  /* ---------------- STATUS COUNTS ---------------- */

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
              onChange={(e, val) => {
                setSelectedClass(val)
                if (filteredStudents) {
                  setStudents([])
                }
              }}
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
              onChange={(e, val) => {
                setSelectedExam(val)
                if (filteredStudents) {
                  setStudents([])
                }
              }}
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

            <Button
              variant="soft"
              onClick={handleReset}
              fullWidth={isMobile}
            >
              Reset
            </Button>
          </Stack>
        </Stack>

        {/* STATUS FILTERS */}
        {filteredStudents.length > 0 ?
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

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "solid" : "soft"}
                onClick={() => setStatusFilter("all")}
              >
                All ({statusCounts.all})
              </Button>

              <Button
                size="sm"
                variant={statusFilter === "pending" ? "solid" : "soft"}
                color="neutral"
                onClick={() => setStatusFilter("pending")}
                disabled={statusCounts.pending === 0}
              >
                Pending ({statusCounts.pending})
              </Button>

              <Button
                size="sm"
                variant={statusFilter === "review" ? "solid" : "soft"}
                color="warning"
                onClick={() => setStatusFilter("review")}
                disabled={statusCounts.review === 0}
              >
                Needs Review ({statusCounts.review})
              </Button>

              <Button
                size="sm"
                variant={statusFilter === "completed" ? "solid" : "soft"}
                color="success"
                onClick={() => setStatusFilter("completed")}
                disabled={statusCounts.completed === 0}
              >
                Completed ({statusCounts.completed})
              </Button>
            </Stack>
          </Box>
          : null}

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
