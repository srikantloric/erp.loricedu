import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { Settings } from "iconsax-react";
import AddClasses from "./AddClasses";
import AddSections from "./AddSections";
import AddReligions from "./AddReligion";
import AddReligionCategory from "./AddCasteCategory";
import AddSubjects from "./AddSubjects";
function MasterData() {
  return (
    <PageContainer>
    <LSPage>
      <Navbar />
      <br />
      <BreadCrumbsV2 Path="Configurations/Settings" Icon={Settings} />
      <Box mt="1rem">
        <Tabs aria-label="Basic tabs" defaultValue={0}>
          <TabList>
            <Tab>Classes</Tab>
            <Tab>Sections</Tab>
            <Tab>Religion</Tab>
            <Tab>Caste Category</Tab>
            <Tab>Subjects</Tab>
          </TabList>
          <TabPanel value={0} sx={{ minHeight: "90vh", p: "2rem" }}>
            <AddClasses />
          </TabPanel>
          <TabPanel value={1}>
            <AddSections/>
          </TabPanel>
          <TabPanel value={2}>
            <AddReligions/>
          </TabPanel>
         
          <TabPanel value={3}>
            <AddReligionCategory/>
          </TabPanel>
          <TabPanel value={4}>
            <AddSubjects/>
          </TabPanel>
         
        </Tabs>
      </Box>
    </LSPage>
  </PageContainer>
  )
}

export default MasterData