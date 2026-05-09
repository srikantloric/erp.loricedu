
import { Paper } from "@mui/material";
import { Box, Button, Chip, Option, Select, Stack, Typography } from "@mui/joy";
import { admitCardType } from "types/admitCard";
import { useEffect, useState } from "react";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { GenerateAdmitCard } from "../../../utilities/GenerateAdmitCard";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { ExamData } from "components/Exams/ExamScheduleTable";
import { enqueueSnackbar } from "notistack";




const AdmitCard = () => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [studentData, setStudentData] = useState<admitCardType[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [examSchedule, setExamSchedule] = useState<ExamData[]>([]);

  const [exams, setExams] = useState<any[]>([]);

  //Get Firebase DB instance
  const { db } = useFirebase();

  const handleGenerateAdmitCard = async () => {
    if (!selectedClass || !selectedExam) {
      alert("Please select exam and class!");
      return;
    }

    setLoading(true);

    try {
      // Query students based on selected class
      const studentsRef = collection(db, "STUDENTS");
      const studentQuery = query(studentsRef, where("class", "==", selectedClass), where("is_active", "==", true));
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        setLoading(false);
        alert("No students found for this class.");
        return;
      }

      const selectedExamData = exams.filter((item) => item.examId === selectedExam)[0];

      // Map student data
      const studentData: admitCardType[] = studentSnapshot.docs.map((doc) => {
        const student = doc.data() as StudentDetailsType;
        return {
          examTitle: selectedExamData.examTitle,
          session: selectedExamData.examSession,
          examTimings: selectedExamData.examTimings,
          studentName: student.student_name,
          fatherName: student.father_name,
          rollNumber: student.rollNumber,
          motherName: student.mother_name,
          studentId: student.admission_no,
          studentDOB: student.dob,
          studentMob: student.contact_number,
          className: student.class ? getClassNameByValue(student.class) || "N/A" : "N/A",
          profile_url: student.profil_url,
          timeTabel: examSchedule
        };
      });

      setStudentData(studentData);

      // Generate PDF
      const pdfUrl = await GenerateAdmitCard(studentData);
      setPdfUrl(pdfUrl);

    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("Failed to generate admit card. Please try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examQuery = query(
          collection(db, "EXAMS"),
          orderBy("createdAt", "desc")
        );

        const examSnap = await getDocs(examQuery);

        const examsData = examSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExams(examsData);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };
    fetchExams()
  }, [])

  useEffect(() => {
    const fetchExamSchedule = async () => {
      if (!selectedExam) {
        return;
      }

      try {
        const examQuery = query(
          collection(db, "EXAM_SCHEDULES"),
          where("examId", "==", selectedExam),
          limit(1)
        );

        const examScheduleSnap = await getDocs(examQuery); // getDocs for query

        if (!examScheduleSnap.empty) {
          // Use the first document from the query result
          const examData = examScheduleSnap.docs[0].data().papers as ExamData[];
          setExamSchedule(examData);
        } else {
          enqueueSnackbar("No schedule found for this exam.", { variant: "warning" });
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
        enqueueSnackbar("Error fetching exam schedule.", { variant: "error" });
      }
    };

    fetchExamSchedule();
  }, [selectedExam, db]);
  return (
    <>
      <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "10px", }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography level="title-md">Admit Card</Typography>
          </Box>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Select
              placeholder="Choose exam"
              value={selectedExam}
              onChange={(e, val) => setSelectedExam(val)}
            >
              {
                exams && exams.map((exam) => {
                  return (
                    <Option value={exam.examId}>
                      <Stack>
                        <Typography level="body-sm">{exam.examTitle}</Typography>
                        <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
                          {exam.examSession}
                        </Typography>
                      </Stack>
                    </Option>
                  )
                })
              }
            </Select>
            <Select
              placeholder="Choose class"
              value={selectedClass}
              onChange={(e, val) => setSelectedClass(val)}
            >
              {SCHOOL_CLASSES.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.title}
                </Option>
              ))}
            </Select>



            <Button
              sx={{ ml: "8px" }}
              onClick={handleGenerateAdmitCard}
              loading={loading}
            >
              Generate Admit Card
            </Button>
          </Stack>
        </Stack>
      </Box>
      {pdfUrl && (
        <>
          <Chip sx={{ mt: "8px", mb: "8px"}} color="primary">
            Total admitcard count :{studentData.length}
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

    </>
  );
};

export default AdmitCard;
