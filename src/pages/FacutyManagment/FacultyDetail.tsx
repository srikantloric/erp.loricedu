

import {
  Box,
} from "@mui/material";
import { useParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { FacultyType } from "types/facuities";
import { enqueueSnackbar } from "notistack";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import {  Divider, IconButton, ListItemDecorator, Stack, Tab, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import { collection, getDocs } from "firebase/firestore";
import FacultyAttendanceCard from "components/Card/FacultyAttendanceCard";
import { query, orderBy } from "firebase/firestore";
import NewAttendanceCalendar from "components/Calendar/NewAttendanceCalander";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import {  Fingerprint, InfoOutlined, Refresh } from "@mui/icons-material";
import PaymentIcon from '@mui/icons-material/Payment';
function FacultyDetail() {
  const { id } = useParams();
  const [teacherData, setTeacherData] = useState<FacultyType>();
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  //Get Firebase DB instance
  const { db } = useFirebase();

  useEffect(() => {
    if (!id) return; 

    const facultyRef = doc(db, "STUDENTS", id);

    const fetchFaculty = async () => {
      try {
        const facultySnap = await getDoc(facultyRef);
        if (facultySnap.exists()) {
          setTeacherData(facultySnap.data() as FacultyType);
        } else {
          enqueueSnackbar("Error while fetching teacher!", { variant: "error" });
        }
      } catch (error) {
        enqueueSnackbar("Failed to fetch teacher data!", { variant: "error" });
        console.error("Error fetching faculty:", error);
      }
    };

    fetchFaculty();
  }, [id, db]); // Depend on 'id'


  useEffect(() => {
    if (!id) return; // Ensure 'id' is available
    const fetchAttendance = async () => {
      try {
        const attendanceRef = query(
          collection(db, "STUDENTS", id, "MY_ATTENDANCE"),
          orderBy("timestamp", "desc")
        );
        const attendanceSnap = await getDocs(attendanceRef);
        const attendanceData = attendanceSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendanceRecords(attendanceData);
      } catch (error) {
        enqueueSnackbar("Failed to fetch attendance data!", { variant: "error" });
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();


  }, [id])

  return (
    <>
    
          <PageHeaderWithHelpButton title="Faculty Details" />
          <br></br>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "var(--bs-gray-201)",
              padding: "10px",
            }}
          >
            <div style={{ display: "flex" }}>
              <div>
                <img
                  src={teacherData && teacherData.facultyImage}
                  height="100%"
                  width={100}
                  style={{ objectFit: "cover" }}
                  alt="faculty profile"
                />
              </div>
              <div style={{ padding: "5px 15px" }}>
                <h4
                  style={{ margin: 0, padding: 0, textTransform: "uppercase" }}
                >
                  {teacherData && teacherData.facultyName}
                </h4>

                <div style={{ marginTop: "1.1rem", display: "flex" }}>
                  <div>
                    <p style={{ padding: 3, margin: 0, fontSize: "14px" }}>
                      Date Of Birth
                    </p>
                    <p style={{ padding: 3, margin: 0, fontSize: "14px" }}>
                      Date Of Joining
                    </p>
                    <p style={{ padding: 3, margin: 0, fontSize: "14px" }}>
                      Contact
                    </p>
                  </div>
                  <div>
                    <p style={{ padding: 3, margin: 0, fontSize: "14px" }}>
                      : {teacherData && teacherData.facultyDob}
                    </p>
                    <p style={{ padding: 3, margin: 0, fontSize: "14px" }}>
                      : {teacherData && teacherData.facultyDoj}
                    </p>
                    <p style={{ padding: 3, margin: 0, fontSize: "14px" }}>
                      : +91-{teacherData && teacherData.facultyPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs>
              <TabList>
                <Tab
                  variant="plain"
                  color="neutral">
                  <ListItemDecorator>
                    <Fingerprint />
                  </ListItemDecorator>
                  Attendance</Tab>
               
                <Tab
                  variant="plain"
                  color="neutral">
                  <ListItemDecorator>
                    <PaymentIcon />
                  </ListItemDecorator>
                  Payroll</Tab>
                <Tab
                  variant="plain"
                  color="neutral">
                  <ListItemDecorator>
                    <InfoOutlined />
                  </ListItemDecorator>
                  Info</Tab>
              </TabList>
              <TabPanel value={0}>
                <Stack direction="row" spacing={2} flex={1} sx={{ mb: 2 }} justifyContent={"space-between"}>
                  <Box sx={{ flex: 0.6 }}>
                    <NewAttendanceCalendar attendanceData={attendanceRecords} />
                  </Box>
                  <Divider orientation="vertical"></Divider>
                  <Stack sx={{ flex: 0.4 }}>
                    <Stack justifyContent={"space-between"} direction={"row"}>
                      <Typography level="title-lg" fontSize={24}>Attendance Logs</Typography>
                      <IconButton variant="solid" color="primary"><Refresh /></IconButton>
                    </Stack>
                    <Divider sx={{ mt: 1, mb: 1 }} />
                    <Box sx={{ height: "550px", overflowY: "auto", p: 2, backgroundColor: "#fff" }}>
                      {attendanceRecords && attendanceRecords.map((record) => (
                        <>
                          <FacultyAttendanceCard key={record.id} checkIn={record.checkIn} checkOut={record.checkOut} date={record.date} />
                        </>
                      ))}
                    </Box>
                  </Stack>
                </Stack>
              </TabPanel>
            

            </Tabs>
          </Box>
  
    </>
  );
}

export default FacultyDetail;
