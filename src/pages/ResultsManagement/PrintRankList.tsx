import { Print } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Option,
  Select,
  Stack,
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
  rankType,
  resultType,
} from "types/results";
import { StudentDetailsType } from "types/student";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { ExamRankListGenerator } from "components/Reports/GenerateRankList";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";

type examType = {
  examId: string;
  examTitle: string;
  marksheetDesign: string
};

type paperType = {
  paperId: string;
  paperTitle: string;
};
type examConfig = {
  examPapers: paperType[];
  exams: examType[];
};

const fullMarks = {
  MATHS: 100,
  SCIENCE: 100,
  ENGLISH: 100,
  SST: 100,
  COMPUTER: 100,
  GK: 100,
  DRAWING: 0,
  ORAL: 100,
  HINDI: 100,
  DRAWINGACTIVITY: 100,
  SOCIALSCIENCE: 100,
};


type ExtendedRankType = rankType & {
  studentName: string;
  fatherName: string;
  rollNumber: number;
  subjectMarks: { subject: string; marks: number }[];
  percentage: number;
};

function PrintRankList() {
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [examsList, setExamList] = useState<examType[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [isGeneratingRank, setIsGeneratingRank] = useState<boolean>(false);
  const [studentRankDetails, setStudentRankDetails] = useState<
    ExtendedRankType[]
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


  const printRankList = async (marksheetList: any) => {
    if (!selectedClass) {
      enqueueSnackbar("Please select class!", { variant: "info" });
      return
    }
    if (!examsList) {
      enqueueSnackbar("Unable to load exam config, please try after again!", { variant: "info" });
      return
    }

    const selectedClassA = getClassNameByValue(selectedClass) || "N/A";
    const selectedExamA = examsList.find((item) => item.examId === selectedExam)?.examTitle || "N/A";

    const pdfUrl = await ExamRankListGenerator(marksheetList,
      selectedExamA,
      "2024-2025",
      selectedClassA,
      fullMarks
    );
    setPdfUrl(pdfUrl);
  };


  //Generate Student Rank
  const printStudentRank = async () => {
    if (!selectedClass) {
      enqueueSnackbar("Please select class!", { variant: "error" });
      return;
    }
    if (!selectedExam) {
      enqueueSnackbar("Please select exam!", { variant: "error" });
      return;
    }
    if (!examsList) {
      enqueueSnackbar("Failed to load exam config, please try again", { variant: "info" });
      return
    }

    const themeExam = examsList.find((item) => item.examId === selectedExam)?.marksheetDesign

    if (!themeExam) {
      enqueueSnackbar("Failed to load exam theme!", { variant: "info" });
      return
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

      let markSheetTempListExtended: ExtendedRankType[] = [];

      // Fetch all student results in parallel
      const resultPromises = allStudentList.map(async (student) => {
        const resultQuery = collection(db, "STUDENTS", student.id, "PUBLISHED_RESULTS");
        const resultSnap = await getDocs(resultQuery);

        resultSnap.forEach((resDoc) => {
          const res = resDoc.data() as resultType;
          if (res.examId === selectedExam) {

            if (!Array.isArray(res.result)) {
              console.error("Error: res.result is not an array!", res.result);
              return; // Prevent further processing if the data is invalid
            }

            //calculate total marks
            let totalMarks = res.result.reduce((total, item) => {
              const fullMarkForSubject = fullMarks[item.paperId as keyof typeof fullMarks] || 0;
              return total + fullMarkForSubject;
            }, 0);

            //paper mark obtained
            let marksObtained = res.result.reduce((total, item) => {

              let obtainedMarkCalculated;
              if (themeExam === "total-pass-design") {
                obtainedMarkCalculated = Number(item.paperMarkObtained);

              } else {
                obtainedMarkCalculated =
                  item.paperId === "DRAWING"
                    ? 0
                    : Number(item.paperMarkTheory) + Number(item.paperMarkPractical);
              }

              return total + obtainedMarkCalculated!;
            }, 0);

            console.log("Marks Obtained:", marksObtained)
            markSheetTempListExtended.push({
              studentId: student.admission_no,
              studentName: student.student_name,
              fatherName: student.father_name,
              rankObtained: -1,
              marksObtained: marksObtained,
              percentage: (marksObtained / totalMarks) * 100,
              rollNumber: Number(student.class_roll),
              subjectMarks: res.result.map((item) => ({
                subject: item.paperId,
                marks: themeExam === "total-pass-design" ? Number(item.paperMarkObtained) : Number(item.paperMarkTheory) + Number(item.paperMarkPractical),
              }),
              ),
            });
          }
        });
      });

      await Promise.all(resultPromises); // Wait for all result fetches

      // Sort students by marks obtained in descending order
      markSheetTempListExtended.sort((a, b) => b.marksObtained - a.marksObtained);

      console.log("MarksheetList after sorting", markSheetTempListExtended)
      // Assign ranks, ensuring students with the same marks get the same rank
      let currentRank = 1;
      markSheetTempListExtended.forEach((student, index) => {
        if (index > 0 && student.marksObtained === markSheetTempListExtended[index - 1].marksObtained) {
          student.rankObtained = markSheetTempListExtended[index - 1].rankObtained;
        } else {
          student.rankObtained = currentRank;
          currentRank++;
        }
      });

      setStudentRankDetails(markSheetTempListExtended);
      printRankList(markSheetTempListExtended);
      setIsGeneratingRank(false);
      enqueueSnackbar("Rank List Generated successfully!", { variant: "success" });

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
          Path="School Results/Print Rank List"
        />
        <Paper sx={{ p: "10px", mt: "8px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography level="title-md">Print Rank List</Typography>
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
              <Button
                sx={{ ml: "8px" }}
                startDecorator={<Print />}
                loading={isGeneratingRank}
                onClick={printStudentRank}
              >
                Print Rank List
              </Button>
            </Stack>
          </Stack>
        </Paper>
        <br />

        {
          pdfUrl &&
          <>
            <Chip sx={{ mt: "8px", mb: "8px" }}>
              Total student count :{studentRankDetails.length}
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

        }

      </LSPage>
    </PageContainer>
  );
}

export default PrintRankList;
