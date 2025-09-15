import { AutoFixHigh, Delete } from "@mui/icons-material";
import { Box, Button, IconButton, LinearProgress, Option, Select, Stack } from "@mui/joy";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ExamData } from "types/reports/exam";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { useSidebar } from "context/SidebarContext";
import { enqueueSnackbar } from "notistack";
import { useSearchParams } from "react-router-dom";
import { PaperType } from "pages/MasterData/AddSubjects";
import { ClassType } from "pages/MasterData/AddClasses";
import axios from "axios"


// --- table style ---
const tableContainerStyle: React.CSSProperties = {
  overflowX: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#fff",
  marginTop: "16px",
};

const stickyLeftStyle = {
  position: "sticky" as const,
  background: "#fff",
  zIndex: 10,
  fontWeight: 500,
  padding: "8px 12px",
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
};

const stickyRightStyle = {
  position: "sticky" as const,
  right: 0,
  background: "#fff",
  zIndex: 10,
  padding: "8px 12px",
  textAlign: "center" as const,
};

const headCellStyle = {
  fontWeight: 700,
  textAlign: "center" as const,
  borderLeft: "1px solid #e5e7eb",
  minWidth: 120,
  padding: "8px 12px",
};

export type ExamSchedule = {
  schedule: {
    date: string; // formatted as yyyy-mm-dd
    sessions: {
      session: string;
      subjects: Record<string, string>; // dynamic keys like "STD-2": "ENGLISH"
    }[];
  }[];
  notes: string;
};

