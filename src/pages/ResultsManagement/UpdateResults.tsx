import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import UpdateIcon from "@mui/icons-material/Update";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { Paper } from "@mui/material";

import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { Delete, Print, Search, Send } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { StudentDetailsType } from "types/student";
import { enqueueSnackbar } from "notistack";

import { MarksheetReportGenerator } from "components/Reports/MarksheetReport";
import { paperMarksType, resultType } from "types/results";
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import axios from "axios";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";

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

function UpdateResults() {
  const [updateResultDialogOpen, setUpdateResultDialogOpen] =
    useState<boolean>(false);
  const [examsList, setExamList] = useState<examType[]>([]);
  const [paperList, setPaperList] = useState<paperType[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [studentList, setStudentList] = useState<StudentDetailsType[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [selectedRoll, setSelectedRoll] = useState<any | null>(null);
  const [rollNoList, setRollNoList] = useState<string[] | null>(null);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState<boolean>(false);
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(false);
  const [isUpdatingResult, setIsUpdatingResult] = useState(false);
  const [currentSelectedStudent, setCurrentSelectedStudent] =
    useState<StudentDetailsType | null>(null);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [studentSelectedMarkList, setStudentSelectedMarkList] = useState<
    paperMarksType[]
  >([]);
  const [studentPublishedResults, setStudentPublishedResults] = useState<
    resultType[] | null
  >(null);
  const [fetchingStudentPublishedResult, setFetchingStudentPublishedResult] =
    useState<boolean>(false);

  const [studentIdInput, setStudentIdInput] = useState<string | null>(null);
  const [resultDocId, setResultDocId] = useState<string | null>(null);
  const [isDeleteConfimDialogOpen, setIsDeleteConfirmDialogOpen] =
    useState<boolean>(false);

  const [selectedExamDocId, setSelectedExamDocId] = useState<string | null>(
    null
  );

  const { db } = useFirebase()
  const grades = ["A+", "A", "B+", "B", "C+", "C", "D", "F", "AB"];


  useEffect(() => {
    const fetchExamConfig = async () => {

      try {
        setStudentList([]);

        if (db === null) return;

        const examConfigRef = doc(db, "CONFIG", "EXAM_CONFIG");
        const snap = await getDoc(examConfigRef);

        if (snap.exists()) {
          const data = snap.data() as examConfig;
          console.log(data);
          setPaperList(data.examPapers);
          setExamList(data.exams);
        } else {
          console.log("No data retrieved from exam config..");
        }
      } catch (err) {
        console.error("Error while fetching exams/papers:", err);
      }
    };

    fetchExamConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentSelectedStudent) {
      setStudentPublishedResults([]);
      setFetchingStudentPublishedResult(true);
      if (db === null) return;
      const studentResultsRef = collection(
        doc(db, "STUDENTS", currentSelectedStudent.id),
        "PUBLISHED_RESULTS"
      );

      const unsubscribe = onSnapshot(studentResultsRef, (results) => {
        if (!results.empty) {
          const resultListTemp: resultType[] = results.docs.map((result) => ({
            ...result.data(),
            docId: result.id,
          })) as resultType[];

          setStudentPublishedResults(resultListTemp);
        }
        setFetchingStudentPublishedResult(false);
      });

      return () => unsubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelectedStudent]);


  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      try {
        if (db === null) return;
        const studentQuery = query(
          collection(db, "STUDENTS"),
          where("class", "==", selectedClass),
          orderBy("class_roll", "asc")
        );

        const snapshot = await getDocs(studentQuery);

        if (snapshot.empty) {
          console.log(`No Student Found For Class ${selectedClass}`);
          setStudentList([]);
          setRollNoList([]);
          return;
        }

        const rollListTemp: string[] = [];
        const studentListTemp: StudentDetailsType[] = [];

        snapshot.forEach((doc) => {
          const studData = doc.data() as StudentDetailsType;
          rollListTemp.push(studData.class_roll);
          studentListTemp.push(studData);
        });

        setStudentList(studentListTemp);
        setRollNoList(rollListTemp);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);



  const handleStudentSearch = async () => {
    try {
      if (studentIdInput) {
        if (db === null) return;
        const studentQuery = query(
          collection(db, "STUDENTS"),
          where("admission_no", "==", studentIdInput)
        );

        const snap = await getDocs(studentQuery);

        if (!snap.empty) {
          const studentTemp: StudentDetailsType[] = snap.docs.map((doc) => doc.data() as StudentDetailsType);
          setCurrentSelectedStudent(studentTemp[0]);
        } else {
          enqueueSnackbar(`No Student Found With Id ${studentIdInput}`, { variant: "error" });
        }
      }

      if (selectedRoll) {
        const currentStudent = studentList.find((student) => student.class_roll === selectedRoll);
        if (currentStudent) setCurrentSelectedStudent(currentStudent);
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      enqueueSnackbar(`No Student Found With Id ${studentIdInput}`, { variant: "error" });
    }
  };


  const handleNextStudentBtn = () => {
    if (currentSelectedStudent) {
      const currentIndex = studentList.indexOf(currentSelectedStudent);
      if (currentIndex !== 0) {
        setPrevBtnDisabled(false);
        setNextBtnDisabled(false);
      }
      const updatedStudent = studentList[currentIndex + 1];
      setCurrentSelectedStudent(updatedStudent);
    }
  };

  const handlePrevStudentBtn = () => {
    if (currentSelectedStudent) {
      const currentIndex = studentList.indexOf(currentSelectedStudent);
      if (currentIndex === 0) {
        setPrevBtnDisabled(true);
        setNextBtnDisabled(false);
        return;
      }
      const updatedStudent = studentList[currentIndex - 1];
      setCurrentSelectedStudent(updatedStudent);
    }
  };


  const handleAddPaperBtn = () => {
    selectedPapers.forEach((selectedPaper) => {
      const paper = paperList.find((paper) => paper.paperId === selectedPaper);

      if (paper) {
        const paperWithMarks: paperMarksType = {
          paperId: paper.paperId,
          paperTitle: paper.paperTitle,
          paperMarkObtained: 0,
          paperMarkTheory: 80,
          paperMarkPassing: 33,
          paperMarkPractical: 20,
        };

        const isPaperAlreadyExisting = studentSelectedMarkList.some(
          (item) => item.paperId === paperWithMarks.paperId
        );

        if (!isPaperAlreadyExisting) {
          setStudentSelectedMarkList((prev) => [...prev, paperWithMarks]);
        }
      }
    });
  };



  const handlePaperDeleteBtn = (paper: paperMarksType) => {
    setStudentSelectedMarkList(
      studentSelectedMarkList.filter((item) => item.paperId !== paper.paperId)
    );
  };

  const handleMarkUpdate = (val: string, paper: paperMarksType, type: string) => {
    setStudentSelectedMarkList((prev) =>
      prev.map((item) =>
        item.paperId === paper.paperId
          ? {
            ...item,
            ...(type === "THEORY" &&
              (item.paperId === "DRAWING"
                ? { paperMarkTheory: val } // Assign grade for DRAWING
                : { paperMarkTheory: Number(val) })), // Assign number for other subjects
            ...(type === "PRAC" && { paperMarkPractical: Number(val) }), // Keep practical as number
            ...(item.paperId !== "DRAWING" && {
              paperMarkObtained:
                (type === "THEORY" ? Number(val) : Number(item.paperMarkTheory || 0)) +
                (type === "PRAC" ? Number(val) : Number(item.paperMarkPractical || 0)),
            }),
          }
          : item
      )
    );
  };

  const handleSaveResultBtn = async () => {
    if (!currentSelectedStudent) {
      enqueueSnackbar("Unable to get current student data!", { variant: "error" });
      return;
    }

    if (!selectedExam) {
      enqueueSnackbar("No exam selected!", { variant: "error" });
      return;
    }

    if (studentSelectedMarkList.length === 0) {
      enqueueSnackbar("No paper selected!", { variant: "error" });
      return;
    }

    try {
      const examTitle = examsList.find((exam) => exam.examId === selectedExam)?.examTitle ?? "";

      const resultData: resultType = {
        examId: selectedExam,
        examTitle: examTitle,
        publishedOn: Timestamp.now(),
        result: studentSelectedMarkList,
      };
      if (db === null) return;
      const studentRef = doc(db, "STUDENTS", currentSelectedStudent.id);
      const resultRef = resultDocId
        ? doc(studentRef, "PUBLISHED_RESULTS", resultDocId) // If updating
        : doc(collection(studentRef, "PUBLISHED_RESULTS")); // If creating new

      if (isUpdatingResult && resultDocId) {
        await updateDoc(resultRef, resultData);
      } else {
        await setDoc(resultRef, resultData);
      }

      setUpdateResultDialogOpen(false);
      enqueueSnackbar("Result published successfully!", { variant: "success" });
    } catch (err) {
      console.error("Error saving result:", err);
      enqueueSnackbar("Failed to save result!", { variant: "error" });
    }
  };

  const handleResultDeleteBtn = (id: string) => {
    setSelectedExamDocId(id);
    setIsDeleteConfirmDialogOpen(true);
  };

  const handleDeletePaperAfterConfirmation = async () => {
    if (!currentSelectedStudent || !selectedExamDocId) {
      enqueueSnackbar("Invalid student or exam selection!", { variant: "error" });
      return;
    }

    try {
      if (db === null) return;
      const resultRef = doc(db, "STUDENTS", currentSelectedStudent.id, "PUBLISHED_RESULTS", selectedExamDocId);

      await deleteDoc(resultRef);

      setIsDeleteConfirmDialogOpen(false);
      enqueueSnackbar("Published result deleted successfully!", { variant: "success" });
    } catch (err) {
      console.error("Error while deleting result:", err);
      enqueueSnackbar("Error while deleting result!", { variant: "error" });
    }
  };


  const handleInputResetBtn = () => {
    setStudentIdInput(null);
    setSelectedClass(null);
    setSelectedRoll(null);
    setStudentList([]);
    setStudentSelectedMarkList([]);
  };

  const handleEditPublishedResult = (result: resultType) => {
    setSelectedExam(result.examId);
    setStudentSelectedMarkList(result.result);
    setResultDocId(result.docId!);
    setIsUpdatingResult(true);
    setUpdateResultDialogOpen(true);
  };

  useEffect(() => {
    if (!updateResultDialogOpen) {
      setIsUpdatingResult(false);
      setStudentSelectedMarkList([]);
      setSelectedExam(null);
    }
  }, [updateResultDialogOpen]);

  const printStudentMarksheet = async (result: resultType) => {

    const schoolId = localStorage.getItem("schoolId");

    let pdfUrl;
    if (schoolId === "school_apxschool") {
      pdfUrl = await MarksheetReportGenerator(
        [
          { student: currentSelectedStudent!, result: result.result, examTitle: result.examTitle },
        ],
        "theory-practical-design"
      );
    } else if (schoolId === "school_opsschool" || schoolId === "school_ops") {
      pdfUrl = await MarksheetReportGenerator(
        [
          { student: currentSelectedStudent!, result: result.result, examTitle: result.examTitle },
        ],
        "total-pass-design"
      );
    }
    console.log(pdfUrl)
    // const pdfUrl = await MarksheetReportGenerator([
    //   { student: currentSelectedStudent!, result: result.result, examTitle: result.examTitle },
    // ]);
    const createPDFWindow =
      "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
    window.open(pdfUrl, "_blank", createPDFWindow);
  };


  const sendWhatsappMessage = () => {
    const student = currentSelectedStudent;
    if (!student) return;

    if (student.contact_number === "") {
      enqueueSnackbar("Contact number is not available!", { variant: "error" });
      return;
    }
    if (student.contact_number.length !== 10) {
      enqueueSnackbar("Invalid contact number!", { variant: "error" });
      return;
    }

    if (student.class === undefined) {
      enqueueSnackbar("Class is not available!", { variant: "error" });
      return;
    }

    const messagePayload = {
      messaging_product: "whatsapp",
      to: "91" + student.contact_number,
      type: "template",
      template: {
        name: "result_announded_hindi",
        language: {
          code: "hi",
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  link: "https://firebasestorage.googleapis.com/v0/b/haristudio-69dee.appspot.com/o/result_announced.jpg?alt=media&token=015c33c1-8f70-4922-a7eb-30d79972782d",
                },
              },
            ],
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: student.student_name.toUpperCase() || "Student",
              },
              {
                type: "text",
                text: getClassNameByValue(student.class!)?.toUpperCase() || "Grade",
              },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [
              {
                type: "text",
                text: student.admission_no,
              },
            ],
          },
        ],
      },
    };

    const whatsappApiUrl = "https://graph.facebook.com/v22.0/560510770487956/messages";

    const wsAuthKey = localStorage.getItem("wsAuthKey");
    if (!wsAuthKey) {
      enqueueSnackbar("WhatsApp authorization key is missing!", { variant: "error" });
      return;
    }
    const whatsappApiHeaders = {
      Authorization: "Bearer " + wsAuthKey,
      "Content-Type": "application/json",
    };
    axios
      .post(whatsappApiUrl, messagePayload, {
        headers: whatsappApiHeaders,
      })
      .then(async (res: any) => {
        enqueueSnackbar("Message sent successfully! To " + student.contact_number, { variant: "success" });
        console.log(`Message sent to ${student.contact_number}: ${res.data.messages[0].id}`);
      })
      .catch(async (error: any) => {
        enqueueSnackbar("Failed to send message!", { variant: "error" });
        console.error(`Failed to send message to ${student.contact_number}: ${error.message}`);
      });
  }

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <PageHeaderWithHelpButton title="Update Students Result" />
        <Paper sx={{ p: "10px", mt: "8px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography level="title-md">Search Student</Typography>
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
                  return <Option value={item.value} key={item.id}>{item.title}</Option>;
                })}
              </Select>
              <Select
                placeholder="choose roll"
                onChange={(e, val) => setSelectedRoll(val)}
              >
                {rollNoList &&
                  rollNoList.map((item, key) => {
                    return <Option value={item}>{item}</Option>;
                  })}
              </Select>
              <Button
                sx={{ ml: "8px" }}
                startDecorator={<Search />}
                onClick={handleStudentSearch}
              ></Button>
              <Button
                variant="soft"
                sx={{ ml: "8px" }}
                onClick={handleInputResetBtn}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
          {currentSelectedStudent ? (
            <Box>
              <Divider sx={{ mt: "12px", mb: "8px" }} />
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button
                    startDecorator={<NavigateBeforeIcon />}
                    variant="plain"
                    onClick={handlePrevStudentBtn}
                    disabled={prevBtnDisabled}
                  >
                    Back
                  </Button>
                  <Box>
                    <Chip size="lg" color="primary">
                      {currentSelectedStudent
                        ? `Name- ${currentSelectedStudent.student_name}, Id- ${currentSelectedStudent.admission_no}, Roll No- ${currentSelectedStudent.class_roll}`
                        : "No Student Found"}
                    </Chip>
                  </Box>
                  <Button
                    endDecorator={<NavigateNextIcon />}
                    variant="plain"
                    onClick={handleNextStudentBtn}
                    disabled={nextBtnDisabled}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
              <Divider sx={{ mt: "12px", mb: "8px" }} />
              <Box padding="10px">
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                  {fetchingStudentPublishedResult ? (
                    <Grid
                      xs={12}
                      alignItems={"center"}
                      justifyContent={"center"}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >
                      <CircularProgress />
                      <Typography>Fetching...</Typography>
                    </Grid>
                  ) : null}
                  {studentPublishedResults &&
                    studentPublishedResults.map((result) => {
                      return (
                        <Grid>
                          <Sheet
                            variant="soft"
                            color="success"
                            sx={{
                              borderRadius: "8px",
                              border: "1px solid var(--bs-gray)",
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              sx={{ m: "10px" }}
                              justifyContent="space-between"
                            >
                              <Stack
                                direction={"column"}
                                flex={1}
                                height="100%"
                              >
                                <Box
                                  flex={1}
                                  display="flex"
                                  alignItems="center"
                                >
                                  <Typography
                                    level="title-lg"
                                    sx={{ ml: "1.2rem", mr: "1.2rem" }}
                                  >
                                    {result.examTitle}
                                  </Typography>
                                </Box>
                                <Divider />
                                <Typography level="body-sm" textAlign="center">
                                  Published:
                                  {result.publishedOn
                                    .toDate()
                                    .toLocaleDateString()}
                                </Typography>
                              </Stack>

                              <Divider
                                orientation="vertical"
                                sx={{ ml: "8px", mr: "8px" }}
                              />
                              <Stack direction={"column"}>
                                <Button
                                  variant="plain"
                                  color="primary"
                                  size="sm"
                                  onClick={() =>
                                    handleEditPublishedResult(result)
                                  }
                                  startDecorator={<EditIcon />}
                                ></Button>
                                <Button
                                  variant="plain"
                                  color="danger"
                                  size="sm"
                                  onClick={() =>
                                    handleResultDeleteBtn(result.docId!)
                                  }
                                  startDecorator={<Delete />}
                                ></Button>
                                <Button
                                  variant="plain"
                                  color="primary"
                                  size="sm"
                                  onClick={() =>
                                    sendWhatsappMessage()
                                  }
                                  startDecorator={<Send />}
                                ></Button>
                                <Button
                                  variant="plain"
                                  color="success"
                                  size="sm"
                                  onClick={() => printStudentMarksheet(result)}
                                  startDecorator={<Print />}
                                ></Button>
                              </Stack>
                            </Stack>
                          </Sheet>
                        </Grid>
                      );
                    })}

                  <Grid>
                    <Button
                      variant="outlined"
                      color="neutral"
                      onClick={() => setUpdateResultDialogOpen(true)}
                      sx={{ height: "110px", width: "90px" }}
                      startDecorator={<AddIcon />}
                    ></Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          ) : null}
        </Paper>
        <Modal
          open={updateResultDialogOpen}
          onClose={() => setUpdateResultDialogOpen(false)}
        >
          <ModalDialog
            variant="outlined"
            role="alertdialog"
            sx={{ minWidth: "580px", minHeight: "90%" }}
          >
            <DialogTitle>
              <UpdateIcon />
              Update Exam Result
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ display: "flex" }}>
              <Sheet variant="outlined">
                <Stack direction="row" p="10px" alignItems="center" gap={2}>
                  <Typography>Select Examination</Typography>
                  <Select
                    placeholder="select exam..."
                    sx={{ flex: 1 }}
                    value={selectedExam}
                    onChange={(e, val) => setSelectedExam(val)}
                  >
                    {examsList.map((item) => {
                      return (
                        <Option key={item.examId} value={item.examId}>
                          {item.examTitle}
                        </Option>
                      );
                    })}
                  </Select>
                </Stack>
              </Sheet>
              <Sheet variant="outlined">
                <Stack
                  direction="row"
                  p="10px"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>Add Paper</Typography>
                  <Stack direction={"row"} gap={2}>
                    <Select
                      multiple
                      placeholder="select paper..."
                      onChange={(e, val) => {
                        setSelectedPapers(val as string[])
                      }}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', gap: '0.25rem' }}>
                          {selected.map((selectedOption) => (
                            <Chip variant="soft" color="primary">
                              {selectedOption.label}
                            </Chip>
                          ))}
                        </Box>
                      )}
                    >
                      {paperList.map((item) => {
                        return (
                          <Option key={item.paperId} value={item.paperId}>
                            {item.paperTitle}
                          </Option>
                        );
                      })}
                    </Select>
                    <Button
                      startDecorator={<ArrowDownwardIcon />}
                      size="sm"
                      onClick={handleAddPaperBtn}
                    ></Button>
                  </Stack>
                </Stack>
              </Sheet>
              <Divider sx={{ mt: "8px", mb: "8px" }} />
              <Typography level="title-sm">
                Please fill marks for respective papers.
              </Typography>

              <Typography textAlign="center">Theory Marks + Practical Marks = Total Marks</Typography>
              <Sheet
                sx={{ mt: "6px", flex: 1, p: "10px" }}
                variant="soft"
                color="neutral"
              >
                {studentSelectedMarkList.length === 0 ? (
                  <Typography>No Paper Selected</Typography>
                ) : null}
                {studentSelectedMarkList.map((paper, index) => {
                  if (paper.paperId === "DRAWING") {
                    return (
                      <Stack
                        key={paper.paperId}
                        direction="row"
                        alignItems="center"
                        mb={"1rem"}
                        justifyContent="space-between"
                      >
                        <Typography level="title-md" sx={{ mr: "8px" }}>
                          {index + 1}. {paper.paperTitle}
                        </Typography>
                        <Stack direction={"row"} gap={2} justifyContent={"center"} alignItems={"center"}>
                          <Typography>Grade:</Typography>
                          <Select
                            sx={{ width: "150px" }}
                            onChange={(e, val) => handleMarkUpdate(val as string, paper, "THEORY")}
                            value={paper.paperMarkTheory as string}
                          >
                            {grades.map((grade) => (
                              <Option key={grade} value={grade}>
                                {grade}
                              </Option>
                            ))}
                          </Select>
                          <Button
                            size="sm"
                            variant="plain"
                            color="danger"
                            onClick={() => handlePaperDeleteBtn(paper)}
                            startDecorator={<Delete />}
                          ></Button>
                        </Stack>
                      </Stack>
                    );
                  } else {

                    return (
                      <Stack
                        key={paper.paperId}
                        direction="row"
                        alignItems="center"
                        mb={"1rem"}
                        justifyContent="space-between"
                      >
                        <Typography level="title-md" sx={{ mr: "8px" }}>
                          {index + 1}. {paper.paperTitle}
                        </Typography>
                        <Stack direction={"row"} gap={2} justifyContent={"center"} alignItems={"center"}>
                          <Input
                            type="text"
                            sx={{ width: "90px" }}
                            onChange={(e) =>
                              handleMarkUpdate(e.target.value, paper, "THEORY")
                            }
                            value={paper.paperMarkTheory || 0}
                          />
                          +
                          <Input
                            type="text"
                            sx={{ width: "90px" }}
                            onChange={(e) =>
                              handleMarkUpdate(e.target.value, paper, "PRAC")
                            }
                            value={paper.paperMarkPractical || 0}
                          />
                          =
                          <Input
                            type="text"
                            sx={{ width: "90px" }}
                            disabled
                            value={paper.paperMarkObtained || 0}
                          />
                          <Button
                            size="sm"
                            variant="plain"
                            color="danger"
                            onClick={() => handlePaperDeleteBtn(paper)}
                            startDecorator={<Delete />}
                          ></Button>
                        </Stack>
                      </Stack>
                    );
                  }
                })}
              </Sheet>
            </DialogContent>
            <DialogActions>
              <Button
                variant="solid"
                color="success"
                onClick={handleSaveResultBtn}
              >
                {isUpdatingResult ? "Update Result" : "Save Result"}
              </Button>

              <Button
                variant="plain"
                color="neutral"
                onClick={() => setUpdateResultDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
        <Modal
          open={isDeleteConfimDialogOpen}
          onClose={() => setIsDeleteConfirmDialogOpen(false)}
        >
          <ModalDialog variant="outlined" role="alertdialog">
            <DialogTitle>
              <WarningRoundedIcon />
              Confirmation
            </DialogTitle>
            <Divider />
            <DialogContent>
              Are you sure you want to delete exam result?
            </DialogContent>
            <DialogActions>
              <Button
                variant="solid"
                color="danger"
                onClick={handleDeletePaperAfterConfirmation}
              >
                Delete Result
              </Button>
              <Button
                variant="plain"
                color="neutral"
                onClick={() => setIsDeleteConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </LSPage>
    </PageContainer>
  );
}

export default UpdateResults;
