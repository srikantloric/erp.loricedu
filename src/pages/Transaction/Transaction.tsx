import { Button } from "@mui/joy";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { BalanceSheetType } from "types/student";
import { BalanceSheet } from "components/TransactionsReport/BalanceSheet";
import DailyAttendance from "components/AttendanceReport/DailyAttendanceReport";
import AttendanceRegisterReport from "components/AttendanceReport/AttendanceRegister";
import { useNavigate } from "react-router-dom";

function Transaction() {

  const history = useNavigate()

  const sampleObjects: BalanceSheetType[] = [
    {
      tran_id: "HISJDO689JJ",
      tran_type: "credit",
      tran_name: "Monthly Fee",
      tran_desc: "This is monthly fee submited by student",
      tran_amount: "6000",
    },
    {
      tran_id: "HISJDO689JK",
      tran_type: "credit",
      tran_name: "Monthly Fee",
      tran_desc: "This is monthly fee submited by student",
      tran_amount: "3400",
    },
    {
      tran_id: "HISJDO689JL",
      tran_type: "debit",
      tran_name: "Bill payment",
      tran_desc: "This is Bill payment of software maintenance",
      tran_amount: "10000",
    },
  ];

  const handleNewWindowOpen = async () => {
    const pdfRes = await BalanceSheet(sampleObjects);
    const features =
      "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
    window.open(pdfRes, "_blank", features);
  };

  const handleDailyAttendance = async () => {
    const pdfRes2 = await DailyAttendance();
    const window1 =
      "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";

    window.open(pdfRes2, "_blank", window1);
  };

  const handleAttendanceRegister = async () => {
    const res = await AttendanceRegisterReport();
    const window2 =
      "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
    window.open(res, "_blank", window2);
  };

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <Button onClick={handleNewWindowOpen}>Generate Balance Sheet</Button>
        <br />
        <Button onClick={handleDailyAttendance}>
          Generate Daily Attendance
        </Button>
        <br />
        <Button onClick={handleAttendanceRegister}>
          Generate Attendance Register
        </Button>
        <Button onClick={()=>history("/print-id-cards")}>
          Print Id Cards Back QR
        </Button>
      </LSPage>
    </PageContainer>
  );
}

export default Transaction;
