import { Search } from "@mui/icons-material"
import { Box, Button, Divider, Option, Select, Stack, Typography } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import StudentsResultUpdateTable from "components/Tables/StudentsResultUpdateTable"
import { SCHOOL_CLASSES } from "config/schoolConfig"
import { useFirebase } from "context/firebaseContext"
import { useNavbar } from "context/NavbarContext"
import { doc, getDoc } from "firebase/firestore"
import { enqueueSnackbar } from "notistack"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore";
import { StudentDetailsType } from "types/student"
import { useSidebar } from "context/SidebarContext"
import { Exam, ExamPaper } from "types/exam"
import { getClassNameByValue } from "utilities/UtilitiesFunctions"

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
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ResultsState>({});
  const [selectedExamPapers, setSelectedExamPapers] = useState<ExamPaper[]>([])
  const [savedStudents, setSavedStudents] = useState<Set<string>>(new Set());

  const { db } = useFirebase();
  const { session } = useNavbar();
  const { setMini, isMini } = useSidebar()

  useEffect(() => {
    setMini(true)
  }, []);




  useEffect(() => {
    //fetch exams
    const fetchExams = async () => {
      const examsQuery = query(
        collection(db, "EXAMS"),
        where("examSession", "==", session)
      );
      const querySnapshot = await getDocs(examsQuery);
      const fetchedExams = querySnapshot.docs.map(doc => doc.data() as Exam);
      setExams(fetchedExams);
    }
    fetchExams();

  }, [session])


  //on exam selection change, fetch the exam papers
  useEffect(() => {
    const fetchClassConfig = async () => {
      if (exams && selectedExam) {
        const selectedExamData = exams.find(exam => exam.examId === selectedExam);
        if (selectedExamData) {
          if (selectedClass) {

            const classConfigRef = doc(db, "MASTER_DATA", "masterData");
            const classConfig = await getDoc(classConfigRef);

            const classConfigData = classConfig.data()?.papers;

            const selectedClassText = getClassNameByValue(selectedClass);
          
            // Filter papers where classConfigData contains an entry with paperId === paper.paperId and classes includes selectedClassText
            const filteredPapers = selectedExamData.papers.filter(paper =>
              classConfigData.some(
              (cfg: any) =>
                cfg.paperId === paper.paperId &&
                Array.isArray(cfg.classes) &&
                cfg.classes.includes(selectedClassText)
              )
            );
            setSelectedExamPapers(filteredPapers);

          } else {
            setSelectedExamPapers(selectedExamData.papers);
          }
        } else {
          setSelectedExamPapers([]);
        }
      }
    }
    fetchClassConfig();
  }, [exams, selectedExam, selectedClass]);


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
          where("class", "==", selectedClass),
          where("is_active", "==", true)
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
        maxWidth: isMini ? "90vw" : "85vw",
        width: selectedExamPapers.length < 3 ? "100%" : undefined,
        backgroundColor: "#fff",
      }}
    >

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
              {exams.map((item) => {
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
          selectedExamTitle={exams && selectedExam && exams.filter((exam) => exam.examId === selectedExam)[0].examTitle || "N/A"}
          savedStudents={savedStudents}
          setSavedStudents={setSavedStudents} />
      </Stack>

    </div >
  )
}

export default UpdateResultBulk