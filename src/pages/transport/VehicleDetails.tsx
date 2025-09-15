import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { IconBus } from "@tabler/icons-react";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";

import Tab1 from "./vehicleDetailsTabs/Tab1";


function VehicleDetails() {
  return (
    <>

      <BreadCrumbsV2
        Icon={IconBus}
        Path="Transport Management/Vehicle Details"
      />
      <br />
      <br />
      <Tabs aria-label="Basic tabs" defaultValue={0}>
        <TabList>
          <Tab>Add Vehicle/Vehicle Data</Tab>
        </TabList>
        <TabPanel value={0}>
          <Tab1 />
        </TabPanel>
      </Tabs>
    </>
  )
}

export default VehicleDetails