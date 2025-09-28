import { Stack } from "@mui/joy"

import TabsSegmentedControls from "components/Tabs/SegmentedTabs";
import { useState } from "react";
import OverviewTab from "./expense-tabs/OverviewTab";
import ExpensesTab from "./expense-tabs/ExpensesTab";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import CategoriesTab from "./expense-tabs/CategoriesTab";
function Expenses() {
  const [selectedTab, setSelectedTab] = useState<number>(0);


  return (
    <>


      <PageHeaderWithHelpButton title="Expense Management" />

      <Stack
        justifyContent={"space-between"}
        direction={"row"}
        mt={2}
      >
        <TabsSegmentedControls selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </Stack>
      <Stack mt={3}>
        {selectedTab === 0 && <OverviewTab />}
        {selectedTab === 1 && <ExpensesTab />}
        {selectedTab === 2 && <CategoriesTab />}

      </Stack>
    </>
  )
}

export default Expenses