import { Print } from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Chip,
  Input,
  Option,
  Select,
  Sheet,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import { Paper } from "@mui/material";
import { IconBrandTinder } from "@tabler/icons-react";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  marksheetType,
  paperMarksType,
  rankType,
  resultType,
} from "types/results";
import { StudentDetailsType } from "types/student";
import { MarksheetReportGenerator } from "components/Reports/MarksheetReport";
import rank1Img from "../../assets/rank_images/1st_rank.png";
import rank2Img from "../../assets/rank_images/2nd_rank.png";
import rank3Img from "../../assets/rank_images/3rd_rank.png";
import { getOrdinal } from "utilities/UtilitiesFunctions";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

type examType = {
  examId: string;
  examTitle: string;
};

type paperType = {
  paperId: string;
  paperTitle: string;
};
type examConfig = {
  examPapers: paperType[];
  exams: examType[];
};

type rankTypeExtended = {
  studentId: string;
  studentName: string;
  studentFather: string;
  rankObtained: number;
  marksObtained: number;
};

function PrintResult() {
  const [studentIdInput, setStudentIdInput] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [examsList, setExamList] = useState<examType[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [marksheetList, setMarksheetList] = useState<marksheetType[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [isGeneratingRank, setIsGeneratingRank] = useState<boolean>(false);
  const [studentRankDetails, setStudentRankDetails] = useState<
    rankTypeExtended[]
  >([]);

  //Get Firebase DB instance
  const { db } = useFirebase();

  useEffect(() => {
    const fetchExamConfig = async () => {
      try {
        const examConfigRef = doc(db, "CONFIG", "EXAM_CONFIG");
        const snap = await getDoc(examConfigRef);

        if (snap.exists()) {
          const data = snap.data() as examConfig;
          setExamList(data.exams);
        } else {
          console.log("No data retrieved from exam config.");
        }
      } catch (err) {
        console.error("Error while fetching exams/papers:", err);
      }
    };

    fetchExamConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const printMarkSheet = async (marksheetList: any) => {
    const pdfUrl = await MarksheetReportGenerator(marksheetList);
    setPdfUrl(pdfUrl);
  };

  const fetchResults = async () => {
    try {
      console.log(`Selected Class: ${selectedClass}`);
      console.log(`Selected Exam: ${selectedExam}`);

      setMarksheetList([]);
      setLoading(true);

      // Fetch students for selected class
      const studentsQuery = query(collection(db, "STUDENTS"), where("class", "==", selectedClass));
      const studentsSnap = await getDocs(studentsQuery);

      if (studentsSnap.empty) {
        setLoading(false);
        enqueueSnackbar("No result found :)", { variant: "warning" });
        return;
      }

      let studentList: StudentDetailsType[] = [];
      studentsSnap.forEach((doc) => {
        studentList.push({ id: doc.id, ...doc.data() } as StudentDetailsType);
      });

      let temMarkSheetList: marksheetType[] = [];

      // Fetch results for all students using Promise.all for parallel fetching
      const resultPromises = studentList.map(async (student) => {
        const resultQuery = collection(db, "STUDENTS", student.id, "PUBLISHED_RESULTS");
        const resultSnap = await getDocs(resultQuery);

        resultSnap.forEach((result) => {
          if (result.data().examId === selectedExam) {
            temMarkSheetList.push({
              student,
              examTitle: result.data().examTitle,
              result: result.data().result as paperMarksType[],
            });
          }
        });
      });

      await Promise.all(resultPromises); // Wait for all result fetches

      setMarksheetList(temMarkSheetList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching results:", err);
      enqueueSnackbar("Error fetching results!", { variant: "error" });
      setLoading(false);
    }
  };
  useEffect(() => {
    printMarkSheet(marksheetList);
  }, [marksheetList]);

  //Generate Student Rank
  const generateStudentRank = async () => {
    if (!selectedClass) {
      enqueueSnackbar("Please select class!", { variant: "error" });
      return;
    }
    if (!selectedExam) {
      enqueueSnackbar("Please select exam!", { variant: "error" });
      return;
    }

    try {
      setIsGeneratingRank(true);

      // Fetch all students in the selected class
      const studentsQuery = query(collection(db, "STUDENTS"), where("class", "==", selectedClass));
      const studentsSnap = await getDocs(studentsQuery);

      if (studentsSnap.empty) {
        setIsGeneratingRank(false);
        enqueueSnackbar("No student found!", { variant: "error" });
        return;
      }

      let allStudentList: StudentDetailsType[] = [];
      studentsSnap.forEach((doc) => {
        allStudentList.push({ id: doc.id, ...doc.data() } as StudentDetailsType);
      });

      let markSheetTempList: rankType[] = [];
      let markSheetTempListExtended: rankTypeExtended[] = [];

      // Fetch all student results in parallel
      const resultPromises = allStudentList.map(async (student) => {
        const resultQuery = collection(db, "STUDENTS", student.id, "PUBLISHED_RESULTS");
        const resultSnap = await getDocs(resultQuery);

        resultSnap.forEach((resDoc) => {
          const res = resDoc.data() as resultType;
          if (res.examId === selectedExam) {

            let marksObtained = res.result.reduce((total, item) => {
              const obtainedMarkCalculated =
                item.paperId === "DRAWING"
                  ? 0
                  : Number(item.paperMarkTheory) + Number(item.paperMarkPractical);

              return total + obtainedMarkCalculated;
            }, 0);


            markSheetTempList.push({
              studentId: student.id,
              rankObtained: -1,
              marksObtained: marksObtained,
            });

            markSheetTempListExtended.push({
              studentId: student.admission_no,
              studentName: student.student_name,
              studentFather: student.father_name,
              rankObtained: -1,
              marksObtained: marksObtained,
            });
          }
        });
      });

      await Promise.all(resultPromises); // Wait for all result fetches

      // Sort results by marks obtained in descending order
      markSheetTempList.sort((a, b) => b.marksObtained - a.marksObtained);
      markSheetTempListExtended.sort((a, b) => b.marksObtained - a.marksObtained);

      // Assign ranks
      markSheetTempList.forEach((student, index) => (student.rankObtained = index + 1));
      markSheetTempListExtended.forEach((student, index) => (student.rankObtained = index + 1));

      // Upload rank to Firestore
      const rankData = {
        class: selectedClass,
        lastUpdated: new Date(),
        studentRanks: markSheetTempList,
      };

      await setDoc(doc(db, "RESULTS", selectedClass), rankData);

      setStudentRankDetails(markSheetTempListExtended);
      setIsGeneratingRank(false);
      enqueueSnackbar("Rank updated successfully!", { variant: "success" });

    } catch (err) {
      console.error("Error generating student ranks:", err);
      setIsGeneratingRank(false);
      enqueueSnackbar("Failed to update rank!", { variant: "error" });
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV2
          Icon={IconBrandTinder}
          Path="School Results/Print Results"
        />
        <Paper sx={{ p: "10px", mt: "8px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography level="title-md">Print Marksheet</Typography>
            </Box>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Input
                placeholder="Search by student id.."
                value={studentIdInput!}
                onChange={(e) => setStudentIdInput(e.target.value)}
              ></Input>
              <Typography>Or</Typography>
              <Select
                placeholder="choose class"
                onChange={(e, val) => setSelectedClass(val)}
              >
                {SCHOOL_CLASSES.map((item) => {
                  return <Option value={item.value}>{item.title}</Option>;
                })}
              </Select>
              <Select
                placeholder="choose exam"
                value={selectedExam}
                onChange={(e, val) => setSelectedExam(val)}
              >
                {examsList &&
                  examsList.map((item, key) => {
                    return (
                      <Option value={item.examId}>{item.examTitle}</Option>
                    );
                  })}
              </Select>
              <Button
                sx={{ ml: "8px" }}
                startDecorator={<Print />}
                loading={loading}
                onClick={fetchResults}
              ></Button>
              <Button
                sx={{ ml: "8px" }}
                startDecorator={<RefreshIcon />}
                loading={isGeneratingRank}
                onClick={generateStudentRank}
              >
                Re-Generate Rank
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {pdfUrl && (
          <>
            <Chip sx={{ mt: "8px", mb: "8px" }}>
              Total marksheet count :{marksheetList.length}
            </Chip>
            <Paper sx={{ height: "100vh" }}>
              <iframe
                src={pdfUrl}
                title="PDF Viewer"
                width="100%"
                height="100%"
                frameBorder={0}
              />
            </Paper>
          </>
        )}

        <br />
        {studentRankDetails.length > 0 && (
          <Sheet variant="outlined" sx={{ borderRadius: "10px" }}>
            <Stack
              direction="row"
              minHeight="200px"
              justifyContent="space-evenly"
              alignItems="center"
            >
              <Stack alignItems="center">
                <img
                  src={rank1Img}
                  alt="1st_rank"
                  style={{ height: "120px" }}
                />
                <Typography
                  level="title-md"
                  sx={{
                    bgcolor: "var(--bs-primary)",
                    borderRadius: "16px",
                    pl: "8px",
                    pr: "8px",
                    pt: "3px",
                    pb: "3px",
                    color: "#fff",
                  }}
                >
                  {studentRankDetails.at(0)?.studentName}
                </Typography>
                <Typography level="body-sm">
                  {" "}
                  {studentRankDetails.at(0)?.studentId}
                </Typography>
              </Stack>
              <Stack alignItems="center">
                <img
                  src={rank2Img}
                  alt="1st_rank"
                  style={{ height: "120px" }}
                />
                <Typography
                  level="title-md"
                  sx={{
                    bgcolor: "var(--bs-primary)",
                    borderRadius: "16px",
                    pl: "8px",
                    pr: "8px",
                    pt: "3px",
                    pb: "3px",
                    color: "#fff",
                  }}
                >
                  {studentRankDetails.at(1)?.studentName}
                </Typography>
                <Typography level="body-sm">
                  {" "}
                  {studentRankDetails.at(1)?.studentId}
                </Typography>
              </Stack>
              <Stack alignItems="center">
                <img
                  src={rank3Img}
                  alt="1st_rank"
                  style={{ height: "120px" }}
                />
                <Typography
                  level="title-md"
                  sx={{
                    bgcolor: "var(--bs-primary)",
                    borderRadius: "16px",
                    pl: "8px",
                    pr: "8px",
                    pt: "3px",
                    pb: "3px",
                    color: "#fff",
                  }}
                >
                  {studentRankDetails.at(2)?.studentName}
                </Typography>
                <Typography level="body-sm">
                  {studentRankDetails.at(2)?.studentId}
                </Typography>
              </Stack>
            </Stack>

            <br />

            <Sheet variant="outlined" sx={{ m: "10px", p: "10px" }}>
              <Table
                hoverRow
                stripe="even"
                sx={{ "& tr > *": { textAlign: "center" } }}
              >
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Marks Obtained</th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Fathers Name</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRankDetails &&
                    studentRankDetails.map((studentRank) => (
                      <tr>
                        <td>
                          <Typography level="title-md" sx={{ color: "#000" }}>
                            {getOrdinal(studentRank.rankObtained)}
                          </Typography>
                        </td>
                        <td>{studentRank.marksObtained}</td>
                        <td>{studentRank.studentId}</td>
                        <td>{studentRank.studentName}</td>
                        <td>{studentRank.studentFather}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Sheet>
          </Sheet>
        )}
      </LSPage>
    </PageContainer>
  );
}

export default PrintResult;