function CreateExamSchedule() {
  const [examData, setExamData] = useState<ExamData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<string[]>([]);
  const [classList, setClassList] = useState<string[]>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  // const [aiExamSchedule, setAiExamSchedule] = useState<ExamSchedule | null>(null)

  const [confiLoading, setConfigLoading] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const examId = searchParams.get("examId");

  const { db } = useFirebase();
  const { setMini, isMini } = useSidebar();

  useEffect(() => {
    const fetchPapers = async () => {
      setConfigLoading(true)
      const docRef = doc(collection(db, "MASTER_DATA"), "masterData");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const papers: PaperType[] = docSnap.data().papers as PaperType[];
        const classes: ClassType[] = docSnap.data().classes as ClassType[];
        const pap = papers.map((item) => item.paperTitle)
        setPapers(pap);

        const clss = classes.map((item) => item.name)
        setClassList(clss)
        setConfigLoading(false)

      } else {
        setConfigLoading(false)
        console.log("Papers not found!");
        enqueueSnackbar("Failed to load config!", { variant: "error" })
      }
    };
    fetchPapers();
  }, []);



  useEffect(() => {
    setMini(true);
  }, []);

  // --- Fetch existing schedule based on examId ---
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!examId) return;

      const scheduleId = `${examId}_SCHEDULE`;
      const docRef = doc(collection(db, "EXAM_SCHEDULES"), scheduleId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.papers) {
          setExamData(data.papers);
        }
      }
    };

    fetchSchedule();
  }, [db, examId]);

  const handleSubjectChange = (
    dateIndex: number,
    sessionIndex: number,
    className: string,
    value: string | null
  ) => {
    if (!value) return;
    const newExamData = [...examData];

    // Prevent duplicate subject across dates for same class
    const isDuplicate = newExamData.some((exam, dIdx) =>
      exam.sessions.some((session, sIdx) =>
        !(dIdx === dateIndex && sIdx === sessionIndex) &&
        session.subjects[className] === value
      )
    );

    if (isDuplicate) {
      enqueueSnackbar(`❌ ${className} already has subject "${value}" on another date!`, { variant: "warning" });
    }

    newExamData[dateIndex].sessions[sessionIndex].subjects[className] = value;
    setExamData(newExamData);
  };

  const handleAddDate = () => {
    if (!newDate) {
      alert("Please select a date!");
      return;
    }
    setExamData([
      ...examData,
      {
        date: newDate,
        sessions: [
          { session: "1st", subjects: {} },
          { session: "2nd", subjects: {} },
        ],
      },
    ]);
    setNewDate("");
    setOpenDialog(false);
  };

  const saveExamPlan = async () => {
    if (!examId) {
      enqueueSnackbar("Exam ID not found in URL!", { variant: "error" });
      return;
    }

    if (examData.length === 0) {
      enqueueSnackbar("Please set schedule before saving!", { variant: "error" });
      return;
    }

    setLoading(true);
    const scheduleId = `${examId}_SCHEDULE`;
    const examSchedule = {
      papers: examData,
      examId,
      scheduleId,
      createdAt: serverTimestamp(),
    };

    const docRef = doc(collection(db, "EXAM_SCHEDULES"), scheduleId);

    try {
      // Create or update existing document
      await setDoc(docRef, examSchedule, { merge: true });
      enqueueSnackbar("Exam schedule saved successfully!", { variant: "success" });
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Error saving exam schedule", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };



  //Generate AI exam schedule

  const generateAiExamSchedule = async () => {
    try {

      if (!classList || !papers) {
        enqueueSnackbar("Erorr", { variant: "error" })
        return
      }
      setIsAiGenerating(true)
      const response = await axios.post("http://localhost:5000/generate-schedule", {
        examId: "MID_TERM_2025",
        classes: classList,
        subjects: papers,
        startDate: "2025-09-15",
        endDate: "2025-09-25",
        sessionsPerDay: 2,
        holidays: ["2025-09-20"],
        avoidDaysOfWeek: ["Sunday"],
        maxExamsPerDayPerClass: 1,
        minGapDaysForHardPairs: [
          ["Math", "Science", 2]
        ],
        pinned: [
          {
            date: "2025-09-15",
            session: "1st",
            className: "Class 10",
            subject: "Math"
          }
        ]
      });


      setIsAiGenerating(false)
      console.log("✅ Exam schedule created:", response.data);
      setExamData(response.data.schedule)
    } catch (error: any) {
      setIsAiGenerating(false)
      console.error("❌ Error creating exam schedule:", error.response?.data || error.message);
    }
  }



  return (
    <Box sx={{ width: isMini ? "85vw" : "77vw" }}>


      <Stack justifyContent={"end"} direction={"row"}>
        <Button onClick={generateAiExamSchedule} startDecorator={<AutoFixHigh />} loading={isAiGenerating} variant="plain" >Auto Generate</Button>
      </Stack>
      <div style={tableContainerStyle}>
        {confiLoading &&
          <LinearProgress />}

        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ ...stickyLeftStyle, minWidth: 140, left: 0 }}>Date</th>
              <th style={{ ...stickyLeftStyle, minWidth: 140, left: 140 }}>Session</th>
              {classList.map((cls) => (
                <th key={cls} style={headCellStyle}>{cls}</th>
              ))}
              <th style={{ ...stickyRightStyle, minWidth: 30 }}>ACN</th>
            </tr>
          </thead>
          <tbody>
            {examData.map((exam, dateIndex) =>
              exam.sessions.map((session, sessionIndex) => (
                <tr key={`${exam.date}-${session.session}`} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  {sessionIndex === 0 && (
                    <td rowSpan={exam.sessions.length} style={{ ...stickyLeftStyle, left: 0 }}>
                      <TextField
                        type="date"
                        value={exam.date}
                        onChange={(e) => {
                          const newExamData = [...examData];
                          newExamData[dateIndex].date = e.target.value;
                          setExamData(newExamData);
                        }}
                        size="small"
                      />
                    </td>
                  )}
                  <td style={{ ...stickyLeftStyle, left: 140 }}>{session.session}</td>

                  {classList.map((cls) => (
                    <td
                      key={cls}
                      style={{
                        borderLeft: "1px solid #e5e7eb",
                        textAlign: "center",
                        padding: "8px 12px",
                      }}
                    >
                      <Select
                        value={session.subjects[cls] || ""}
                        onChange={(_, val) => handleSubjectChange(dateIndex, sessionIndex, cls, val)}
                        placeholder="-"
                        sx={{ minWidth: 120 }}
                      >
                        <Option value={"-"}>-</Option>
                        <Option value="oral">Oral</Option>
                        {papers.map((subj) => (
                          <Option key={subj} value={subj}>{subj}</Option>
                        ))}
                      </Select>
                    </td>
                  ))}

                  {sessionIndex === 0 && (
                    <td rowSpan={exam.sessions.length} style={stickyRightStyle}>
                      <IconButton
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this exam date?")) {
                            const newExamData = [...examData];
                            newExamData.splice(dateIndex, 1);
                            setExamData(newExamData);
                          }
                        }}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>

      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "space-between" }}>
        <Button
          onClick={() => setOpenDialog(true)}
          variant="plain"
          color="primary"
          startDecorator={<IconPlus size={18} />}
        >
          Add Exam Date
        </Button>
        <Stack direction={"row"}>
          <Button variant="solid" color="primary" onClick={saveExamPlan} loading={loading}>
            Save Exam
          </Button>
        </Stack>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Select Exam Date</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            fullWidth
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddDate} variant="solid">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CreateExamSchedule;
