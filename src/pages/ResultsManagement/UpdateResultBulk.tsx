import { Search } from "@mui/icons-material"
import { Box, Button, Checkbox, Divider, Option, Select, Stack, Typography } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import Navbar from "components/Navbar/Navbar"
import StudentsResultUpdateTable from "components/Tables/StudentsResultUpdateTable"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { SCHOOL_CLASSES } from "config/schoolConfig"
import { useFirebase } from "context/firebaseContext"
import { useNavbar } from "context/NavbarContext"
import { doc, getDoc } from "firebase/firestore"
import { enqueueSnackbar } from "notistack"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore";
import { StudentDetailsType } from "types/student"

export type examPapers = {
  paperId: string,
  paperTitle: string,
  practicalMarks: number;
  scoreType: "number" | "grade";
  theoryMarks: number;
  totalMarks: number;
}
type exams = {
  examId: string,
  examTitle: string,
  marksheetDesign: string,
  examSession: string,
  examPapers: examPapers[],
}

type ExamConfig = {
  exams: exams[],
}

function UpdateResultBulk() {

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [students, setStudents] = useState<StudentDetailsType[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
  const [examPapers, setExamPapers] = useState<examPapers[]>([]);


  const { db } = useFirebase();
  const { session } = useNavbar();

  useEffect(() => {
    const fetchExamsConfig = async () => {
      try {
        const examsConfigRef = doc(db, "CONFIG", "EXAM_CONFIG");
        const examConfig = await getDoc(examsConfigRef);
        if (examConfig.exists()) {
          const data = examConfig.data().exams;
          const currentSessionExamConfig = data.filter((exam: any) => exam.examSession === session);
          console.log("Current session exam config:", currentSessionExamConfig);
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
        setExamPapers(selectedExamData.examPapers);
      } else {
        setExamPapers([]);
      }
    }
  }, [examConfig, selectedExam]);


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
        const students = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(students as StudentDetailsType[]);
      } catch (error) {
        console.error("Error fetching students:", error);
        enqueueSnackbar("Failed to fetch students.", { variant: "error" });
      }
    }
    fetchStudents();
  }


  return (
    <PageContainer>
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
          <Stack direction={"row"} flexWrap={"wrap"} justifyContent={"space-evenly"} gap={1}>
            <Checkbox
              label="Select all"
              variant="soft"
              defaultChecked
            />
            {examPapers?.length === 0 && (
              <Typography level="body-sm" sx={{ color: "red" }}>
                No exam papers found for this exam.
              </Typography>
            )}
            {examPapers?.map((item) => {
              return (
                <Checkbox
                  key={item.paperId}
                  label={item.paperTitle}
                  variant="soft"
                />
              );
            })}
          </Stack>
        </Stack>
        <br />
        <Box>
          <StudentsResultUpdateTable studentData={students} examPapers={examPapers} />
        </Box>
      </LSPage>
    </PageContainer >
  )
}

export default UpdateResultBulk