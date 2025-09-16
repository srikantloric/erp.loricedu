import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";

import { IconReport } from "@tabler/icons-react";
import { Box, Button, Card, Chip, Divider, Input, Stack, Typography } from "@mui/joy";
import { KeyboardArrowRight, Search } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Report = {
  title: string;
  description: string;
  id: string;
};

const reports: Report[] = [

  {
    id: "due-report",
    title: "Due Sheet",
    description: "Get all due list of students",
  },
  // {
  //   id: "daily-attendance-report",
  //   title: "Daily Attendance Report",
  //   description: "Print daily attendance report for each class",
  // },
  // {
  //   id: "attendance-register",
  //   title: "Attendance Register",
  //   description: "Print attendance register for each class",
  // },
  {
    id: "demand-slip",
    title: "Demand Slip",
    description: "Print demand slip for students due payments.",
  },

  {
    id: "admit-card",
    title: "Admit Card",
    description: "Print admit card of students",
  },
  {
    id: "students-list",
    title: "Student List",
    description: "Print list for students",
  },
  {
    id: "faculty-daily-attendance",
    title: "Faculty Daily Attendance",
    description: "Generate daily attendance report for faculty members",
  },
  {
    id: "faculty-monthly-attendance",
    title: "Faculty Monthly Attendance",
    description: "Generate monthly attendance report for faculty members",
  },
  {
    id: "balance-sheet",
    title: "Balance Sheet",
    description: "Generate Balance Sheet For Management",
  },
];

function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>

      <BreadCrumbsV2 Icon={IconReport} Path="Fee Reports" />

      <Input
        startDecorator={<Search />}
        sx={{
          mt: 4,
          mb: 2,
        }}
        placeholder="Search for reports..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      ></Input>

      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          gap: 2,
        }}
      >
        {filteredReports.map((report) => {
          return (
            <Card
              size="sm"
              variant="outlined"
              key={report.id}
              sx={{ height: "100%" }}
            >
              <Stack
                direction={"row"}
                justifyContent={"space-between"}
                sx={{ height: "100%" }}
              >
                <Stack>
                  <Typography level="title-sm" >{report.title}</Typography>
                  <Typography level="body-xs">
                    {report.description}
                  </Typography>
                </Stack>
                <Button
                  variant="soft"
                  color="neutral"
                  endDecorator={<KeyboardArrowRight />}
                  sx={{ height: "100%" }}
                  onClick={() => navigate(`${report.id}`)}
                >
                  Generate
                </Button>
              </Stack>
            </Card>
          );
        })}
      </Box>
      <br />
      <Divider role="presentation" sx={{ '--Divider-childPosition': '2%' }}>
        <Chip variant="soft" color="neutral" size="sm">Hard Copies</Chip>
      </Divider>
      <Box
        sx={{
          width: "100%",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          gap: 2,
          mt: 1
        }}
      >
        <Card
          size="sm"
          variant="outlined"
          sx={{ height: "100%" }}
        >
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            sx={{ height: "100%" }}
          >
            <Stack>
              <Typography level="title-md" >Admission Form</Typography>
              <Typography level="body-xs" >
                Admission Form (English)
              </Typography>
            </Stack>
            <Button
              variant="soft"
              color="neutral"
              endDecorator={<KeyboardArrowRight />}
              sx={{ height: "100%" }}
              target="_blank"
              component="a"
              href="https://firebasestorage.googleapis.com/v0/b/apx-international-dev.firebasestorage.app/o/documents%2Fadmission-form.pdf?alt=media&token=5fc17ec9-21f5-4dc1-a6ed-6bfe0a6df470"
            >
              Print
            </Button>
          </Stack>
        </Card>
        <Card
          size="sm"
          variant="outlined"
          sx={{ height: "100%" }}
        >
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            sx={{ height: "100%" }}
          >
            <Stack>
              <Typography level="title-md">Admission Form</Typography>
              <Typography level="body-xs">
                Admission Form (Hindi)
              </Typography>
            </Stack>
            <Button
              variant="soft"
              color="neutral"
              endDecorator={<KeyboardArrowRight />}
              sx={{ height: "100%" }}
              target="_blank"
              component="a"
              href="https://firebasestorage.googleapis.com/v0/b/apx-international-dev.firebasestorage.app/o/documents%2Fadmission-form.pdf?alt=media&token=5fc17ec9-21f5-4dc1-a6ed-6bfe0a6df470"
            >
              Print
            </Button>
          </Stack>
        </Card>
      </Box>
    </>
  );
}

export default Reports;
