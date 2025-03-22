import { Box, Stack, Typography } from "@mui/joy";
import { Paper } from "@mui/material";
import { Calculator, CardEdit, Moneys, Wallet } from "iconsax-react";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";

interface ITotalFeeHeader {
  totalFeeConsession: number;
  totalPaidAmount: number;
  totalDueAmount: number;
}

interface Props {
  studentMasterData: StudentDetailsType;
  totalFeeHeaderData: ITotalFeeHeader;
}

const IndividualFeeDetailsHeader: React.FC<Props> = ({
  studentMasterData,
  totalFeeHeaderData,
}) => {
  return (
    <Paper sx={{ backgroundColor: "#FBFCFE", display: "flex" }}>
      <div style={{ margin: "10px" }}>
        <img
          src={studentMasterData.profil_url}
          width={100}
          height="100%"
          style={{ objectFit: "cover" }}
        ></img>
      </div>
      <div
        style={{
          margin: "8px 10px 8px 0px",
          width: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div>
          <Typography
            level="h4"
            sx={{ fontWeight: "500" }}
            textTransform="uppercase"
          >
            {studentMasterData.student_name}
          </Typography>
          <Typography level="body-sm">
            Father's Name : {studentMasterData.father_name}
          </Typography>
          <Typography level="body-sm">
            Student's ID: {studentMasterData.admission_no}
          </Typography>
        </div>
        <div
          style={{
            backgroundColor: "#F0F4F8",
            display: "flex",
            borderRadius: "8px",
            gap: "20px",
            marginTop: "10px",
            padding: "10px 16px",
            width: "fit-content",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography level="body-sm">Class</Typography>
            <Typography level="title-sm">
              {getClassNameByValue(studentMasterData.class!)}
              {/* {location.state[0].class} */}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography level="body-sm">Roll</Typography>
            <Typography level="title-sm">
              {studentMasterData.class_roll}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography level="body-sm">Admission Date</Typography>
            <Typography level="title-sm">
              {studentMasterData.date_of_addmission}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography level="body-sm">Fee</Typography>
            <Typography level="title-sm">
              ₹{studentMasterData.monthly_fee?studentMasterData.monthly_fee:0}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography level="body-sm">Discount</Typography>
            <Typography level="title-sm">
              ₹{studentMasterData.fee_discount?studentMasterData.fee_discount:0}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography level="body-sm">Transport</Typography>
            <Typography level="title-sm">
              ₹{studentMasterData.transportation_fee?studentMasterData.transportation_fee:0}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography level="body-sm">Computer</Typography>
            <Typography level="title-sm">
              ₹{studentMasterData.computer_fee?studentMasterData.computer_fee:0}
            </Typography>
          </div>
        </div>
      </div>
      <Box
        sx={{
          display: "flex",
          border: "1px solid var(--bs-gray-400)",
          margin: "14px",
          flex: 1,
          borderRadius: "8px",
          padding: "10px",
          alignItems: "center",
          justifyContent: "space-evenly",
        }}
      >
        <Stack direction="column" alignItems="center">
          <Calculator size="26" color="#2ccce4" />

          <Typography level="h4" mt={1}>
            ₹{totalFeeHeaderData.totalDueAmount}
          </Typography>
          <Typography level="body-sm">Total Dues</Typography>
        </Stack>

        <Stack direction="column" alignItems="center">
          <CardEdit color="#ff8a65" size="26" />
          <Typography level="h4" mt={1}>
            ₹{totalFeeHeaderData.totalFeeConsession}
          </Typography>
          <Typography level="body-sm">Consession</Typography>
        </Stack>

        <Stack direction="column" alignItems="center">
          <Moneys color="#37d67a" size="26" />
          <Typography level="h4" mt={1}>
            ₹{totalFeeHeaderData.totalPaidAmount}
          </Typography>
          <Typography level="body-sm">Collection</Typography>
        </Stack>
        <Stack direction="column" alignItems="center">
          <Wallet color="#f47373" size="26" />
          <Typography level="h4" mt={1}>
            ₹0
          </Typography>
          <Typography level="body-sm">Balance</Typography>
        </Stack>
      </Box>
    </Paper>
  );
};

export default IndividualFeeDetailsHeader;
