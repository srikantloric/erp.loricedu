import { Tab, TabList, TabPanel, Tabs } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import AdmitCard from "./AdmitCard"
import ManualAdmitCard from "./ManualAdmitCard"

function GenerateAdmitCard() {
    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <PageHeaderWithHelpButton title="Admit Card Generator" />
                <br/>
                <Tabs aria-label="Basic tabs" defaultValue={0}>
                    <TabList>
                        <Tab>Bullk Generation</Tab>
                        <Tab>Manual Generation</Tab>
                    </TabList>
                    <TabPanel value={0}>
                        <AdmitCard/>
                    </TabPanel>
                    <TabPanel value={1}>
                        <ManualAdmitCard/>
                    </TabPanel>
                    
                </Tabs>
            </LSPage>
        </PageContainer>
    )
}

export default GenerateAdmitCard