import { Search } from "@mui/icons-material"
import { Box, Button, Divider, Option, Select, Stack, Typography } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import Navbar from "components/Navbar/Navbar"
import StudentsResultUpdateTable from "components/Tables/StudentsResultUpdateTable"
import LSPage from "components/Utils/LSPage"
import { SCHOOL_CLASSES } from "config/schoolConfig"
import { useFirebase } from "context/firebaseContext"
import { useNavbar } from "context/NavbarContext"
import { doc, getDoc } from "firebase/firestore"
import { enqueueSnackbar } from "notistack"
import { useContext, useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore";
import { StudentDetailsType } from "types/student"
import SideBarContext from "context/SidebarContext"
import { Exam, ExamPaper } from "types/exam"

type ExamConfig = {
  exams: Exam[],
}

export type ResultsState = {
  [studentId: string]: {
    [paperId: string]: {
      theory: number | string;
      practical: number | string;
      grade?: string
    };
  };
};

function UpdateResultBulk() {

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<StudentDetailsType[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [results, setResults] = useState<ResultsState>({});
  const [selectedExamPapers, setSelectedExamPapers] = useState<ExamPaper[]>([])
  const [savedStudents, setSavedStudents] = useState<Set<string>>(new Set());

  const { db } = useFirebase();
  const { session } = useNavbar();
  const { setSidebarOpen } = useContext(SideBarContext);

  useEffect(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);


  useEffect(() => {
    const fetchExamsConfig = async () => {
      try {
        const examsConfigRef = doc(db, "CONFIG", "EXAM_CONFIG");
        const examConfig = await getDoc(examsConfigRef);
        if (examConfig.exists()) {
          const data = examConfig.data().exams;
          const currentSessionExamConfig = data.filter((exam: any) => exam.examSession === session);
          setExamConfig({ exams: currentSessionExamConfig });
        } else {
          console.log("No exams configuration found.");
        }

      } catch (error) {
        console.error("Error fetching exams config:", error);
      }
    }

    fetchExamsConfig();
  }, [session])

  //on exam selection change, fetch the exam papers
  useEffect(() => {
    if (examConfig && selectedExam) {
      const selectedExamData = examConfig.exams.find(exam => exam.examId === selectedExam);
      if (selectedExamData) {
        if (selectedClass) {
          setSelectedExamPapers(selectedExamData.examPapers.filter(paper => paper.classes.includes(`${selectedClass}`)));
        } else {
          setSelectedExamPapers(selectedExamData.examPapers);
        }
      } else {
        setSelectedExamPapers([]);
      }
    }
  }, [examConfig, selectedExam,selectedClass]);


  const handleSearchBtn = () => {
    if (!selectedClass || !selectedExam) {
      enqueueSnackbar("Please select a class and an exam.", { variant: "warning" });
      return;
    }
    // Fetch students based on selected class and exam
    const fetchStudents = async () => {
      try {
        const studentsQuery = query(
          collection(db, "STUDENTS"),
          where("class", "==", selectedClass)
        );
        const querySnapshot = await getDocs(studentsQuery);
        const fetchedStudents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(fetchedStudents as StudentDetailsType[]);

        // Step 2: Fetch saved results for each student
        const fetchedResults: ResultsState = {};
        const savedStudentIds = new Set<string>();

        for (const student of fetchedStudents) {
          const resultDocRef = doc(db, "STUDENTS", student.id, "PUBLISHED_RESULTS", selectedExam);
          const resultDocSnap = await getDoc(resultDocRef);

          if (resultDocSnap.exists()) {
            const data = resultDocSnap.data();
            if (Array.isArray(data.result)) {
              fetchedResults[student.id] = {};
              savedStudentIds.add(student.id);
              data.result.forEach((entry: any) => {
                fetchedResults[student.id][entry.paperId] = {
                  theory: entry.theory ?? '',
                  practical: entry.practical ?? '',
                  ...(entry.grade !== undefined ? { grade: entry.grade } : {})
                };
              });
            }
          }
        }
        setResults(fetchedResults);
        setSavedStudents(savedStudentIds);
      } catch (error) {
        console.error("Error fetching students:", error);
        enqueueSnackbar("Failed to fetch students.", { variant: "error" });
      }
    }
    fetchStudents();
  }

  return (
    <div
      style={{
        maxWidth: "95vw",
        marginLeft: "80px",
        width: selectedExamPapers.length < 3 ? "100%" : undefined,
        backgroundColor: "#fff",
      }}
    >
      <Navbar />
      <LSPage>
        <PageHeaderWithHelpButton title="Update students result" />
        <br />
        <Stack
          direction="column"
          gap={2}
          sx={{ p: "10px", mt: "8px", border: "1px solid oklch(.929 .013 255.508)", borderRadius: "10px" }}
        >
          <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" >
            <Box>
              <Typography level="title-md">Select Class & Exam</Typography>
            </Box>
            <Stack direction="row" alignItems="center" gap={1.5}>

              <Select
                placeholder="choose class"
                onChange={(e, val) => setSelectedClass(val)}
              >
                {SCHOOL_CLASSES.map((item) => {
                  return <Option value={item.value} key={item.id}>{item.title}</Option>;
                })}
              </Select>
              <Select
                placeholder="choose exam"
                onChange={(e, val) => setSelectedExam(val)}
              >
                {examConfig?.exams.map((item) => {
                  return <Option value={item.examId} key={item.examId}>{item.examTitle}</Option>;
                })}
              </Select>
              <Button
                sx={{ ml: "8px" }}
                startDecorator={<Search />}
                onClick={handleSearchBtn}
              ></Button>
              <Button
                variant="soft"
                sx={{ ml: "8px" }}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <br />
          <StudentsResultUpdateTable students={students}
            papers={selectedExamPapers}
            results={results}
            setResults={setResults}
            selectedExam={selectedExam}
            selectedExamTitle={examConfig && selectedExam && examConfig.exams.filter((exam) => exam.examId === selectedExam)[0].examTitle || "N/A"}
            savedStudents={savedStudents}
            setSavedStudents={setSavedStudents} />
        </Stack>
      </LSPage>
    </div >
  )
}

export default UpdateResultBulk