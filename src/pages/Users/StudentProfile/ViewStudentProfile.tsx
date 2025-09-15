import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import ListItemDecorator from "@mui/joy/ListItemDecorator";

import { Book, Bus, Profile, Setting4, UserEdit } from "iconsax-react";
import { Box, TabPanel } from "@mui/joy";
import ProfileTab from "./Tabs/ProfileTab";
import PersonalTab from "./Tabs/PersonalTab";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { StudentDetailsType } from "types/student";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import TransportTab from "./Tabs/TransportTab";
import AttendanceTab from "./Tabs/AttendanceTab";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";

interface IStudentReduxStore {
  studentarray: [];
  error: string | null;
  loading: boolean;
}
interface ITeachersReduxStore {
  studentarray: [];
  error: string | null;
  loading: boolean;
}

interface IReduxState {
  students: IStudentReduxStore;
  teachers: ITeachersReduxStore;
}

function ViewStudentProfile() {
  const studentStateData = useSelector(
    (state: IReduxState) => state.students.studentarray
  ) as StudentDetailsType[];
  const { id: studentDocId } = useParams();

  //Get Firebase DB instance
  const { db } = useFirebase();

  const [studentData, setStudentData] = useState<StudentDetailsType | null>(
    null
  );

  useEffect(() => {
    const fetchStudentData = async () => {
      if (studentStateData.length > 0) {
        const currentFilteredStudent = studentStateData.find(
          (students) => students.id === studentDocId
        );
        setStudentData(currentFilteredStudent!);
      } else {
        try {
          const docRef = doc(db, "STUDENTS", studentDocId!);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const studentDocData = docSnap.data() as StudentDetailsType;
            setStudentData(studentDocData);
          } else {
            enqueueSnackbar("Unable to load student data!", { variant: "error" });
          }
        } catch (error) {
          enqueueSnackbar("Unable to load student data: " + error, { variant: "error" });
        }
      }
    };

    fetchStudentData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentDocId, studentStateData, db]);

  return (
    <>

      <PageHeaderWithHelpButton title="Student Profile" />
      <Box
        mt="12px"
        sx={{
          backgroundColor: "#fff",
          padding: "14px",
          border: "1px solid var(--bs-gray-300)",
          borderRadius: "12px",
        }}
      >
        <Tabs
          aria-label="Icon tabs"
          defaultValue={0}
          sx={{ backgroundColor: "#fff", mt: "1rem" }}
        >
          <TabList>
            <Tab>
              <ListItemDecorator>
                <Profile size="18" />
              </ListItemDecorator>
              Profile
            </Tab>
            <Tab>
              <ListItemDecorator>
                <UserEdit size="18" />
              </ListItemDecorator>
              Personal
            </Tab>
            <Tab>
              <ListItemDecorator>
                <Bus size="18" />
              </ListItemDecorator>
              Transport
            </Tab>
            <Tab>
              <ListItemDecorator>
                <Book size="18" />
              </ListItemDecorator>
              Attendance
            </Tab>
            <Tab>
              <ListItemDecorator>
                <Setting4 size="18" />
              </ListItemDecorator>
              Settings
            </Tab>
          </TabList>
          <TabPanel value={0}>
            {studentData ? <ProfileTab studentData={studentData!} /> : null}
          </TabPanel>
          <TabPanel value={1}>
            {studentData ? <PersonalTab studentData={studentData!} /> : null}
          </TabPanel>
          <TabPanel value={2}>
            {studentData ? <TransportTab studentData={studentData!} /> : null}
          </TabPanel>
          <TabPanel value={3}>
            {studentData ? <AttendanceTab studentData={studentData} /> : null}
          </TabPanel>
          <TabPanel value={4}>
            Settings
          </TabPanel>
        </Tabs>
      </Box>
    </>
  );
}

export default ViewStudentProfile;
