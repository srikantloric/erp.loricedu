import { Box, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { Settings } from "iconsax-react";
import RecieptConfigurations from "./Tabs/RecieptConfigurations";
import PaymentConfigurations from "./Tabs/PaymentConfigurations";
import SMSNotification from "./Tabs/SMSNotification";

function SettingsPage() {
  return (
    <PageContainer>
      <LSPage>
        <Navbar />
        <br />
        <BreadCrumbsV2 Path="Configurations/Settings" Icon={Settings} />
        <Box mt="1rem">
          <Tabs aria-label="Basic tabs" defaultValue={0}>
            <TabList>
              <Tab>Reciept Cofigurations</Tab>
              <Tab>Payment Configurations</Tab>
              <Tab>SMS Notification</Tab>
            </TabList>
            <TabPanel value={0} sx={{ minHeight: "90vh", p: "2rem" }}>
              <RecieptConfigurations />
            </TabPanel>
            <TabPanel value={1}>
              <PaymentConfigurations/>
            </TabPanel>
            <TabPanel value={2}>
              <SMSNotification/>
            </TabPanel>
          </Tabs>
        </Box>
      </LSPage>
    </PageContainer>
  );
}

export default SettingsPage;
