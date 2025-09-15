import { Tab, TabList, TabPanel, Tabs } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import AdmitCard from "./AdmitCard"
import ManualAdmitCard from "./ManualAdmitCard"

function GenerateAdmitCard() {
    return (
        <>

            <PageHeaderWithHelpButton title="Admit Card Generator" />
            <br />
            <Tabs aria-label="Basic tabs" defaultValue={0}>
                <TabList>
                    <Tab>Bullk Generation</Tab>
                    <Tab>Manual Generation</Tab>
                </TabList>
                <TabPanel value={0}>
                    <AdmitCard />
                </TabPanel>
                <TabPanel value={1}>
                    <ManualAdmitCard />
                </TabPanel>

            </Tabs>
        </>
    )
}

export default GenerateAdmitCard