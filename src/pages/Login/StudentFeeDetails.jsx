import MaterialTable from "@material-table/core";
import React, { useEffect, useState } from "react";
import PageContainer from "../../components/Utils/PageContainer";
import LSPage from "../../components/Utils/LSPage";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GrainIcon from "@mui/icons-material/Grain";
import { ExportCsv, ExportPdf } from "@material-table/exporters";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import {
  Box,
  Breadcrumbs,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
} from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import { Code, Delete, Edit, MoreVert } from "@mui/icons-material";
import PaymentIcon from "@mui/icons-material/Payment";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { enqueueSnackbar } from "notistack";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  Option,
  Select,
  Sheet,
  Switch,
  Typography,
} from "@mui/joy";

//main element
function StudentFeeDetails() {
  function getCurrentDate() {
    const dateObj = new Date();
    const currDate =
      dateObj.getFullYear() +
      "-" +
      (dateObj.getMonth() + 1) +
      "-" +
      dateObj.getDate();
    return currDate;
  }

  const [selectedRow, setSelectedRow] = useState(null);
  const [feeDetails, setFeeDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentDate, setPaymentDate] = useState(getCurrentDate());
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paidAmount, setPaidAmount] = useState();
  const [sendSms, setSendSMS] = useState(true);
  const [paidAmountError, setPaidAmountError] = useState(false);

  const historyRef = useNavigate();
  const location = useLocation();

  ///Sof Menu State
  const [anchorEll, setAnchorEll] = useState(null);
  const menuOpen = Boolean(anchorEll);
  const [modelOpen, setModelOpen] = useState(false);
  const [remarkError, setRemarkError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleMenuClick = (event, rowData) => {
    setAnchorEll(event.currentTarget);
    setSelectedRow(rowData);
    setPaymentRemarks(selectedRow.payment_remarks);
    console.log(rowData);
  };
  const handleMenuClose = () => {
    setAnchorEll(null);
  };
  //Eof Menu State

  const DEMO_COLS = [
    {
      field: "id",
      title: "Payment ID",
    },
    // { field: "name", title: "Student" },
    // { field: "name", title: "Parent" },
    { field: "fee_title", title: "Fee Title" },
    { field: "fee_total", title: "Total" },
    { field: "discount_amount", title: "Disc." },
    { field: "late_fee", title: "Late Fee" },
    { field: "paid_amount", title: "Paid" },
    { field: "due_amount", title: "Due" },
    {
      field: "payment_status",
      title: "Status",
      render: (rowData) => {
        const styles = {
          width: 40,
          height: 40,
          borderRadius: "50%",
          cursor: "pointer",
          objectFit: "cover",
        };
        return (
          <p
            style={{
              color: "var(--bs-white)",
              backgroundColor: `${
                rowData.payment_status === "paid"
                  ? "var(--bs-success)"
                  : "var(--bs-danger2)"
              }`,
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            {rowData.payment_status}
          </p>
        );
      },
    },
  ];

  useEffect(() => {
    setLoading(true);
    const userDocId = location.state[0].id;
    console.log(location.state[0]);
    if (userDocId) {
      const dbSubscription = db
        .collection("STUDENTS")
        .doc(userDocId)
        .collection("PAYMENTS")
        .onSnapshot((snapshot) => {
          if (snapshot.size) {
            var feeArr = [];
            snapshot.forEach((doc) => {
              const dataMod = {
                id: doc.data().payement_id,
              };
              feeArr.push(doc.data());
            });
            setFeeDetails(feeArr);
            setLoading(false);
          } else {
            enqueueSnackbar("Something went wreong !", { variant: "error" });
          }
        });
      return () => dbSubscription();
    } else {
      setLoading(false);
      enqueueSnackbar("User document not found !", { variant: "error" });
    }
  }, []);

  ////Modal

  const handlePayBtn = () => {
    setPaymentLoading(true);
    setPaidAmountError(false);
    if (paidAmount) {
      const paymentData = {
        payment_date: new Date(paymentDate),
        payment_remarks: paymentRemarks,
        payment_mode: paymentMode,
        paid_amount: parseInt(selectedRow.paid_amount) + parseInt(paidAmount),
        due_amount: selectedRow.due_amount - paidAmount,
        payment_status: "paid",
      };
      // console.log("sss",selectedRow, location.state[0].id);
      console.log(new Date(paymentDate));
      if (location.state[0].id && selectedRow.doc_id) {
        console.log("called");
        db.collection("STUDENTS")
          .doc(location.state[0].id)
          .collection("PAYMENTS")
          .doc(selectedRow.doc_id)
          .update(paymentData)
          .then((data) => {
            setPaymentLoading(false);

            const dueAmountI = selectedRow.due_amount - paidAmount;
            selectedRow.due_amount = dueAmountI;

            if (dueAmountI === 0) {
              setSelectedRow((prevState) => ({
                ...prevState,
                ["payment_status"]: "paid",
              }));
            } else {
              setSelectedRow((prevState) => ({
                ...prevState,
                ["payment_status"]: "partially paid",
              }));
            }
          });
      }
    } else {
      setPaidAmountError(true);
      setPaymentLoading(false);
    }
  };

  ////Modal

  return (
    <PageContainer>
      <LSPage>
        <div
          style={{
            backgroundColor: "var(--bs-gray-201)",
            padding: "10px",
            borderRadius: "5px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Breadcrumbs aria-label="breadcrumb">
              <Link to="/" style={{
                textDecoration: "none",
                color: "#343a40",
                display: "flex",
                alignItems: "center",
              }}>
              <AccountBalanceWalletIcon sx={{ color: "var(--bs-gray-500)" }} />
              <Typography sx={{ ml: "4px" }}>Fee Management</Typography>
              </Link>


            <Typography
              sx={{ display: "flex", alignItems: "center" }}
              color="text.secondary"
            >
              <GrainIcon sx={{ mr: 0.3 }} fontSize="inherit" />
              Fee Details
            </Typography>
            <Typography>OPS214554444</Typography>
          </Breadcrumbs>
          <Button
            startIcon={<ControlPointIcon />}
            variant="solid"
            disableElevation
            style={{ backgroundColor: "var(--bs-primary)" }}
            onClick={(e) => {
              historyRef("/FeeManagement");
            }}
          >
            Search Another
          </Button>
        </div>
        <br />
        <Paper
          sx={{
            padding: "8px",
            background: "var(--bs-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ArrowCircleRightIcon sx={{ mr: "5px" }} />
          <Typography sx={{ fontSize: "18px", color: "#fff" }}>
            Student Fee Management
          </Typography>
        </Paper>
        <br />
        <Paper sx={{ backgroundColor: "#FBFCFE", display: "flex" }}>
          <div style={{ margin: "10px" }}>
            <img
              src={location.state[0].profil_url}
              width={90}
              height="100%"
              style={{ objectFit: "cover" }}
            ></img>
          </div>
          <div
            style={{
              margin: "10px 10px 10px 0px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div>
              <h4 style={{ margin: 0, padding: 0, textTransform: "uppercase" }}>
                {location.state[0].student_name}
              </h4>
              <p
                style={{
                  margin: "10px 0px 0px 0px",
                  padding: 0,
                  fontSize: "14px",
                }}
              >
                Father's Name : {location.state[0].father_name}
              </p>
            </div>
            <div
              style={{
                backgroundColor: "#F0F4F8",
                display: "flex",
                gap: "20px",
                marginTop: "10px",
                padding: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p style={{ margin: 0, padding: 0 }}>Class</p>
                <p style={{ margin: 0, padding: 0 }}>
                  {location.state[0].class}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p style={{ margin: 0, padding: 0 }}>Roll</p>
                <p style={{ margin: 0, padding: 0 }}>
                  {location.state[0].class_roll}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p style={{ margin: 0, padding: 0 }}>Admission No</p>
                <p style={{ margin: 0, padding: 0 }}>
                  {location.state[0].admission_no}
                </p>
              </div>
            </div>
          </div>
        </Paper>
        <br />
        {loading ? <LinearProgress /> : null}

        <MaterialTable
          style={{ display: "grid" }}
          columns={DEMO_COLS}
          data={feeDetails}
          title="Fee Details"
          options={{
            headerStyle: {
              backgroundColor: "var(--bs-secondary)",
              color: "#FFF",
            },
            exportAllData: true,
            exportMenu: [
              {
                label: "Export PDF",
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, "myPdfFileName"),
              },
              {
                label: "Export CSV",
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, "myCsvFileName"),
              },
            ],
            actionsColumnIndex: -1,
          }}
          actions={[
            {
              icon: () => <EditIcon sx={{ color: "var(--bs-primary)" }} />,
              tooltip: "Edit Row",
              onClick: (event, rowData) => {
                // updatestudent(rowData);
                handleMenuClick(event);
              },
            },
            {
              icon: () => (
                <MoreVert
                  aria-controls={menuOpen ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? "true" : undefined}
                />
              ),
              tooltip: "More options",
              onClick: (event, rowData) => {
                // console.log(rowData);
                handleMenuClick(event, rowData);
              },
            },
          ]}
        />

        <Menu
          anchorEl={anchorEll}
          id="account-menu"
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={() => setModelOpen(true)}>
            <ListItemIcon>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            Quick Payment
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClick}>
            <ListItemIcon>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            Pay All :Student
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClick}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            Print Recipt
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClick}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleMenuClick}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>

        {selectedRow ? (
          <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modelOpen}
            onClose={() => setModelOpen(false)}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Sheet
              variant="outlined"
              sx={{
                width: 550,
                minHeight: 600,
                borderRadius: "md",
                p: 3,
                boxShadow: "lg",
              }}
            >
              <ModalClose variant="plain" sx={{ m: 1 }} />
              <div style={{ display: "flex" }}>
                <ElectricBoltIcon />
                <Typography level="title-lg" mb={1}>
                  Quick Payment
                </Typography>
              </div>
              <Divider />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "column",
                  height: 550,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex" }}>
                    <div>
                      <Typography level="body-md" sx={{ mt: 1 }}>
                        Payment ID :
                      </Typography>
                      <Typography level="body-md">Payment Title :</Typography>
                      <Typography level="body-md">Payable Amount :</Typography>
                      <Typography level="body-md">Late Fee:</Typography>
                    </div>
                    <div style={{ marginLeft: "20px" }}>
                      <Typography
                        level="body-md"
                        sx={{ mt: 1, fontWeight: 700 }}
                      >
                        {selectedRow.id}
                      </Typography>
                      <Typography level="body-md">
                        Payment for {selectedRow.fee_title}
                      </Typography>
                      <Typography level="body-md">
                        Rs. {selectedRow.fee_total}
                      </Typography>
                      <Typography level="body-md">
                        Rs. {selectedRow.late_fee}
                      </Typography>
                    </div>
                  </div>
                  <div style={{ marginTop: "30px" }}>
                    <FormControl>
                      <FormLabel>Remarks</FormLabel>
                      <Input
                        value={paymentRemarks}
                        onChange={(e) => {
                          setPaymentRemarks(e.currentTarget.value);
                        }}
                        disabled={
                          selectedRow.payment_status === "paid" ? true : false
                        }
                        placeholder="Please enter remark for payment"
                      />
                      <FormHelperText>{remarkError}</FormHelperText>
                    </FormControl>

                    <FormControl sx={{ mt: 1 }}>
                      <FormLabel required>Payment Date</FormLabel>
                      <Input
                        disabled={
                          selectedRow.payment_status === "paid" ? true : false
                        }
                        type="date"
                        value={paymentDate}
                        required
                        onChange={(e) => setPaymentDate(e.currentTarget.value)}
                      />
                    </FormControl>
                    <FormControl sx={{ mt: 1 }}>
                      <FormLabel required>Send SMS</FormLabel>
                      <Select defaultValue="yes">
                        <Option
                          value="no"
                          disabled={
                            selectedRow.payment_status === "paid" ? true : false
                          }
                        >
                          No
                        </Option>
                        <Option
                          value="yes"
                          disabled={
                            selectedRow.payment_status === "paid" ? true : false
                          }
                        >
                          Yes
                        </Option>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ mt: 1 }}>
                      <FormLabel required>Mode Of Payment</FormLabel>
                      <Select
                        defaultValue="cash"
                        onChange={(e, newVal) => {
                          setPaymentMode(newVal);
                        }}
                      >
                        <Option
                          value="cash"
                          disabled={
                            selectedRow.payment_status === "paid" ? true : false
                          }
                        >
                          Cash
                        </Option>
                        <Option
                          value="online"
                          disabled={
                            selectedRow.payment_status === "paid" ? true : false
                          }
                        >
                          Online
                        </Option>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography level="h3" sx={{ color: "var(--bs-danger2)" }}>
                    Rs. {selectedRow.due_amount}
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 400,
                        marginLeft: "4px",
                      }}
                    >
                      Due
                    </span>
                  </Typography>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    {selectedRow.payment_status === "paid" ? (
                      <Button startDecorator={<PrintIcon />}>
                        Print Recipt
                      </Button>
                    ) : (
                      <>
                        <Typography>Pay -</Typography>
                        <Input
                          disabled={
                            selectedRow.payment_status === "paid" ? true : false
                          }
                          placeholder="enter amount"
                          value={paidAmount}
                          error={paidAmountError}
                          onChange={(e) => {
                            setPaidAmount(e.currentTarget.value);
                          }}
                          sx={{ ml: 1 }}
                        />

                        <Button
                          variant="solid"
                          disableElevation
                          sx={{ ml: 2 }}
                          color="success"
                          loading={paymentLoading}
                          onClick={handlePayBtn}
                          disabled={
                            selectedRow.payment_status === "paid" ? true : false
                          }
                        >
                          Pay Now
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {selectedRow.payment_status === "paid" ? (
                <img
                  style={{ position: "absolute", top: 70, right: 50 }}
                  height={100}
                  src="https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/Dummy%20Images%2Fpaid2.png?alt=media&token=208e9ef0-2ad8-4016-beec-507b21af2221"
                ></img>
              ) : null}
            </Sheet>
          </Modal>
        ) : null}
      </LSPage>
    </PageContainer>
  );
}

export default StudentFeeDetails;
