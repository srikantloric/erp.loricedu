import { Print } from "@mui/icons-material";
import {
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

import { SCHOOL_CLASSES } from "config/schoolConfig";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { rankType, resultTypeNew } from "types/results";
import { StudentDetailsType } from "types/student";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { TopperListGenerator } from "components/Reports/GenerateTopperList";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import { IMAGE_PLACEHOLDER } from "utilities/Base64Url";
import { useNavbar } from "context/NavbarContext";
import { Exam } from "types/exam";

type ExtendedRankType = rankType & {
  studentName: string;
  fatherName: string;
  rollNumber: number;
  studentImage: string;
  subjectMarks: { subject: string; marks: number }[];
  percentage: number;
};

function PrintTopperList() {
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [examsList, setExamList] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [isGeneratingRank, setIsGeneratingRank] = useState<boolean>(false);
  const [studentRankDetails, setStudentRankDetails] = useState<
    ExtendedRankType[]
  >([]);

  const { db } = useFirebase();
  const { session } = useNavbar();

  // 🔹 Fetch Exams
  useEffect(() => {
    const fetchExams = async () => {
      const examsQuery = query(
        collection(db, "EXAMS"),
        where("examSession", "==", session)
      );
      const querySnapshot = await getDocs(examsQuery);
      const fetchedExams = querySnapshot.docs.map(
        (doc) => doc.data() as Exam
      );
      setExamList(fetchedExams);
    };
    fetchExams();
  }, [session]);

  // 🔹 Generate Topper PDF
  const generateTopperList = async (
    marksheetList: ExtendedRankType[],
    fullMarks: Record<string, number>
  ) => {
    const selectedClassA = getClassNameByValue(selectedClass) || "N/A";
    const selectedExamA =
      examsList.find((item) => item.examId === selectedExam)?.examTitle ||
      "N/A";

    const topperList = marksheetList.slice(0, 3).map((student) => {
      const totalFullMarks = Object.values(fullMarks).reduce(
        (a, b) => a + b,
        0
      );

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        rankObtained: student.rankObtained,
        marksObtained: student.marksObtained,
        totalFullMarks,
        percentageObtained: student.percentage,
        imageUrl: student.studentImage || IMAGE_PLACEHOLDER,
      };
    });

    const pdfUrl = await TopperListGenerator(
      topperList,
      selectedExamA,
      session,
      selectedClassA
    );

    setPdfUrl(pdfUrl);
  };

  // 🔥 MAIN LOGIC (Same as RankList)
  const printTopperStudents = async () => {
    if (!selectedClass) {
      enqueueSnackbar("Please select class!", { variant: "error" });
      return;
    }
    if (!selectedExam) {
      enqueueSnackbar("Please select exam!", { variant: "error" });
      return;
    }

    const themeExam = examsList.find(
      (item) => item.examId === selectedExam
    )?.marksheetDesign;

    if (!themeExam) {
      enqueueSnackbar("Failed to load exam theme!", { variant: "info" });
      return;
    }

    try {
      setIsGeneratingRank(true);

      // 🔹 Fetch Students
      const studentsSnap = await getDocs(
        query(
          collection(db, "STUDENTS"),
          where("class", "==", selectedClass),
          where("is_active", "==", true)
        )
      );

      if (studentsSnap.empty) {
        setIsGeneratingRank(false);
        enqueueSnackbar("No student found!", { variant: "error" });
        return;
      }

      let allStudentList: StudentDetailsType[] = [];
      studentsSnap.forEach((doc) => {
        allStudentList.push({
          id: doc.id,
          ...doc.data(),
        } as StudentDetailsType);
      });

      let markSheetTempListExtended: ExtendedRankType[] = [];

      // 🔹 MASTER DATA
      const configSnap = await getDoc(doc(db, "MASTER_DATA", "masterData"));
      if (!configSnap.exists()) {
        enqueueSnackbar("Master data missing!", { variant: "error" });
        return;
      }

      const masterData = configSnap.data();
      const selectedClassName = getClassNameByValue(selectedClass);

      const paperIdsForClass: string[] =
        masterData.papers
          ?.filter((p: any) => p.classes.includes(selectedClassName))
          .map((p: any) => p.paperId) ?? [];

      if (!paperIdsForClass.length) {
        enqueueSnackbar("No papers configured!", { variant: "warning" });
        return;
      }

      const examPapers =
        examsList
          .find((item) => item.examId === selectedExam)
          ?.papers.filter((p) =>
            paperIdsForClass.includes(p.paperId)
          ) || [];

      const fullMarks: Record<string, number> = {};
      examPapers.forEach((paper) => {
        fullMarks[paper.paperId] =
          (paper.maxTheory || 0) + (paper.maxPractical || 0);
      });

      // 🔹 Fetch Results
      const resultPromises = allStudentList.map(async (student) => {
        const resultSnap = await getDocs(
          collection(db, "STUDENTS", student.id, "PUBLISHED_RESULTS")
        );

        resultSnap.forEach((resDoc) => {
          const res = resDoc.data() as resultTypeNew;

          if (res.examId === selectedExam) {
            if (!Array.isArray(res.result)) return;

            let totalMarks = res.result.reduce((total, item) => {
              return total + (fullMarks[item.paperId] || 0);
            }, 0);

            let marksObtained = res.result.reduce((total, item) => {
              let obtained = 0;

              if (themeExam === "theory-practical-design") {
                if (item.grade && item.grade.trim() === "") {
                  obtained = 0;
                } else {
                  obtained =
                    Number(item.theory || 0) +
                    Number(item.practical || 0);
                }
              }

              return total + obtained;
            }, 0);

            markSheetTempListExtended.push({
              studentId: student.admission_no,
              studentName: student.student_name,
              fatherName: student.father_name,
              studentImage: student.profil_url || IMAGE_PLACEHOLDER,
              rankObtained: -1,
              marksObtained,
              percentage: (marksObtained / totalMarks) * 100,
              rollNumber: Number(student.class_roll),
              subjectMarks: res.result.map((item) => ({
                subject: item.paperId,
                marks:
                  Number(item.theory || 0) +
                  Number(item.practical || 0),
              })),
            });
          }
        });
      });

      await Promise.all(resultPromises);

      // 🔹 Sort
      markSheetTempListExtended.sort(
        (a, b) => b.marksObtained - a.marksObtained
      );

      // 🔹 Rank Assign
      let currentRank = 1;
      markSheetTempListExtended.forEach((student, index) => {
        if (
          index > 0 &&
          student.marksObtained ===
            markSheetTempListExtended[index - 1].marksObtained
        ) {
          student.rankObtained =
            markSheetTempListExtended[index - 1].rankObtained;
        } else {
          student.rankObtained = currentRank;
        }
        currentRank++;
      });

      setStudentRankDetails(markSheetTempListExtended);

      await generateTopperList(markSheetTempListExtended, fullMarks);

      enqueueSnackbar("Topper list generated successfully!", {
        variant: "success",
      });

      setIsGeneratingRank(false);
    } catch (err) {
      console.error(err);
      setIsGeneratingRank(false);
      enqueueSnackbar("Failed to generate topper list!", {
        variant: "error",
      });
    }
  };

  return (
    <>
      <BreadCrumbsV2
        Icon={IconBrandTinder}
        Path="School Results/Print Topper List"
      />

      <Paper sx={{ p: "10px", mt: "8px" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography level="title-md">Print Topper List</Typography>

          <Stack direction="row" gap={1.5}>
            <Select
              placeholder="choose class"
              onChange={(e, val) => setSelectedClass(val)}
            >
              {SCHOOL_CLASSES.map((item) => (
                <Option value={item.value}>{item.title}</Option>
              ))}
            </Select>

            <Select
              placeholder="choose exam"
              value={selectedExam}
              onChange={(e, val) => setSelectedExam(val)}
            >
              {examsList.map((item) => (
                <Option value={item.examId}>
                  {item.examTitle}
                </Option>
              ))}
            </Select>

            <Button
              startDecorator={<Print />}
              loading={isGeneratingRank}
              onClick={printTopperStudents}
            >
              Print Topper List
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <br />

      {pdfUrl && (
        <>
          <Chip sx={{ mt: 1, mb: 1 }}>
            Total students: {studentRankDetails.length}
          </Chip>

          <Paper sx={{ height: "100vh" }}>
            <iframe
              src={pdfUrl}
              width="100%"
              height="100%"
              frameBorder={0}
              title="PDF"
            />
          </Paper>
        </>
      )}
    </>
  );
}

export default PrintTopperList;