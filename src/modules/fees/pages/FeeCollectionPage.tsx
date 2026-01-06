import { useParams } from "react-router-dom";
import { FeeCollectionProvider } from "../context/FeeCollectionContext";
import { useNavbar } from "context/NavbarContext";
import {  Stack, Tab, tabClasses, TabList, Tabs } from "@mui/joy";
import StudentInfoSection from "../components/StudentInfoSection";
import TransportInfoSection from "../components/TransportInfoSection";
import FeeHeadsSection from "../components/FeeHeadsSection";
import PayableSummary from "../components/PayableSummary";
import FeeMonthSelector from "../components/FeeMonthSelector";
import PageHeaderWithCustomComponent from "components/Breadcrumbs/PageHeaderWithCustomComponent";
import { useEffect, useState } from "react";
import MiscCollectionSection from "../components/MiscCollectionSection";
import { useSidebar } from "context/SidebarContext";




function FeeCollectionPage() {

  const [selectedTab, setSelectedTab] = useState(0)

  const { isMini, setMini } = useSidebar()

  useEffect(() => {
    if (!isMini) setMini(true)
  }, [])

  const { studentId } = useParams();
  const { session } = useNavbar();

  if (!studentId) {
    return <div>Student ID is required</div>
  }


  return (
    <FeeCollectionProvider studentId={studentId} session={session}>
   
      <PageHeaderWithCustomComponent
        title="Students Fee Collection"
        component={
          <Tabs aria-label="tabs" defaultValue={0} sx={{ bgcolor: 'transparent' }}
            onChange={(_, newValue) => {
              if (typeof newValue === 'number') {
                setSelectedTab(newValue);
              }
            }}
            value={selectedTab}
          >
            <TabList
              disableUnderline
              sx={{
                p: 0.5,
                gap: 0.5,
                borderRadius: 'xl',
                bgcolor: 'background.level1',
                [`& .${tabClasses.root}[aria-selected="true"]`]: {
                  boxShadow: 'sm',
                  bgcolor: 'background.surface',
                },
              }}
            >
              <Tab disableIndicator>Regular</Tab>
              <Tab disableIndicator>Miscellaneous</Tab>
            </TabList>
          </Tabs>
        }
      />
      <br />
      <Stack direction={{ xs: "column", lg: "row" }} flex={1} spacing={2}>
        <Stack sx={{ flex: 0.7, }} spacing={2} >
          {/* Left Side - Student Info , Transport Info, Fee Header*/}
          <StudentInfoSection />
          <TransportInfoSection />
          <FeeHeadsSection />
        </Stack>


        {/* Regular Payment */}
        {selectedTab === 0 &&
          <Stack sx={{ flex: 0.4, }} spacing={2} >
            {/* Right Side - Summary and Actions */}
            <FeeMonthSelector />
            <PayableSummary />
          </Stack>
        }

        {/* Misc Payment */}
        {selectedTab === 1 &&
          <Stack sx={{ flex: 0.3 }} spacing={2}>
            <MiscCollectionSection />
          </Stack>
        }

      </Stack>
    </FeeCollectionProvider>
  )
}

export default FeeCollectionPage