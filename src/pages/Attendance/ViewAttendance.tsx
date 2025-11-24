
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";

import OverViewTab from "./viewAttendanceTabs/OverViewTab";
import AttendanceByStudentId from "./viewAttendanceTabs/AttendanceByStudentId";
import AttendanceByClass from "./viewAttendanceTabs/AttendanceByClass";

function ViewAttendance() {
  return (
    <>

      <BreadCrumbsV2
        Icon={FingerprintIcon}
        Path="Attendance/View Student Attendance"
      />
      <br />
      <Tabs aria-label="Basic tabs" defaultValue={0}>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>By Class</Tab>
          <Tab>By Student ID</Tab>
        </TabList>
        <TabPanel value={0}>
          <OverViewTab />
        </TabPanel>
        <TabPanel value={1}>
          <AttendanceByClass />
        </TabPanel>
        <TabPanel value={2}>
          <AttendanceByStudentId />
        </TabPanel>
      </Tabs>
    </>
  );
}

export default ViewAttendance;
