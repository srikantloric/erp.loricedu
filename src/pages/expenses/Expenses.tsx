import { Button, Stack } from "@mui/joy"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import TabsSegmentedControls from "components/Tabs/SegmentedTabs";
import { Add } from "@mui/icons-material";
import { useState } from "react";
import OverviewTab from "./expense-tabs/OverviewTab";
import ExpensesTab from "./expense-tabs/ExpensesTab";
import VendorsTab from "./expense-tabs/VendorsTab";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import CategoriesTab from "./expense-tabs/CategoriesTab";
function Expenses() {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  return (
    <PageContainer>
      <Navbar />
      <LSPage>

        <PageHeaderWithHelpButton title="Expense Management" />

        <Stack
          justifyContent={"space-between"}
          direction={"row"}
          mt={2}
        >
          <TabsSegmentedControls selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          {
            selectedTab === 0 ?
              <Button variant="solid" sx={{ borderRadius: "12px" }} size="sm" startDecorator={<Add />} >Add Expense</Button>
              : null
          }
        </Stack>
        {/* Render content based on selected tab */}
        <Stack mt={3}>
          {selectedTab === 0 && <OverviewTab />}
          {selectedTab === 1 && <ExpensesTab />}
          {selectedTab === 2 && <CategoriesTab />}
          {selectedTab === 3 && <VendorsTab />}

        </Stack>

      </LSPage>
    </PageContainer>
  )
}

export default Expenses