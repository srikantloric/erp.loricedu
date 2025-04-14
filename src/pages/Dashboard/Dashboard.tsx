import Navbar from "../../components/Navbar/Navbar";
import LSPage from "../../components/Utils/LSPage";
import CardDashboard from "../../components/Card/CardDashboard";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import PageContainer from "../../components/Utils/PageContainer";
import BarGraphChart from "../../components/Graph/BarGraphChart";

import {
  Box,
  Divider,
  Grid,
  LinearProgress,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import cardBack from "../../assets/widgets/img-dropbox-bg.svg";
import {
  Card,
  Dash,
  Money,
  MoneySend,
  Profile2User,
  Simcard1,
  WalletMoney,
} from "iconsax-react";
import { Avatar } from "@mui/material";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import { useEffect, useState } from "react";

import { fetchTotalStudents } from "store/reducers/dashboardSlice";
import { RootState, useDispatch, useSelector } from "store";
import MaleFemaleBarGraph from "components/Graph/MaleFemaleBarGraph";
import Footer from "components/Footer/Footer";



Chart.register(CategoryScale);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
    },
    title: {
      display: true,
      text: "Attendance Chart",
    },
  },
};

function Dashboard() {
  const { totalStudents, totalFeeCollection, totalFemaleStudent, totalMaleStudent } = useSelector((state: RootState) => state.dashboard.dashboardAnalytics);
  const [smsBalance, setSmsBalance] = useState<number>(0);


  const dispatch = useDispatch();

  const fetchSMSBalance = async () => {
    const apiKey = process.env.REACT_APP_SMS_GATEWAY_API_KEY;
    const result = await fetch(`https://www.fast2sms.com/dev/wallet?authorization=${apiKey}`)
    const data = await result.json();
    setSmsBalance(data.wallet);
  }

  useEffect(() => {
    dispatch(fetchTotalStudents());
    fetchSMSBalance();
  }, [dispatch]);

  return (
    <>
      <PageContainer>
        <Navbar />
        <LSPage>
          <BreadCrumbsV2 Path="Dashboard/Analytics" Icon={Dash} />
          <Stack
            direction={{ xs: "column", md: "row" }}
            mt="0.8rem"

            spacing={1}
          >
            <Grid
              container
              justifyContent="space-between"
              gap="0.5rem"
              flex={1}
            >
              <Grid xs={12} md={3.9} lg={3.9}>
                <CardDashboard
                  headerTitle={totalStudents || "-"}
                  subHeaderTitle="Total Students"
                  color="#81c784"
                  Icon={Profile2User}
                />
              </Grid>
              <Grid xs={12} md={3.9} lg={3.9}>
                <CardDashboard
                  headerTitle={`₹${(totalFeeCollection && totalFeeCollection.thisYear) || "-"}`}
                  subHeaderTitle="Total Income This Year"
                  color="#9575cd"
                  Icon={MoneySend}
                />
              </Grid>
              <Grid xs={12} md={3.9} lg={3.9}>
                <CardDashboard
                  headerTitle="-"
                  subHeaderTitle="Dues-Amount : -"
                  color="#4fc3f7"
                  Icon={WalletMoney}
                />
              </Grid>
              <Grid xs={12} md={3.9} lg={3.9}>
                <CardDashboard
                  headerTitle={`₹${(totalFeeCollection && totalFeeCollection.thisMonth) || "-"}`}
                  subHeaderTitle="Income This Month"
                  color="#64b5f6"
                  Icon={Money}
                />
              </Grid>
              <Grid xs={12} md={3.9} lg={3.9}>
                <CardDashboard
                  headerTitle={`₹${(totalFeeCollection && totalFeeCollection.today) || "-"}`}
                  subHeaderTitle="Income Today"
                  color="#E48F45"
                  Icon={Money}
                />
              </Grid>
              <Grid xs={12} md={3.9} lg={3.9}>
                <CardDashboard
                  headerTitle="-"
                  subHeaderTitle="Profit This Month"
                  color="#ffb74d"
                  Icon={Money}
                />
              </Grid>
            </Grid>

            <Stack justifyContent="space-between">
              <Stack
                sx={{
                  width: "100%",
                  p: "1rem",
                  borderRadius: "0.5rem",
                  bgcolor: "#1D2630",
                  position: "relative",
                  overflow: "hidden",
                  justifyContent: "space-between",
                  flex: 1,
                  mb: "0.5rem",
                  "&:after": {
                    content: '""',
                    backgroundImage: `url(${cardBack})`,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    opacity: 0.5,
                    backgroundPosition: "bottom right",
                    backgroundSize: "100%",
                    backgroundRepeat: "no-repeat",
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography level="title-lg" sx={{ color: "#fff" }}>
                    SMS Balance
                  </Typography>
                  <Typography level="h4" sx={{ color: "#fff" }}>
                    ₹{smsBalance}
                  </Typography>
                </Stack>
                <Avatar
                  color="secondary"
                  variant="rounded"
                  sx={{ mt: 0.75, bgcolor: "#2F3841", opacity: "0.8" }}
                >
                  <Simcard1 color="#fff" opacity="0.6" />
                </Avatar>
                <Typography level="body-sm" mt="0.5rem" sx={{ color: "#fff" }}>
                  {smsBalance && Math.floor(smsBalance * 100 / 25)} SMS Remaining
                </Typography>
                <Box mt="0.5rem">
                  <LinearProgress
                    determinate
                    value={45}
                    color="success"
                    variant="solid"
                  />
                </Box>
              </Stack>
              <Box
                sx={{
                  bgcolor: "#3f51b5",
                  pl: "1rem",
                  pr: "1rem",
                  pt: "0.5rem",
                  pb: "0.5rem",
                  borderRadius: "0.5rem",
                  width: "100%",

                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stack>
                  <Typography level="title-sm" sx={{ color: "#fff" }}>
                    Available Balance
                  </Typography>
                  <Typography level="h4" sx={{ color: "#fff" }}>
                    ₹{smsBalance}
                  </Typography>
                </Stack>
                <Card color="#fff" size={30} opacity="0.7" />
              </Box>
            </Stack>
          </Stack>
        </LSPage>
        <Divider />
        <Grid container gap="1rem" m="1rem">
          <Grid md={5.8} sm={12} xs={12}>
            <Sheet
              variant="outlined"
              sx={{ p: "1rem", borderRadius: "0.5rem" }}
            >
              <Box>
                <Typography level="title-md" textAlign="center" mb="0.5rem">
                  Month Wise Paid/Unpaid Fee Report For Current Year
                </Typography>
                <BarGraphChart />
              </Box>
            </Sheet>
          </Grid>
          <Grid md={5.8} sm={12} xs={12}>
            <Sheet
              variant="outlined"
              sx={{ p: "1rem", borderRadius: "0.5rem" }}
            >
              <Box>
                <Typography level="title-md" textAlign="center">
                  Male / Female Student Count
                </Typography>
                <MaleFemaleBarGraph maleCount={totalMaleStudent} femaleCount={totalFemaleStudent} />
              </Box>
            </Sheet>
          </Grid>
        </Grid>

        <Footer />
      </PageContainer>
    </>
  );
}

export default Dashboard;
