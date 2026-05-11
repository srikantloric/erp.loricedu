import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import ListItemDecorator from "@mui/joy/ListItemDecorator";

import { Book, Bus, Profile, UserEdit } from "iconsax-react";
import { Box, TabPanel } from "@mui/joy";
import ProfileTab from "./Tabs/ProfileTab";
import PersonalTab from "./Tabs/PersonalTab";
import { useParams } from "react-router-dom";
import { StudentDetailsType } from "types/student";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import TransportTab from "./Tabs/TransportTab";
import AttendanceTab from "./Tabs/AttendanceTab";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import { getStudentById } from "api/students";
import { useNavbar } from "context/NavbarContext";
import { IconSchool } from "@tabler/icons-react";
import AcademicTab from "./Tabs/AcademicTab";

function ViewStudentProfile() {
  const [studentData, setStudentData] = useState<StudentDetailsType | null>(
    null,
  );

  const { id: studentDocId } = useParams();

  //Get the select current session from navbar
  const { session } = useNavbar();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentDocId) {
        enqueueSnackbar("No student ID provided in URL!", { variant: "error" });
        return;
      }

      try {
        const studentData = await getStudentById(studentDocId, session);
        setStudentData(studentData);
      } catch (error) {
        enqueueSnackbar("Unable to load student data: " + error, {
          variant: "error",
        });
      }
    };
    fetchStudentData();
  }, [studentDocId]);

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
                <IconSchool size="18" />
              </ListItemDecorator>
              Academic
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
            {/* <Tab>
              <ListItemDecorator>
                <Setting4 size="18" />
              </ListItemDecorator>
              Settings
            </Tab> */}
          </TabList>
          <TabPanel value={0}>
            {studentData ? <ProfileTab studentData={studentData} /> : null}
          </TabPanel>
          <TabPanel value={1}>
            {studentData ? <PersonalTab studentData={studentData} /> : null}
          </TabPanel>
          <TabPanel value={2}>
            {studentData ? <AcademicTab studentData={studentData} /> : null}
          </TabPanel>
          <TabPanel value={3}>
            {studentData ? <TransportTab studentData={studentData} /> : null}
          </TabPanel>
          <TabPanel value={4}>
            {studentData ? <AttendanceTab studentData={studentData} /> : null}
          </TabPanel>
          {/* <TabPanel value={4}>Settings</TabPanel> */}
        </Tabs>
      </Box>
    </>
  );
}

export default ViewStudentProfile;
