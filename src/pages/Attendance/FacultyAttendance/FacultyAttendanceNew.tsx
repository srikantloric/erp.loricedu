
import { Chip, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import OverViewTab from "./Tabs/OverViewTab";
import ManualAttendance from "./Tabs/ManualAttendance";


function FacultyAttendanceNew() {
    return (
        <>

            <PageHeaderWithHelpButton title="Faculty Attendance" />
            <Tabs aria-label="Basic tabs" defaultValue={0}>
                <TabList>
                    <Tab>Overview</Tab>
                    <Tab>
                        Manual Attendance
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
                    <ManualAttendance />
                </TabPanel>

            </Tabs>
        </>
    );
}

export default FacultyAttendanceNew;
