import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import ListItemDecorator from "@mui/joy/ListItemDecorator";

import PageContainer from "components/Utils/PageContainer";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Book, Moneys, Profile, Setting4, UserEdit } from "iconsax-react";
import { Box, TabPanel, Typography } from "@mui/joy";
import ProfileTab from "./Tabs/ProfileTab";
import PersonalTab from "./Tabs/PersonalTab";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { StudentDetailsType } from "types/student";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {db} from '../../../firebase'
import { doc, getDoc } from "firebase/firestore";

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
        console.log(studentData);
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
  }, [studentDocId, studentStateData]);

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV2
          Icon={AccountCircleIcon}
          Path="Students  /StudentProfile"
        />
        <Typography level="h3" m="6px">
          Student Profile
        </Typography>
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
                  <Moneys size="18" />
                </ListItemDecorator>
                Payments
              </Tab>
              <Tab>
                <ListItemDecorator>
                  <Book size="18" />
                </ListItemDecorator>
                Exams
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
              {studentData?<PersonalTab studentData={studentData!} />:null}
            </TabPanel>
            <TabPanel value={2}>
              In Progress
            </TabPanel>
            <TabPanel value={3}>
              In Progress
            </TabPanel>
            <TabPanel value={4}>
              Settings
            </TabPanel>
          </Tabs>
        </Box>
      </LSPage>
    </PageContainer>
  );
}

export default ViewStudentProfile;
