import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { IconDatabaseCog } from "@tabler/icons-react";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import WebsiteContent from "./WebsiteContent";
import PhotoGalleryContent from "./PhotoGalleryContent";
import VideoGalleryContent from "./VideoGalleryContent";

const WebsiteConfig = () => {
  return (
    <PageContainer>
      <LSPage>
        <Navbar />
        <br />

        <BreadCrumbsV2 Icon={IconDatabaseCog} Path="Website Management" />
        <Box mt="1rem">
          <Tabs aria-label="Basic tabs" defaultValue={0}>
            <TabList>
              <Tab>Content</Tab>
              <Tab>Photo Gallery</Tab>
              <Tab>Video Gallery</Tab>
            </TabList>
            <TabPanel value={0} sx={{ minHeight: "90vh", p: "2rem" }}>
              <WebsiteContent />
            </TabPanel>
            <TabPanel value={1}>
              <PhotoGalleryContent />
            </TabPanel>
            <TabPanel value={2}>
              <VideoGalleryContent />
            </TabPanel>
          </Tabs>
        </Box>
      </LSPage>
    </PageContainer>
  );
};

export default WebsiteConfig;
