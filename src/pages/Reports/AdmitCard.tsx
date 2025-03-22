import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { IconReport } from "@tabler/icons-react";
import { Paper } from "@mui/material";
import { Box, Button, Chip, Option, Select, Stack, Typography } from "@mui/joy";
import { admitCardType } from "types/admitCard";
import { useState } from "react";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { GenerateAdmitCard } from "../../utilities/GenerateAdmitCard";
import { db } from "../../firebase";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import { examData } from "components/Exams/ExamPlannerTable";
import { collection, getDocs, query, where } from "firebase/firestore";




const AdmitCard = () => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [studentData, setStudentData] = useState<admitCardType[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerateAdmitCard = async () => {
    if (!selectedClass || !selectedExam) {
        alert("Please select exam and class!");
        return;
    }

    setLoading(true);

    try {
        // Query students based on selected class
        const studentsRef = collection(db, "STUDENTS");
        const studentQuery = query(studentsRef, where("class", "==", selectedClass));
        const studentSnapshot = await getDocs(studentQuery);

        if (studentSnapshot.empty) {
            setLoading(false);
            alert("No students found for this class.");
            return;
        }

        // Map student data
        const studentData: admitCardType[] = studentSnapshot.docs.map((doc) => {
            const student = doc.data() as StudentDetailsType;
            return {
                examTitle: "Annual Exam (Term-4)",
                session: "2024-25",
                startTime: "09:00 AM",
                endTime: "12:30 PM",
                studentName: student.student_name,
                fatherName: student.father_name,
                rollNumber: student.class_roll,
                motherName: student.mother_name,
                studentId: student.admission_no,
                studentDOB: student.dob,
                studentMob: student.contact_number,
                className: student.class ? getClassNameByValue(student.class) || "N/A" : "N/A",
                profile_url: student.profil_url,
                timeTabel: examData
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

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV2 Icon={IconReport} Path="Reports/Admit Card" />

        <br />
        <Paper sx={{ p: "10px", mt: "8px" }}>
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
                <Option value="ANNUALT4">
                  Annual Exam (Term-4)
                </Option>

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
        </Paper>
        {pdfUrl && (
          <>
            <Chip sx={{ mt: "8px", mb: "8px" }}>
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
      </LSPage>
    </PageContainer>
  );
};

export default AdmitCard;
