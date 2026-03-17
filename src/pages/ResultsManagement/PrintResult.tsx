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
import { Divider, Paper, useMediaQuery, useTheme } from "@mui/material";
import { IconBrandTinder } from "@tabler/icons-react";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";

import { SCHOOL_CLASSES } from "config/schoolConfig";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  marksheetTypeNew,
  paperMarksTypeNew,
  rankType,
  resultTypeNew,
} from "types/results";
import { StudentDetailsType } from "types/student";
import { MarksheetReportGenerator } from "components/Reports/MarksheetReport";
import rank1Img from "../../assets/rank_images/1st_rank.png";
import rank2Img from "../../assets/rank_images/2nd_rank.png";
import rank3Img from "../../assets/rank_images/3rd_rank.png";
import { getClassNameByValue, getOrdinal } from "utilities/UtilitiesFunctions";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { Exam } from "types/exam";
import { useNavbar } from "context/NavbarContext";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import { useSidebar } from "context/SidebarContext";



type rankTypeExtended = {
  studentId: string;
  studentName: string;
  studentFather: string;
  rankObtained: number;
  marksObtained: number;
};

const marksheetDesignOptions = [
  { value: "theory-practical-design", label: "Modern" },
  { value: "new-design", label: "Classic" },
]

function PrintResult() {
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [examsList, setExamList] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [marksheetList, setMarksheetList] = useState<marksheetTypeNew[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [isGeneratingRank, setIsGeneratingRank] = useState<boolean>(false);
  const [studentRankDetails, setStudentRankDetails] = useState<
    rankTypeExtended[]
  >([]);

  //Get Firebase DB instance
  const { db } = useFirebase();
  const { session } = useNavbar()
  const { setMini, isMini } = useSidebar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [marksheetDesign, setMarksheetDesign] = useState<string>("new-design");

  useEffect(() => {
    //fetch exams
    const fetchExams = async () => {
      const examsQuery = query(
        collection(db, "EXAMS"),
        where("examSession", "==", session)
      );
      const querySnapshot = await getDocs(examsQuery);
      const fetchedExams = querySnapshot.docs.map(doc => doc.data() as Exam);
      setExamList(fetchedExams);
    }
    fetchExams();

  }, [session])




  const printMarkSheet = async (marksheetList: marksheetTypeNew[]) => {
    try {
      if (!selectedExam || !examsList?.length) {
        return enqueueSnackbar("Failed to load exam configuration!", { variant: "error" });
      }

      const exam = examsList.find(e => e.examId === selectedExam);
      if (!exam) {
        return enqueueSnackbar("Exam not found!", { variant: "error" });
      }

      const examTheme = exam.marksheetDesign;
      if (!examTheme) {
        return enqueueSnackbar("Failed to load exam theme!", { variant: "error" });
      }

      if (!marksheetList.length) {
        return enqueueSnackbar("No result found for selected options!", { variant: "info" });
      }

      // 🔹 Fetch master config only once
      const configSnap = await getDoc(doc(db, "MASTER_DATA", "masterData"));
      if (!configSnap.exists()) {
        return enqueueSnackbar("Master data paper config missing!", { variant: "error" });
      }

      const masterData = configSnap.data();
      const selectedClassName = getClassNameByValue(selectedClass);

      // 🔹 Find paperIds linked to current class
      const paperIdsForClass: string[] = masterData.papers
        ?.filter((p: any) => p.classes.includes(selectedClassName))
        .map((p: any) => p.paperId) ?? [];

      if (!paperIdsForClass.length) {
        return enqueueSnackbar("No papers configured for the selected class!", { variant: "warning" });
      }

      // 🔹 Filter exam papers belonging to current class
      const currentClassPapers = exam.papers.filter(p => paperIdsForClass.includes(p.paperId));
      const currentPaperIds = currentClassPapers.map(p => p.paperId);

      // 🔹 Filter only relevant subjects in results
      marksheetList.forEach(ms => {
        ms.result = ms.result.filter(sub => currentPaperIds.includes(String(sub.paperId)));
      });

      // 🔹 Map with full marks
      const examPaperWithFullMarks = currentClassPapers.map(p => ({
        paperId: p.paperId,
        maxTheory: Number(p.maxTheory) || 0,
        maxPractical: Number(p.maxPractical) || 0,
        fullMarks: (Number(p.maxTheory) || 0) + (Number(p.maxPractical) || 0),
        optional: p.optional || [],
      }));

      // 🔹 Generate marksheet PDF
      const pdfUrl = await MarksheetReportGenerator(
        marksheetList,
        session,
        examPaperWithFullMarks,
        marksheetDesign
      );

      setPdfUrl(pdfUrl);
    } catch (error: any) {
      console.error("Error generating marksheet:", error);
      enqueueSnackbar("Unexpected error while generating marksheet!", { variant: "error" });
    }
  };

  const fetchResults = async () => {
    try {

      setMarksheetList([]);
      setLoading(true);
      setPdfUrl("");

      // Fetch students for selected class
      const studentsQuery = query(collection(db, "STUDENTS"), where("class", "==", selectedClass), where("is_active", "==", true));
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

      let temMarkSheetList: marksheetTypeNew[] = [];

      // Fetch results for all students using Promise.all for parallel fetching
      const resultPromises = studentList.map(async (student) => {
        const resultQuery = collection(db, "STUDENTS", student.id, "PUBLISHED_RESULTS");
        const resultSnap = await getDocs(resultQuery);

        resultSnap.forEach((result) => {
          if (result.data().examId === selectedExam) {
            temMarkSheetList.push({
              student,
              examTitle: result.data().examTitle,
              result: result.data().result as paperMarksTypeNew[],
            });
          }
        });
      });

      await Promise.all(resultPromises); // Wait for all result fetches
      setMarksheetList(temMarkSheetList);
      //print markseet
      printMarkSheet(temMarkSheetList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching results:", err);
      enqueueSnackbar("Error fetching results!", { variant: "error" });
      setLoading(false);
    }
  };

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

    if (!examsList) {
      enqueueSnackbar("Failed to load exam config, try again!", { variant: "info" });
      return
    }


    const currentTheme = examsList.find((item) => item.examId === selectedExam)?.marksheetDesign;

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
          const res = resDoc.data() as resultTypeNew;
          if (res.examId === selectedExam) {

            if (!Array.isArray(res.result)) {
              console.error("Error: res.result is not an array!", res.result);
              return; // Prevent further processing if the data is invalid
            }


            //paper mark obtained
            let marksObtained = res.result.reduce((total, item) => {

              let obtainedMarkCalculated = 0;

              if (currentTheme === "theory-practical-design") {

                if (item.paperId === "DRAW") {
                  obtainedMarkCalculated = 0; // Assuming DRAW has no marks
                } else {
                  obtainedMarkCalculated = Number(item.theory || 0) + Number(item.practical || 0);
                }

              }


              return total + obtainedMarkCalculated!;
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


      // Assign ranks, ensuring students with the same marks get the same rank
      let currentRank = 1;
      markSheetTempList.forEach((student, index) => {
        if (index > 0 && student.marksObtained === markSheetTempList[index - 1].marksObtained) {
          student.rankObtained = markSheetTempList[index - 1].rankObtained;
        } else {
          student.rankObtained = currentRank;
        }
        currentRank++;
      });


      currentRank = 1;
      markSheetTempListExtended.forEach((student, index) => {
        if (index > 0 && student.marksObtained === markSheetTempListExtended[index - 1].marksObtained) {
          student.rankObtained = markSheetTempListExtended[index - 1].rankObtained;
        } else {
          student.rankObtained = currentRank;
          currentRank++;
        }
      });


      // Upload rank to Firestore
      const rankData = {
        class: selectedClass,
        lastUpdated: new Date(),
        studentRanks: markSheetTempList,
      };

      try {
        const docRef = doc(db, "RESULTS", "" + selectedClass);
        await setDoc(docRef, rankData);
      } catch (err) {
        console.error("Error updating student ranks:", err);
      }

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
    <>

      <Box
        sx={{
          maxWidth: isMobile ? "100vw" : isMini ? "90vw" : "85vw",
          px: isMobile ? 1 : 0,
          backgroundColor: "#fff",
        }}
      >
        <PageHeaderWithHelpButton title="Print students result" />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            p: isMobile ? 1.5 : 2,
            border: "1px solid oklch(.929 .013 255.508)",
            borderRadius: 10,
            mt: 2,
          }}
        >
          <Box>
            <Typography level="title-md">Print Marksheet</Typography>
          </Box>
          <Stack direction="row" alignItems="center" gap={1.5}>
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
            <Divider orientation="vertical" sx={{ height: 28, mx: 0.5 }} />
            <Select
              placeholder="choose design"
              value={marksheetDesign}
              onChange={(e, val) => setMarksheetDesign(val)}
            >
              {marksheetDesignOptions &&
                marksheetDesignOptions.map((item, key) => {
                  return (
                    <Option value={item.value}>{item.label}</Option>
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
      </Box >
    </>
  );
}

export default PrintResult;
