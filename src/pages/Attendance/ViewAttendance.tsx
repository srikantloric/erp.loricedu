
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import { Chip, Tab, TabList, TabPanel, Tabs } from "@mui/joy";

import OverViewTab from "./viewAttendanceTabs/OverViewTab";
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
          <Tab>
            Attendance Class Wise
            <Chip
              size="sm"
              color="danger"
              variant="solid"
              sx={{ ml: 0.4, fontSize: "0.65rem", px: "0.4rem" }}
            >
              NEW
            </Chip>
          </Tab>
        </TabList>
        <TabPanel value={0}>
          <OverViewTab />
        </TabPanel>
        <TabPanel value={1}>
          <AttendanceByClass />
        </TabPanel>

      </Tabs>
    </>
  );
}

export default ViewAttendance;
