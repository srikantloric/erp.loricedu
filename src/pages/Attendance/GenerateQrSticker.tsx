import {
  Avatar,
  Box,
  Button,
  Chip,
  ChipDelete,
  Divider,
  Grid,
  Input,
  Option,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from "@mui/joy";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import HeaderTitleCard from "components/Card/HeaderTitleCard";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import jsPDF from "jspdf";
// import jsPDF from "jspdf"
import { useState } from "react";
import { StudentDetailsType } from "types/student";
import { Paper } from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { generateQRCodeBase64 } from "utilities/UtilitiesFunctions";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

type studentQrObjType = {
  qrImageBase64: string;
  studentRegNo: string;
  studentName: string;
};

function GenerateQrSticker() {
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetchingDataOfUser, setIsFetchingDataOfUser] = useState(false);
  const [studentSearchInput, setStudentSearchInput] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

    //Get Firebase DB instance
    const {db} = useFirebase();


  ///Generate by class
  const [selectedClass, setSelectedClass] = useState<number | null>(1);
  const [selectedStudentArrayForClass, setSelectedStudentArrayForClass] =
    useState<StudentDetailsType[]>([]);
  const [isFetchingDataOfClass, setIsFetchingDataOfClass] = useState(false);

  const [selectedStudentArray, setSelectedStudentArray] = useState<
    StudentDetailsType[]
  >([]);
  const [individualStudentData, setIndividualStudentData] =
    useState<StudentDetailsType>();

  // Function to generate QR codes from API
  const generateQRCodes = async (studentArr: StudentDetailsType[]) => {
    try {
      let i = 0;
      let qrArr = [];
      setLoading(true);
      for (i; i < studentArr.length; i++) {
        const base64QrImage = await generateQRCodeBase64(studentArr[i].id)
        const retData = {
          qrImageBase64: base64QrImage,
          studentRegNo: studentArr[i].admission_no,
          studentName: studentArr[i].student_name,
        };

        qrArr.push(retData);
      }
      return qrArr;
    } catch (error) {
      setLoading(false);
      console.error("Error generating QR codes:", error);
    }
  };

  // Function to generate PDF from QR codes
  const generatePDF = (qrCodeArray: studentQrObjType[]) => {
    if (qrCodeArray) {
      console.log("Before Null",previewUrl)
      setPreviewUrl("null")
      console.log("after Null",previewUrl)
      console.log("Generating PDF....", qrCodeArray);
      const doc = new jsPDF();
      // Calculate number of pages required based on number of QR codes
      const totalPages = Math.ceil(qrCodeArray.length / 16); // 4 QR codes per row, 6 rows per page
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          doc.addPage(); // Add new page for each additional set of QR codes
        }
        // Calculate starting and ending index for QR codes on current page
        const startIndex = page * 16;
        const endIndex = Math.min(startIndex + 16, qrCodeArray.length);
        const qrCodesOnPage = qrCodeArray.slice(startIndex, endIndex);
        let rowIndex = 0;
        let colIndex = 0;
        const xSpacing = 50; // Increase spacing between columns
        const ySpacing = 70;

        qrCodesOnPage.forEach((student: studentQrObjType, index: number) => {
          if (colIndex === 4) {
            colIndex = 0;
            rowIndex++;
          }
          const x = colIndex * xSpacing + 10;
          const y = rowIndex * ySpacing + 10;
          doc.addImage(student.qrImageBase64, "JPEG", x, y, 55, 55);
          // doc.rect(x, y, 45, 50)
          doc.setFontSize(9);
          doc.text(student.studentRegNo, x + 5, y + 55);
          doc.text(student.studentName, x + 5, y + 55 + 4);
          // doc.text(student.studentName,x,y+10);
          colIndex++;
        });
      }

      // doc.autoPrint()
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      setLoading(false);
    } else {
      setLoading(false);
      alert("No Qr in array found");
    }
  };

  function handleSearch(): void {
    if (searchInput) {
      setIndividualStudentData(undefined);
      setSelectedStudentArray([]);
      setSelectedStudentArrayForClass([]);
      setPreviewUrl(null);
      setIndividualStudentData(undefined);
  
      // Create a query to get the student by admission_no
      const studentsRef = collection(db, "STUDENTS");
      const q = query(studentsRef, where("admission_no", "==", searchInput));
  
      // Fetch the documents matching the query
      getDocs(q).then((documentSnap) => {
        if (documentSnap.size > 0) {
          const studentData = documentSnap.docs[0].data() as StudentDetailsType;
          setIndividualStudentData(studentData);
        }
      });
    }
  }

  const handleGeneratePdf = async (props:string) => {
    
    if (props==="individual" && individualStudentData) {
      console.log("qr for individual")
      setPreviewUrl(null)
      const tempArr: StudentDetailsType[] = [];
      tempArr.push(individualStudentData);
      const result = await generateQRCodes(tempArr);
      generatePDF(result!);
    } else if (props==="bulk" && selectedStudentArray.length > 0) {
      console.log("qr for bulk")
      setPreviewUrl(null)
      const result = await generateQRCodes(selectedStudentArray);
      console.log(result);
      generatePDF(result!);
    } else if (props === "byClass" && selectedStudentArrayForClass.length > 0) {
      setPreviewUrl(null)
      const result = await generateQRCodes(selectedStudentArrayForClass);
      console.log("qr for class")
      generatePDF(result!);
    } else {
      console.log("Student Data Couldn't be processed...");
    }
  };

  function handleStudentAdd(): void {
    if (studentSearchInput) {
      setIndividualStudentData(undefined);
      setSelectedStudentArray([]);
      setSelectedStudentArrayForClass([]);
      setIsFetchingDataOfUser(true);
      setPreviewUrl(null);
  
      // Create a query to get the student by admission_no
      const studentsRef = collection(db, "STUDENTS");
      const q = query(studentsRef, where("admission_no", "==", studentSearchInput));
  
      // Fetch the documents matching the query
      getDocs(q).then((documentSnap) => {
        if (documentSnap.size > 0) {
          const newStudents: StudentDetailsType[] = [];
          const docData = documentSnap.docs[0].data() as StudentDetailsType;
          newStudents.push(docData);
  
          setSelectedStudentArray((prevStudents) => [
            ...prevStudents,
            ...newStudents,
          ]);
          setIsFetchingDataOfUser(false);
        } else {
          setIsFetchingDataOfUser(false);
          setSearchInput("");
          enqueueSnackbar("Student doesn't exist in database!", {
            variant: "error",
          });
        }
      });
    } else {
      setIsFetchingDataOfUser(false);
      console.log("Enter user Id");
    }
  }

  const handleRemoveStudent = (student: StudentDetailsType) => {
    if (selectedStudentArray.length > 0) {
      const filteredData = selectedStudentArray.filter(
        (item) => item.admission_no !== student.admission_no
      );
      setSelectedStudentArray(filteredData);
    } else {
      const filteredData = selectedStudentArrayForClass.filter(
        (item) => item.admission_no !== student.admission_no
      );
      setSelectedStudentArrayForClass(filteredData);
    }
  };

  const handleSectionSearchBtn = () => {
    if (selectedClass) {
      setIndividualStudentData(undefined);
      setSelectedStudentArray([]);
      setSelectedStudentArrayForClass([]);
      setSelectedStudentArrayForClass([]); // You can remove this duplicate line
      setPreviewUrl(null);
      setIsFetchingDataOfClass(true);
  
      // Create a query to get students by class
      const studentsRef = collection(db, "STUDENTS");
      const q = query(studentsRef, where("class", "==", selectedClass));
  
      // Fetch the documents matching the query
      getDocs(q).then((docSnap) => {
        if (docSnap.size > 0) {
          const newStudents: StudentDetailsType[] = [];
          docSnap.forEach((doc) => {
            const docData = doc.data() as StudentDetailsType;
            newStudents.push(docData);
          });
          setSelectedStudentArrayForClass(newStudents);
        }
        setIsFetchingDataOfClass(false);
      });
    } else {
      setIsFetchingDataOfClass(false);
      enqueueSnackbar("Please select class", { variant: "error" });
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV2
          Icon={FingerprintIcon}
          Path="Attendance/Generate QR Sticker"
        />
        <HeaderTitleCard Title="Generate QR Code Sticker" />
        <Tabs aria-label="Basic tabs" defaultValue={0}>
          <TabList>
            <Tab>Individual Student</Tab>
            <Tab>Bulk Generation</Tab>
            <Tab>Entire Class</Tab>
          </TabList>
          <TabPanel value={0} sx={{ minHeight: "60vh" }}>
            <b>Generate</b> sticker for single student
            <Grid container spacing={2} marginTop={2}>
              <Grid xs={3}>
                <Paper
                  sx={{
                    padding: "8px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Stack
                    direction={"row"}
                    spacing={2}
                    marginBottom={1.5}
                    marginTop={1}
                    marginLeft={0.5}
                    marginRight={0.5}
                  >
                    <Input
                      placeholder="Student ID"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <Button
                      startDecorator={<Search />}
                      variant="soft"
                      onClick={handleSearch}
                    />
                  </Stack>

                  {individualStudentData ? (
                    <>
                      <img
                        src={
                          individualStudentData &&
                          individualStudentData.profil_url
                        }
                        alt="Student Profile"
                        width="100%"
                        height={150}
                        style={{
                          objectFit: "contain",
                          background: "var(--bs-gray-400)",
                        }}
                      />
                      <br />
                      <table style={{ marginBottom: "5px" }}>
                        <td>
                          <tr>
                            <Typography>Name:</Typography>
                          </tr>
                          <tr>
                            <Typography>ID:</Typography>
                          </tr>
                          <tr>
                            <Typography>Class:</Typography>
                          </tr>
                          <tr>
                            <Typography>Roll No:</Typography>
                          </tr>
                        </td>
                        <td>
                          <tr>
                            <Typography fontWeight="700">
                              {individualStudentData &&
                                individualStudentData.student_name}
                            </Typography>
                          </tr>
                          <tr>
                            <Typography>
                              {individualStudentData &&
                                individualStudentData.admission_no}
                            </Typography>
                          </tr>
                          <tr>
                            <Typography>
                              {individualStudentData &&
                                individualStudentData.class}
                            </Typography>
                          </tr>
                          <tr>
                            <Typography>
                              {individualStudentData &&
                                individualStudentData.class_roll}
                            </Typography>
                          </tr>
                        </td>
                      </table>

                      <Button
                        sx={{ width: "100%", mb: "5px" }}
                        color="neutral"
                        onClick={()=>handleGeneratePdf("individual")}
                        loading={loading}
                      >
                        Generate Sticker
                      </Button>
                    </>
                  ) : null}
                </Paper>
              </Grid>
              <Grid
                xs={9}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {previewUrl && individualStudentData ? (
                  <iframe
                    src={previewUrl}
                    title="PDF viewwer"
                    style={{ height: "52vh", width: "100%" }}
                  ></iframe>
                ) : (
                  <p>Your Generated PDF will be shown here</p>
                )}
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={1}>
            <b>Generate</b> Sticker In Bulk
            <Grid container spacing={2} marginTop={2}>
              <Grid xs={3}>
                <Paper
                  sx={{
                    padding: "12px",
                    height: "60vh",

                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Stack
                      direction={"row"}
                      spacing={2}
                      marginBottom={1.5}
                      marginTop={1}
                      marginLeft={0.5}
                      marginRight={0.5}
                    >
                      <Input
                        placeholder="Student ID"
                        value={studentSearchInput}
                        onChange={(e) => setStudentSearchInput(e.target.value)}
                      />
                      <Button
                        startDecorator={<Add />}
                        variant="soft"
                        loading={isFetchingDataOfUser}
                        onClick={handleStudentAdd}
                      />
                    </Stack>
                    <Divider />
                  </Box>
                  <Stack direction="column" gap={1.5}>
                    {selectedStudentArray &&
                      selectedStudentArray.map((student, index) => {
                        return (
                          <Chip
                            key={index}
                            startDecorator={<Avatar src={student.profil_url} />}
                            endDecorator={
                              <ChipDelete
                                onDelete={() => handleRemoveStudent(student)}
                              />
                            }
                            sx={{
                              "--Chip-decoratorChildHeight": "28px",
                            }}
                          >
                            {student.student_name + "-" + student.admission_no}
                          </Chip>
                        );
                      })}
                  </Stack>
                  <br />
                  <Button
                    sx={{ width: "100%", mb: "5px" }}
                    color="neutral"
                    onClick={()=>handleGeneratePdf("bulk")}
                    loading={loading}
                  >
                    Generate Sticker
                  </Button>
                </Paper>
              </Grid>
              <Grid
                xs={9}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {previewUrl && selectedStudentArray.length > 0 ? (
                  <iframe
                    src={previewUrl}
                    title="PDF viewwer"
                    style={{ height: "52vh", width: "100%" }}
                  ></iframe>
                ) : (
                  <p>Your Generated PDF will be shown here</p>
                )}
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={2}>
            <b>Generate</b> Sticker For Whole Class In
            <Grid container spacing={2} marginTop={2}>
              <Grid xs={3}>
                <Paper
                  sx={{
                    padding: "12px",
                    height: "60vh",

                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography>Select Class</Typography>
                    <Stack direction="row" gap={1}>
                      <Select
                        value={selectedClass}
                        onChange={(e, val) => setSelectedClass(val)}
                        sx={{ width: "100%" }}
                      >
                        <Option value={1}>Nursery</Option>
                        <Option value={2}>LKG</Option>
                        <Option value={3}>UKG</Option>
                        <Option value={4}>STD-1</Option>
                        <Option value={5}>STD-2</Option>
                        <Option value={6}>STD-3</Option>
                        <Option value={7}>STD-4</Option>
                        <Option value={8}>STD-5</Option>
                        <Option value={9}>STD-6</Option>
                        <Option value={10}>STD-7</Option>
                        <Option value={11}>STD-8</Option>
                        <Option value={12}>STD-9</Option>
                        <Option value={13}>STD-10</Option>
                      </Select>

                      <Button
                        startDecorator={<Search />}
                        size="sm"
                        variant="soft"
                        loading={isFetchingDataOfClass}
                        onClick={handleSectionSearchBtn}
                      />
                    </Stack>

                    <Divider sx={{ mt: "8px" }} />
                  </Box>
                  <Stack direction="column" gap={1.5}>
                    {selectedStudentArrayForClass &&
                      selectedStudentArrayForClass.map((student, index) => {
                        return (
                          <Chip
                            key={index}
                            startDecorator={<Avatar src={student.profil_url} />}
                            endDecorator={
                              <ChipDelete
                                onDelete={() => handleRemoveStudent(student)}
                              />
                            }
                            sx={{
                              "--Chip-decoratorChildHeight": "28px",
                            }}
                          >
                            {student.student_name + "-" + student.admission_no}
                          </Chip>
                        );
                      })}
                  </Stack>
                  <br />
                  <Button
                    sx={{ width: "100%", mb: "5px" }}
                    color="neutral"
                    onClick={()=>handleGeneratePdf("byClass")}
                    loading={loading}
                  >
                    Generate Sticker
                  </Button>
                </Paper>
              </Grid>
              <Grid
                xs={9}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {previewUrl && selectedStudentArrayForClass.length > 0 ? (
                  <iframe
                    src={previewUrl}
                    title="PDF viewwer"
                    style={{ height: "52vh", width: "100%" }}
                  ></iframe>
                ) : (
                  <p>Your Generated PDF will be shown here</p>
                )}
              </Grid>
            </Grid>
          </TabPanel>
        </Tabs>
      </LSPage>
    </PageContainer>
  );
}

export default GenerateQrSticker;
