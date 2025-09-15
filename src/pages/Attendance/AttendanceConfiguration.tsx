
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"

import RFIDConfigTab from "./iotAttendanance/attendanceConfigTabs/RFIDConfigTab"

function AttendanceConfiguration() {




    return (
        <>

            <PageHeaderWithHelpButton title="Attendance Config" />
            <br />
            <Tabs aria-label="Basic tabs" defaultValue={0}>
                <TabList>
                    <Tab>RFID Setup</Tab>

                </TabList>
                <TabPanel value={0}>
                    <RFIDConfigTab />
                </TabPanel>

            </Tabs>
        </>
    )
}

export default AttendanceConfiguration