
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import RFIDConfigTab from "./attendanceConfigTabs/RFIDConfigTab"

function AttendanceConfiguration() {





    return (
        <PageContainer>
            <Navbar />
            <LSPage>
            <PageHeaderWithHelpButton title="Attendance Config" />
                <br />
                <Tabs aria-label="Basic tabs" defaultValue={0}>
                    <TabList>
                        <Tab>RFID Setup</Tab>
                      
                    </TabList>
                    <TabPanel value={0}>
                        <RFIDConfigTab/>
                    </TabPanel>
                   
                </Tabs>
            </LSPage>
        </PageContainer>
    )
}

export default AttendanceConfiguration