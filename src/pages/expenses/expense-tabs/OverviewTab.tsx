import { Box, Divider, Option, Select, Stack, Typography } from "@mui/joy";
import { Grid, } from "@mui/material";
import InventoryBarGraph from "components/Graph/InventoryBarGraph";

function OverviewTab() {
  
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
      <Grid item xs={12} lg={6}>
        <Box sx={{
          backgroundColor: "#F4F4F4",
          p: 2,
          borderRadius: "8px"
        }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"flex-start"}>
            <Stack>
              <Typography>Total expenses</Typography>
              <Typography level="title-lg" >₹90,000</Typography>
            </Stack>
            <Stack direction={"row"} spacing={2}>
              <Select placeholder="Categories" >
                <Option value={"da"}></Option>
              </Select>
              <Select placeholder="Date">
                <Option value={"da"}></Option>
              </Select>
            </Stack>
          </Stack>
          <Stack direction={"column"}
            sx={{
              backgroundColor: "#D5E5D5"
              , overflowX: "hidden",
              overflowY: "auto"
            }}
            p={2}
            mt={2}
            mb={2}
            height={"150px"}
            borderRadius={"8px"}
          >
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography >Inventory</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>

            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Food</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Payroll</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Inventory</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Inventory</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Food</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Payroll</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Inventory</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack justifyContent={"center"} direction={"row"} width={"100%"}>
            <Typography variant="plain" color="primary">
              View Details
            </Typography>
          </Stack>
        </Box>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Box sx={{
          backgroundColor: "#F4F4F4",
          p: 2,
          borderRadius: "8px"
        }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"flex-start"}>
            <Stack>
              <Typography>Total expenses</Typography>
              <Typography level="title-lg" >₹90,000</Typography>
            </Stack>
            <Stack direction={"row"} spacing={2}>
              <Select placeholder="Categories" >
                <Option value={"da"}></Option>
              </Select>
              <Select placeholder="Date">
                <Option value={"da"}></Option>
              </Select>
            </Stack>
          </Stack>
          <Stack direction={"column"}
            sx={{
              backgroundColor: "#F7E6E3"
              , overflowX: "hidden",
              overflowY: "auto"
            }}
            p={2}
            mt={2}
            mb={2}
            height={"150px"}
            borderRadius={"8px"}
          >
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography >Inventory</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>

            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Food</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Payroll</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Inventory</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Inventory</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Food</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Payroll</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
            <Stack justifyContent={"space-between"} direction={"row"}>
              <Typography>Inventory</Typography>
              <Typography>₹30,0000</Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack justifyContent={"center"} direction={"row"} width={"100%"}>
            <Typography variant="plain" color="primary">
              View Details
            </Typography>
          </Stack>
        </Box>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Box sx={{
          backgroundColor: "#F4F4F4",
          p: 2,
          borderRadius: "8px"
        }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"flex-start"}>
            <Stack>
              <Typography>Inventory Expenses</Typography>
              <Typography level="title-lg" >₹90,000</Typography>
            </Stack>
            <Stack direction={"row"} spacing={2}>
              <Select placeholder="Categories" >
                <Option value={"da"}></Option>
              </Select>
              <Select placeholder="Date">
                <Option value={"da"}></Option>
              </Select>
            </Stack>
          </Stack>
          <Stack p={2}>
            <InventoryBarGraph />
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}

export default OverviewTab;
