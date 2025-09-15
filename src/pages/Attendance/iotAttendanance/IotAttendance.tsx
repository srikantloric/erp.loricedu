import { ListItemDecorator, Tab, TabList, TabPanel, Tabs } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"

import RFIDConfigTab from "./attendanceConfigTabs/RFIDConfigTab"
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import SettingsIcon from '@mui/icons-material/Settings';
import AttenzyIot from "./attenzyIotTab/AttenzyIot"
function IotAttendance() {
    return (
        <>

            <PageHeaderWithHelpButton title="IOT Smart Attendance" />
            <br />
            <Tabs aria-label="Basic tabs" defaultValue={0}>
                <TabList>
                    <Tab>
                        <ListItemDecorator>
                            <FingerprintIcon />
                        </ListItemDecorator>
                        Attenzy IOT</Tab>
                    <Tab>
                        <ListItemDecorator>
                            <SettingsIcon />
                        </ListItemDecorator>
                        ID Card Setup</Tab>
                </TabList>
                <TabPanel value={0}>
                    <AttenzyIot />
                </TabPanel>
                <TabPanel value={1}>
                    <RFIDConfigTab />
                </TabPanel>

            </Tabs>
        </>
    )
}

export default IotAttendance