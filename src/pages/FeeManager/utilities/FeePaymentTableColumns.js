import { MoreVert } from "@mui/icons-material";
import { getFeeHeaderByCode } from "utilities/UtilitiesFunctions";

export const FEE_TABLE_COLS = [
  {
    field: "id",
    title: "Slip ID",
    cellStyle: {
      padding: "0px",
      paddingLeft: "10px",
      fontSize:"15px",
    },
  },
  {
    field: "fee_title",
    title: "Fee Title",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
    render: (rowData) => {
      const feeTitle = getFeeHeaderByCode(rowData.fee_title);
      return <p>{feeTitle}</p>;
    },
  },
  {
    field: "fee_total",
    title: "Tution Fee",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
  },
  {
    field: "computer_fee",
    title: "Comp. Fee",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
  },
  {
    field: "transportation_fee",
    title: "Trans. Fee",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
  },
  {
    field: "discount_amount",
    title: "Disc.",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
  },
  {
    field: "late_fee",
    title: "Late Fee",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
    render: (rowData) => {
      const currentDate = new Date();
      const lateFine =
        currentDate > rowData.payment_due_date.toDate() ? rowData.late_fee : 0;
      return <p>{lateFine}</p>;
    },
  },
  {
    field: "paid_amount",
    title: "Paid",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
  },
  {
    field: "due_amount",
    title: "Due",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
    render: (rowData) => {
      const dueAmount =
        parseInt(rowData.fee_total) +
        parseInt(rowData.computer_fee) +
        parseInt(rowData.late_fee) +
        parseInt(rowData.transportation_fee) -
        parseInt(rowData.paid_amount);
      // console.log(dueAmount)
      return <p>{dueAmount}</p>;
    },
  },
  {
    field: "payment_status",
    title: "Status",
    cellStyle: {
      padding: "0px",
      fontSize:"15px"
    },
    render: (rowData) => {
      const styles = {
        width: 40,
        height: 40,
        borderRadius: "50%",
        cursor: "pointer",
        objectFit: "cover",
      };
      const dueAmount =
        parseInt(rowData.fee_total) +
        parseInt(rowData.computer_fee) +
        parseInt(rowData.late_fee) +
        parseInt(rowData.transportation_fee) -
        parseInt(rowData.paid_amount);
      if (dueAmount === 0) {
        return (
          <p
            style={{
              color: "var(--bs-white)",
              backgroundColor: "var(--bs-success)",
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            Paid
          </p>
        );
      } else {
        return (
          <p
            style={{
              color: "var(--bs-white)",
              backgroundColor: "var(--bs-danger2)",
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            Due
          </p>
        );
      }
    }
  }
];
