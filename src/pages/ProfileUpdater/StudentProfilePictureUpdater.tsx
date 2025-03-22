import {
  Box,
  Button,
  Divider,
  Grid,
  Input,
  LinearProgress,
  Option,
  Select,
  Table,
  ToggleButtonGroup,
} from "@mui/joy";
import UpdateStudentImageCard from "components/Card/UpdateStudentImageCard";
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from "config/schoolConfig";
import { useFirebase } from "context/firebaseContext";
import {  collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { StudentDetailsType } from "types/student";

const StudentProfilePictureUpdater: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentDetailsType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputSearch, setInputSearch] = useState<string>("");
  const [tabSelected, setTabSelected] = useState<string>("byClass");

  //Get Firebase DB instance
  const {db} = useFirebase();

  const handleStudentFetching = () => {
    if (selectedSection === null || selectedClass === null) {
      enqueueSnackbar("Please select class & section", { variant: "error" });
      return;
    }

    setLoading(true);
    const studentQuery = query(
      collection(db, "STUDENTS"),
      where("class", "==", selectedClass),
      where("section", "==", selectedSection)
    );

    onSnapshot(studentQuery, (documentSnap) => {
      if (documentSnap.empty) {
        enqueueSnackbar("No record found for selected class/section", { variant: "info" });
        setStudentData([]);
      } else {
        const tempArr = documentSnap.docs.map((doc) => doc.data() as StudentDetailsType);
        setStudentData(tempArr);
      }
      setLoading(false);
    });
  };

  const handleSearchById = async () => {
    if (!inputSearch) {
      enqueueSnackbar("Please enter a valid ID", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const studentQuery = query(
        collection(db, "STUDENTS"),
        where("admission_no", "==", inputSearch)
      );
      const documentSnap = await getDocs(studentQuery);

      if (documentSnap.empty) {
        enqueueSnackbar("No student found with this ID!", { variant: "info" });
        setStudentData([]);
      } else {
        const tempArr = documentSnap.docs.map((doc) => doc.data() as StudentDetailsType);
        setStudentData(tempArr);
      }
    } catch (error) {
      enqueueSnackbar("Error fetching student data", { variant: "error" });
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        padding: "8px",
        flexDirection: "column",
        alignItems: "center",
        background: "var(--colour-background)",
        minHeight: "100vh",
      }}
    >
      <ToggleButtonGroup
        value={tabSelected}
        sx={{ marginTop: "10px", marginBottom: "10px" }}
        onChange={(event, newValue) => setTabSelected(newValue!)}
      >
        <Button value="byClass">Search By Class</Button>
        <Button value="byId">Search By ID</Button>
      </ToggleButtonGroup>
      <br />
      <center>
        {tabSelected === "byClass" ? (
          <>
            <Grid container spacing={2}>
              <Grid xs={4}>
                <Select
                  placeholder="Class"
                  value={selectedClass}
                  onChange={(e, val) => setSelectedClass(val)}
                  required
                >
                  {SCHOOL_CLASSES.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Grid>
              <Grid xs={4}>
                <Select
                  placeholder="Section"
                  value={selectedSection}
                  onChange={(e, val) => setSelectedSection(val)}
                  required
                >
                  {SCHOOL_SECTIONS.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Grid>
              <Grid xs={4}>
                <Button fullWidth onClick={handleStudentFetching}>
                  Search
                </Button>
              </Grid>
            </Grid>
            <br />
            <Divider />
            <Box>
              {loading && <LinearProgress thickness={3} />}
              <br />
              <Table>
                <tbody>
                  {studentData.map((student) => (
                    <tr key={student.id} style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UpdateStudentImageCard
                        imageUrl={student.profil_url}
                        name={student.student_name}
                        father_name={student.father_name}
                        doc_id={student.id}
                        student_id={student.admission_no}
                        student_email={student.email}
                      />
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid xs={8}>
                <Input
                  placeholder="Type Student ID..."
                  value={inputSearch}
                  onChange={(e) => setInputSearch(e.target.value)}
                />
              </Grid>

              <Grid xs={4}>
                <Button fullWidth onClick={handleSearchById}>
                  Search
                </Button>
              </Grid>
            </Grid>
            <br />
            <Divider />
            <Box>
              {loading && <LinearProgress thickness={3} />}
              <br />
              <Table>
                <tbody>
                  {studentData.map((student) => (
                    <tr key={student.id} style={{ padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UpdateStudentImageCard
                        imageUrl={student.profil_url}
                        name={student.student_name}
                        father_name={student.father_name}
                        doc_id={student.id}
                        student_id={student.admission_no}
                        student_email={student.email}
                      />
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </>
        )}
      </center>
    </div>
  );
};

export default StudentProfilePictureUpdater;
