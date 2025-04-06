import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { IconReport } from "@tabler/icons-react";
import { Paper } from "@mui/material";
import { Box, Button, Chip, Option, Select, Stack, Typography } from "@mui/joy";
import { useState } from "react";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { enqueueSnackbar } from "notistack";
import { getDemandSlips } from "utilities/ReportUtilityFunctions";
import { GenerateDemandSlip } from "components/Reports/DemandSlips/GenerateDemandSlip";
import { DemandSlipType } from "types/reports";




const DemandSlip = () => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [demandSlips, setDemandSlips] = useState<DemandSlipType[]>([])
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);


  //Handle Generate Demand Slip
  const handleGenerateDemandSlip = async () => {
    if (selectedClass === null) {
      enqueueSnackbar("Please select class!", { variant: "warning" });
      return;
    }
    setPdfUrl("");
    setLoading(true);
    try {
      const demandSlips = await getDemandSlips(selectedClass);
      setDemandSlips(demandSlips)
      if (demandSlips.length === 0) {
        setLoading(false);
        enqueueSnackbar("No Due Challan found for select options",{variant:"info"})
        return
      }
      const pdfUrl = await GenerateDemandSlip(demandSlips);
      setPdfUrl(pdfUrl);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      enqueueSnackbar("Something went wrong!", { variant: "error" })
    }

  }
  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV2 Icon={IconReport} Path="Fee Reports/Demand Slip" />

        <br />
        <Paper sx={{ p: "10px", mt: "8px" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography level="title-md">Demand Slip</Typography>
            </Box>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Select
                placeholder="Choose class"
                value={selectedClass}
                onChange={(e, val) => setSelectedClass(val)}
                required
              >
                {SCHOOL_CLASSES.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.title}
                  </Option>
                ))}
              </Select>

              <Button
                sx={{ ml: "8px" }}
                onClick={handleGenerateDemandSlip}
                loading={loading}
              >
                Generate Demand Slip
              </Button>
            </Stack>
          </Stack>
        </Paper>
        {pdfUrl && (
          <>
            <Chip sx={{ mt: "8px", mb: "8px" }}>
              Total demand slip count:{demandSlips.length}
            </Chip>
            <Paper sx={{ height: "100vh" }}>
              <iframe
                src={pdfUrl}
                title="PDF Viewer"
                width="100%"
                height="100%"
                frameBorder={0}
              />
            </Paper>
          </>
        )}
      </LSPage>
    </PageContainer>
  );
};

export default DemandSlip;
