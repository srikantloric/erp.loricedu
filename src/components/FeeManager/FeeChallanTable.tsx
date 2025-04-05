import React from "react";
import { Box, Table, Tooltip, Typography, Button } from "@mui/joy";
import { MoreVert } from "@mui/icons-material";
import { FEE_HEADERS, paymentStatus } from "../../constants/index";
import { IChallanNL } from "types/payment";

interface FeeChallanTableProps {
  challanList: IChallanNL[];
  sum: (column: "totalDue" | "feeConsession" | "amountPaid") => number;
  sumAmountByHeaderTitle: (
    headerTitle:
      | "monthlyFee"
      | "transportationFee"
      | "computerFee"
      | "examFee"
      | "admissionFee"
      | "otherFee"
      | "annualFee"
      | "lateFine"
  ) => number;
  handleMenuClick: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    rowData: IChallanNL
  ) => void;
}

const FeeChallanTable: React.FC<FeeChallanTableProps> = ({
  challanList,
  sum,
  sumAmountByHeaderTitle,
  handleMenuClick,
}) => {
  return (
    <Box>
      <Typography level="title-lg" mt="8px" ml="8px" color="primary">
        Fee Challans
      </Typography>
      <Typography level="body-sm" ml="8px" mb="8px">
        Student fee records starting from admission.
      </Typography>

      <Table
        variant="outlined"
        sx={{
          "& tr > *:last-child": {
            position: "sticky",
            right: 0,
            boxShadow: "1px 0 var(--TableCell-borderColor)",
            bgcolor: "background.surface",
          },
          "& th > *:last-child": {
            position: "sticky",
            right: 0,
            boxShadow: "1px 0 var(--TableCell-borderColor)",
            bgcolor: "background.surface",
          },
        }}
        borderAxis="both"
      >
        <thead>
          <tr>
            <th style={{ width: "12%", backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              TITLE
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>FEE</th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>FINE</th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>TRFEE</th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>COMFEE</th>
            {FEE_HEADERS.map((item) => (
              <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
                {item.titleShort}
              </th>
            ))}
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>PAID</th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>CONC.</th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>DUE</th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>STATUS</th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {challanList.length !== 0 ? (
            challanList.map((item) => {
              const monthlyFeeHeader = item.feeHeaders.find(
                (header) => header.headerTitle === "monthlyFee"
              );
              const computerFeeHeader = item.feeHeaders.find(
                (header) => header.headerTitle === "computerFee"
              );
              const transportationFeeHeader = item.feeHeaders.find(
                (header) => header.headerTitle === "transportationFee"
              );
              const examFeeHeader = item.feeHeaders.find(
                (header) => header.headerTitle === "examFee"
              );
              const annualFeeHeader = item.feeHeaders.find(
                (header) => header.headerTitle === "annualFee"
              );
              const admissionFeeHeader = item.feeHeaders.find(
                (header) => header.headerTitle === "admissionFee"
              );
              const otherFeeHeader = item.feeHeaders.find(
                (header) => header.headerTitle === "otherFee"
              );
              const lateFeeHeader = item.feeHeaders.find(
                (header) => header.headerTitle === "lateFee"
              );

              return (
                <tr>
                  <td>{item.challanTitle}</td>
                  <td>{monthlyFeeHeader ? monthlyFeeHeader.amount : 0}</td>
                  <td>{lateFeeHeader ? lateFeeHeader.amount : 0}</td>
                  <td>{transportationFeeHeader ? transportationFeeHeader.amount : 0}</td>
                  <td>{computerFeeHeader ? computerFeeHeader.amount : 0}</td>
                  <td>{examFeeHeader ? examFeeHeader.amount : 0}</td>
                  <td>{annualFeeHeader ? annualFeeHeader.amount : 0}</td>
                  <td>{admissionFeeHeader ? admissionFeeHeader.amount : 0}</td>
                  <td>{otherFeeHeader ? otherFeeHeader.amount : 0}</td>
                  <td>{item.amountPaid}</td>
                  <td>{item.feeConsession}</td>
                  <td>{item.totalDue}</td>
                  <td>
                    <Box
                      sx={{
                        background:
                          item.status === paymentStatus.PAID
                            ? "var(--bs-success)"
                            : "var(--bs-danger)",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      {item.status}
                    </Box>
                  </td>
                  <td>
                    <Tooltip title="More options">
                      <Button variant="plain" onClick={(e) => handleMenuClick(e, item)}>
                        <MoreVert />
                      </Button>
                    </Tooltip>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <th colSpan={14}>
                <Typography level="title-md" sx={{ textAlign: "center", margin: "10px" }}>
                  No Challan Found for this user
                </Typography>
              </th>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="studentFeeDetailsTableFooter">
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              Grand Total
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sumAmountByHeaderTitle("monthlyFee").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sumAmountByHeaderTitle("lateFine").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sumAmountByHeaderTitle("transportationFee").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sumAmountByHeaderTitle("computerFee").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sumAmountByHeaderTitle("examFee").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sumAmountByHeaderTitle("annualFee").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sumAmountByHeaderTitle("admissionFee").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sumAmountByHeaderTitle("otherFee").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sum("amountPaid").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sum("feeConsession").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}>
              {sum("totalDue").toFixed(0)}
            </th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}></th>
            <th style={{ backgroundColor: "var(--bs-primary-text)", color: "#fff" }}></th>
          </tr>
        </tfoot>
      </Table>
    </Box>
  );
};

export default FeeChallanTable;
