import { useEffect, useState } from "react";
import PageContainer from "../../components/Utils/PageContainer";
import LSPage from "../../components/Utils/LSPage";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PrintIcon from "@mui/icons-material/Print";

import {
  Divider,
  FormControl,
  LinearProgress,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { CurrencyRupee, Delete, MoreVert, Print } from "@mui/icons-material";
import PaymentIcon from "@mui/icons-material/Payment";
import { useLocation, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  Box,
  Button,
  Chip,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
  Table,
  Tooltip,
  Typography,
} from "@mui/joy";
import BreadCrumbsV3 from "components/Breadcrumbs/BreadCrumbsV3";
import Navbar from "components/Navbar/Navbar";
import AddFeeArrearModal from "components/Modals/AddFeeArrearModal";
import { FEE_HEADERS, paymentStatus } from "../../constants/index";
import IndividualFeeDetailsHeader from "components/Headers/IndividualFeeDetailsHeader";
import {
  IChallanHeaderTypeForChallan,
  IChallanNL,
  IPaymentNL,
  IPaymentNLForChallan,
  IPaymentStatus,
} from "types/payment";
import AddFeeConsessionModal from "components/Modals/AddFeeConsessionModal";
import { MoneyRecive } from "iconsax-react";
import {
  formatedDate,
  generateAlphanumericUUID,
  getCurrentDate,
} from "utilities/UtilitiesFunctions";

import SettingsIcon from "@mui/icons-material/Settings";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { AnimatePresence, motion } from "framer-motion";
import InstantPaymentModal from "components/Modals/InstantPaymentModal";
import DiscountIcon from "@mui/icons-material/Discount";
import DeleteChallanConfirmationDialog from "components/Modals/DeleteChallanConfirmationDialog";
import {
  distributePaidAmountForChallan,
  distributePaidAmountForTransaction,
  extractChallanIdsAndHeaders,
  generateRandomSixDigitNumber,
} from "utilities/PaymentUtilityFunctions";
import { GenerateFeeReciept } from "utilities/GenerateFeeReciept";
import { StudentDetailsType } from "types/student";
import ModalLoader from "components/Loader/ModalLoader";
import { GenerateFeeRecieptMonthly } from "utilities/GenerateFeeRecieptMonthly";
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, Timestamp, where, writeBatch } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
const SearchAnotherButton = () => {
  const historyRef = useNavigate();
  return (
    <Button
      startDecorator={<ControlPointIcon />}
      variant="solid"
      sx={{ backgroundColor: "var(--bs-primary)" }}
      onClick={(e) => {
        historyRef("/FeeManagement");
      }}
    >
      Search Another
    </Button>
  );
};

interface ITotalFeeHeader {
  totalFeeConsession: number;
  totalPaidAmount: number;
  totalDueAmount: number;
}

function StudentFeeDetails() {

  //Get Firebase DB instance
  const { db } = useFirebase();

  const [selectedRow, setSelectedRow] = useState<IChallanNL | null>(null);

  const [loading, setLoading] = useState(false);
  const location = useLocation();

  //Add Fee Consession Modal
  const [addFeeConsessionModalOpen, setAddFeeConsessionModalOpen] =
    useState<boolean>(false);

  /// Menu State
  const [anchorEll, setAnchorEll] = useState<HTMLAnchorElement | null>(null);
  const menuOpen = Boolean(anchorEll);

  //Add Fee Arrear Modal
  const [addArrearModalOpen, setAddArrearModalopen] = useState(false);
  const [totalFeeHeaderData, setTotalFeeHeaderData] = useState<ITotalFeeHeader>(
    {
      totalDueAmount: 0,
      totalFeeConsession: 0,
      totalPaidAmount: 0,
    }
  );

  const [feeCollectionDate, setFeeCollectionDate] = useState<string | null>(
    null
  );
  const [feeChallans, setFeeChallans] = useState<IChallanNL[]>([]);

  const [selectedChallan, setSelectedChallan] = useState<string | null>(null);
  const [recievedAmount, setRecievedAmount] = useState<number>(0);

  const [selectedChallanDetails, setSelectedChallanDetails] =
    useState<IChallanNL | null>(null);

  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >("CASH");

  //Part Payment
  const [showPartPaymentOption, setShowPartPaymentOption] =
    useState<boolean>(false);
  const [recievedAmountPartPayment, setRecievedAmountPartPayment] =
    useState<number>();
  const [partPaymentComment, setPartPaymentComment] = useState<string>();

  const [instantPaymentDialogOpen, setInstantPaymentDialogOpen] =
    useState<boolean>(false);

  const [showDeleteAuthenticationDialog, setShowDeleteAuthenticationDialog] =
    useState<boolean>(false);

  const [isGeneratingFeeReciept, setIsGeneratingFeeReciept] = useState(false);

  ///////////////
  const [challanList, setChallanList] = useState<IChallanNL[]>([]);

  // Calculate total feeConsession and totalPaidAmount
  const calculateTotals = () => {
    let totalConsession = 0;
    let totalPaid = 0;
    let totalDueAmount = 0;

    challanList.forEach((row) => {
      totalConsession += row.feeConsession || 0;
      totalPaid += row.amountPaid || 0;
      totalDueAmount += row.totalDue || 0;
    });

    setTotalFeeHeaderData({
      totalFeeConsession: totalConsession,
      totalPaidAmount: totalPaid,
      totalDueAmount: totalDueAmount,
    });
  };

  useEffect(() => {
    calculateTotals();
  }, [challanList]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    rowData: IChallanNL
  ) => {
    setAnchorEll(event.target as HTMLAnchorElement);
    setSelectedRow(rowData);
  };

  function sum(column: "totalDue" | "feeConsession" | "amountPaid") {
    return challanList.reduce((acc, row) => acc + row[column]!, 0);
  }

  function sumAmountByHeaderTitle(
    headerTitle:
      | "monthlyFee"
      | "transportationFee"
      | "computerFee"
      | "examFee"
      | "admissionFee"
      | "otherFee"
      | "annualFee"
      | "lateFine"
  ): number {
    return challanList.reduce((totalSum, challan) => {
      const header = challan.feeHeaders.find(
        (h) => h.headerTitle === headerTitle
      );
      return header ? totalSum + header.amount : totalSum;
    }, 0);
  }

  const handleMenuClose = () => {
    setAnchorEll(null);
  };
  //Eof Menu State

  useEffect(() => {
    var tempArr: IChallanNL[] = [];
    challanList.map((item) => {
      if (item.status !== "PAID") {
        tempArr.push(item);
      }
    });
    setFeeChallans(tempArr);
  }, [challanList]);

  useEffect(() => {
    if (selectedChallan) {
      const challanFee = challanList
        .filter((item, index) => item.challanId === selectedChallan)
        .at(0);
      setRecievedAmount(challanFee?.totalDue!);
      setSelectedChallanDetails(challanFee!);
    }
  }, [selectedChallan, challanList]);

  const dueDateCheck = (dueDate: Timestamp) => {
    const dueDateModified = dueDate.toDate().getDate();
    const currentDate = new Date().getDate();
    let isPassed: boolean = false;
    if (currentDate >= dueDateModified) {
      isPassed = true;
    }
    return isPassed;
  };

  const calculateTotalDueAmount = (challan: IChallanNL): number => {
    var totalDue: number = 0;

    const totalFeeHeaderAmount = challan.feeHeaders.reduce(
      (total, feeHeader) => {
        return total + Number(feeHeader.amount);
      },
      0
    );
    totalDue += totalFeeHeaderAmount;

    if (challan.feeConsession) {
      totalDue -= challan.feeConsession;
    }
    if (challan.amountPaid) {
      totalDue -= challan.amountPaid;
    }
    return totalDue;
  };

  useEffect(() => {
    // Initialize fee collection date
    setFeeCollectionDate(getCurrentDate());
    setLoading(true);

    if (!location.state?.[0]) {
      enqueueSnackbar("Failed to load student master data!", { variant: "warning" });
      setLoading(false);
      return;
    }

    const fetchChallans = async () => {
      try {
        let isLateFineApplicable = false;

        // Fetch late fine config
        const lateFineDocRef = doc(db, "CONFIG", "PAYMENT_CONFIG");
        const lateFineSnap = await getDoc(lateFineDocRef);

        if (lateFineSnap.exists()) {
          isLateFineApplicable = lateFineSnap.data()?.applyLateFine || false;
        }

        // Fetch student Fee details
        const studentId = location.state[0].id;
        const challansCollectionRef = collection(db, "STUDENTS", studentId, "CHALLANS");
        const challansQuery = query(challansCollectionRef, orderBy("createdOn", "desc"));

        const unsubscribe = onSnapshot(challansQuery, (snapshot) => {
          if (!snapshot.empty) {
            const challans: IChallanNL[] = snapshot.docs.map((doc) => {
              const challan = doc.data() as IChallanNL;

              // Remove late fee if not applicable
              if (!isLateFineApplicable && dueDateCheck(challan.dueDate)) {
                challan.feeHeaders = challan.feeHeaders.filter(
                  (header) => header.headerTitle !== "lateFee"
                );
              }

              challan.totalDue = calculateTotalDueAmount(challan);
              return challan;
            });

            setChallanList(challans);
          } else {
            enqueueSnackbar("No fee generated for student!", { variant: "info" });
          }

          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching challans:", err);
        setLoading(false);
        enqueueSnackbar("Error fetching challans. Please try again.", { variant: "error" });
      }
    };

    fetchChallans();
  }, []);

  const saveDataToDb = async (
    paymentObjForPayment: IPaymentNL,
    paymentObjForChallan: IPaymentNLForChallan,
    pStatus: IPaymentStatus
  ) => {
    try {
      setIsPaymentLoading(true);
      const batch = writeBatch(db);

      // Payment References
      const paymentCollRef = doc(
        collection(db, "STUDENTS", paymentObjForPayment.studentId, "PAYMENTS")
      );
      const paymentCollRefOL = doc(collection(db, "MY_PAYMENTS"));

      // Challan Reference
      const challanDocRef = doc(
        db,
        "STUDENTS",
        paymentObjForChallan.studentId,
        "CHALLANS",
        paymentObjForChallan.challanId
      );

      // Data for Challan Update
      const updatedFeeHeaders: IChallanHeaderTypeForChallan[] = paymentObjForChallan.breakdown;

      batch.update(challanDocRef, {
        feeHeaders: updatedFeeHeaders,
        amountPaid: paymentObjForChallan.amountPaid,
        status: pStatus,
      });

      batch.set(paymentCollRef, paymentObjForPayment);
      batch.set(paymentCollRefOL, paymentObjForPayment);

      await batch.commit();

      // Reset state after success
      setIsPaymentLoading(false);
      setRecievedAmountPartPayment(0);
      setRecievedAmount(0);
      setPartPaymentComment("");
      enqueueSnackbar("Payment Received Successfully!", { variant: "success" });
    } catch (e) {
      console.error("Error saving data:", e);
      setIsPaymentLoading(false);
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  };

  const recievePayment = (partialPayment: boolean) => {
    if (selectedChallanDetails) {
      if (partialPayment) {
        const updatedFeeHeaderForPayment = distributePaidAmountForTransaction(
          selectedChallanDetails,
          recievedAmountPartPayment!,
          true
        );
        const updatedFeeHeaderForChallan = distributePaidAmountForChallan(
          selectedChallanDetails,
          recievedAmountPartPayment!,
          true
        );
        const totalPaidAmount = Number(
          selectedChallanDetails.amountPaid + recievedAmountPartPayment!
        );
        const totalAmountDue = Number(selectedChallanDetails.totalAmount);

        var pStatus: IPaymentStatus =
          totalPaidAmount >= totalAmountDue ? "PAID" : "PARTIAL";


        const paymentDataForPayment: IPaymentNL = {
          challanTitle: selectedChallanDetails.challanTitle,
          paymentId: generateAlphanumericUUID(8),
          studentId: selectedChallanDetails.studentId,
          challanId: selectedChallanDetails.challanId,
          amountPaid: recievedAmountPartPayment!,
          recievedBy: "Admin",
          recievedOn: Timestamp.fromDate(new Date(feeCollectionDate!)),
          timestamp: Timestamp.now(),
          breakdown: updatedFeeHeaderForPayment,
          status: pStatus,
          feeConsession: selectedChallanDetails.feeConsession,
        };

        const paymentDataForChallan: IPaymentNLForChallan = {
          challanTitle: selectedChallanDetails.challanTitle,
          paymentId: generateAlphanumericUUID(8),
          studentId: selectedChallanDetails.studentId,
          challanId: selectedChallanDetails.challanId,
          amountPaid:
            selectedChallanDetails.amountPaid + recievedAmountPartPayment!,
          recievedBy: "Admin",
          recievedOn: Timestamp.fromDate(new Date(feeCollectionDate!)),
          timestamp: Timestamp.now(),
          breakdown: updatedFeeHeaderForChallan,
          status: pStatus,
          feeConsession: selectedChallanDetails.feeConsession,
        };

        saveDataToDb(paymentDataForPayment, paymentDataForChallan, pStatus);
      } else {
        // const feeHeadersList = createFeeHeaders(selectedChallanDetails);
        const updatedFeeHeaderForPayment = distributePaidAmountForTransaction(
          selectedChallanDetails,
          recievedAmount!,
          true
        );
        const updatedFeeHeaderForChallan = distributePaidAmountForChallan(
          selectedChallanDetails,
          recievedAmount!,
          true
        );

        const paymentDataForPayment: IPaymentNL = {
          challanTitle: selectedChallanDetails.challanTitle,
          paymentId: generateAlphanumericUUID(8),
          challanId: selectedChallanDetails.challanId,
          studentId: selectedChallanDetails.studentId,
          amountPaid: recievedAmount!,
          recievedBy: "Admin",
          recievedOn: Timestamp.fromDate(new Date(feeCollectionDate!)),
          timestamp: Timestamp.now(),
          breakdown: updatedFeeHeaderForPayment,
          status: "PAID",
          feeConsession: selectedChallanDetails.feeConsession,
        };

        const paymentDataForChallan: IPaymentNLForChallan = {
          challanTitle: selectedChallanDetails.challanTitle,
          paymentId: generateAlphanumericUUID(8),
          challanId: selectedChallanDetails.challanId,
          studentId: selectedChallanDetails.studentId,
          amountPaid: selectedChallanDetails.amountPaid + recievedAmount!,
          recievedBy: "Admin",
          recievedOn: Timestamp.fromDate(new Date(feeCollectionDate!)),
          timestamp: Timestamp.now(),
          breakdown: updatedFeeHeaderForChallan,
          status: "PAID",
          feeConsession: selectedChallanDetails.feeConsession,
        };
        saveDataToDb(paymentDataForPayment, paymentDataForChallan, "PAID");
      }
    }
  };

  const handlePaymentRecieveButton = async (
    e: React.FormEvent<HTMLFormElement>,
    partialPayment: boolean
  ) => {
    e.preventDefault();
    if (selectedChallanDetails) {
      recievePayment(partialPayment);
    }
  };

  const handlePartPaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (recievedAmountPartPayment) {
      if (recievedAmountPartPayment! > selectedChallanDetails?.totalDue!) {
        enqueueSnackbar("Amount is greater than due amount!", {
          variant: "error",
        });
      } else {
        if (recievedAmountPartPayment <= 0) {
          enqueueSnackbar("Your entered amount is either 0 or negative!", {
            variant: "error",
          });
        } else {
          handlePaymentRecieveButton(e, true);
        }
      }
    }
  };

  const generateCurrentFeeReciept = async (isMonthlyRecipet: boolean) => {
    try {
      setIsGeneratingFeeReciept(true);
      const studentId = location.state[0].id;
      const paymentsRef = collection(db, "STUDENTS", studentId, "PAYMENTS");
      const recieptConfigRef = doc(db, "CONFIG", "RECIEPT_CONFIG");
      let q;

      if (isMonthlyRecipet) {
        q = query(paymentsRef, where("challanId", "==", selectedRow?.challanId));
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        q = query(paymentsRef, where("timestamp", ">=", today));
      }

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setIsGeneratingFeeReciept(false);
        enqueueSnackbar("No fee reciept found, please pay fee and try again", { variant: "info" });
        return;
      }

      const paymentsData: IPaymentNL[] = snapshot.docs.map(doc => ({ ...(doc.data() as IPaymentNL) }));
      console.log("Payment Data:", paymentsData);

      const recieptSnap = await getDoc(recieptConfigRef);
      const accountantName = recieptSnap.exists() ? recieptSnap.data()?.accountantName || "" : "";
      const recieptGeneratorServer = recieptSnap.exists() ? recieptSnap.data()?.recieptGeneratorServerUrl || "" : "";

      const recieptId = generateRandomSixDigitNumber().toString();
      const recieptDate = formatedDate(new Date(), "dd/MM/YYYY hh:mm:ss");

      const extractedData = extractChallanIdsAndHeaders(paymentsData);
      const url = isMonthlyRecipet
        ? await GenerateFeeRecieptMonthly({
          ...extractedData,
          studentMasterData: location.state[0] as StudentDetailsType,
          recieptId,
          recieptDate,
          accountantName,
          recieptGeneratorServerUrl: recieptGeneratorServer,
          challanMonths: extractedData.challanMonthYear
        })
        : await GenerateFeeReciept({
          ...extractedData,
          studentMasterData: location.state[0] as StudentDetailsType,
          recieptId,
          recieptDate,
          accountantName,
          recieptGeneratorServerUrl: recieptGeneratorServer,
          challanMonths: extractedData.challanMonthYear
        });

      if (url) {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        iframe.onload = () => iframe.contentWindow?.print();
        document.body.appendChild(iframe);
      } else {
        alert("Error generating receipt");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      enqueueSnackbar("Something went wrong", { variant: "error" });
    } finally {
      setIsGeneratingFeeReciept(false);
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV3
          Path="Fee Management/Fee Details"
          Icon={AccountBalanceWalletIcon}
          ActionBtn={SearchAnotherButton}
        />
        <br />

        <IndividualFeeDetailsHeader
          studentMasterData={location.state[0]}
          totalFeeHeaderData={totalFeeHeaderData}
        />
        <br />
        {loading ? <LinearProgress /> : null}
        <Box sx={{ display: "flex", justifyContent: "end", mb: "0px" }}>
          <Box
            sx={{
              // background: "var(--bs-gray-300)",
              borderTop: "1px solid var(--bs-gray-300)",
              borderLeft: "1px solid var(--bs-gray-300)",
              borderRight: "1px solid var(--bs-gray-300)",
              borderRadius: "10px 10px 0px 0px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            padding="8px"
          >
            <Button
              variant="soft"
              color="primary"
              onClick={() => setInstantPaymentDialogOpen(true)}
            >
              Instant Payment
            </Button>

            <Button
              variant="soft"
              startDecorator={<Print />}
              onClick={() => generateCurrentFeeReciept(false)}
            ></Button>
            <Button variant="soft" startDecorator={<SettingsIcon />}></Button>
          </Box>
        </Box>

        <Box sx={{ border: "1px solid var(--bs-gray-300)", padding: "8px" }}>
          <Box
            component="form"
            sx={{
              display: "flex",
              alignItems: "bottom",
              gap: "10px",
              alignContent: "baseline",
            }}
            m="10px"
            onSubmit={(e) => handlePaymentRecieveButton(e, false)}
          >
            <FormControl required>
              <FormLabel sx={{ color: "var(--bs-light-text)", m: "4px" }}>
                Fee Collection Date
              </FormLabel>
              <Input
                type="date"
                slotProps={{
                  input: {
                    min: "2020-01-01",
                    max: "2050-01-01",
                  },
                }}
                value={feeCollectionDate!}
                disabled={false}
                onChange={(e) => setFeeCollectionDate(e.target.value)}
              />
            </FormControl>
            <FormControl required>
              <FormLabel sx={{ color: "var(--bs-light-text)", m: "4px" }}>
                Select Fee Challan
              </FormLabel>
              <Select
                placeholder="Select fee challans.."
                required
                sx={{ width: "280px" }}
                value={selectedChallan}
                onChange={(e, val) => setSelectedChallan(val)}
              >
                {feeChallans.length > 0 ? (
                  feeChallans.map((item) => {
                    return (
                      <Option value={item.challanId}>
                        Fee Challan ({item.challanTitle})
                      </Option>
                    );
                  })
                ) : (
                  <Option value="none" disabled>
                    None
                  </Option>
                )}
              </Select>
            </FormControl>
            <FormControl required>
              <FormLabel sx={{ color: "var(--bs-light-text)", m: "4px" }}>
                Payment Method
              </FormLabel>
              <Select
                placeholder="select payment medthod.."
                required
                value={selectedPaymentMethod}
                onChange={(e, val) => setSelectedPaymentMethod(val)}
                defaultValue="CASH"
              >
                <Option value="CASH">Cash</Option>
                <Option value="ONLINE">Online</Option>
              </Select>
            </FormControl>

            {!showPartPaymentOption ? (
              <>
                <FormControl required>
                  <FormLabel sx={{ color: "var(--bs-light-text)", m: "4px" }}>
                    Recieved Amount
                  </FormLabel>
                  <Input
                    type="number"
                    sx={{ width: "150px" }}
                    disabled={true}
                    placeholder="enter recieved amount"
                    value={recievedAmount!}
                    startDecorator={<CurrencyRupee fontSize="small" />}
                  ></Input>
                </FormControl>
                <FormControl
                  sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    type="submit"
                    startDecorator={<MoneyRecive />}
                    loading={isPaymentLoading}
                  >
                    Recieve
                  </Button>
                </FormControl>
              </>
            ) : null}
            <FormControl sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip title="Show part payment option">
                <IconButton
                  variant="solid"
                  color="primary"
                  onClick={() =>
                    setShowPartPaymentOption(!showPartPaymentOption)
                  }
                >
                  {showPartPaymentOption ? (
                    <ArrowDropUpIcon />
                  ) : (
                    <ArrowDropDownIcon />
                  )}
                </IconButton>
              </Tooltip>
            </FormControl>
          </Box>
          <br />
          <AnimatePresence>
            {showPartPaymentOption && selectedChallanDetails ? (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.2 }}
              >
                <Chip sx={{ p: "5px", ml: "5px", pl: "10px", pr: "10px" }}>
                  You have select{" "}
                  <span style={{ color: "var(--bs-danger2)", margin: "5px" }}>
                    Challan ID: {selectedChallanDetails?.challanId}
                  </span>
                  for month of
                  <span style={{ color: "var(--bs-danger2)", margin: "5px" }}>
                    {selectedChallanDetails?.challanTitle}
                  </span>
                  , student total due is
                  <span style={{ color: "var(--bs-danger2)", margin: "5px" }}>
                    ₹{selectedChallanDetails?.totalDue}
                  </span>
                  . Please enter the desired amount below and click pay.
                </Chip>
                <Box
                  component="form"
                  onSubmit={handlePartPaymentSubmit}
                  sx={{ m: "10px", display: "flex", gap: "8px" }}
                >
                  <FormControl>
                    <FormLabel
                      required
                      sx={{ color: "var(--bs-light-text)", m: "4px" }}
                    >
                      Enter recieved amount.
                    </FormLabel>
                    <Input
                      variant="outlined"
                      color="primary"
                      type="text"
                      required
                      placeholder="enter amount"
                      value={recievedAmountPartPayment}
                      onChange={(e) =>
                        setRecievedAmountPartPayment(
                          parseInt(e.target.value) || 0
                        )
                      }
                    ></Input>
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      required
                      sx={{ color: "var(--bs-light-text)", m: "4px" }}
                    >
                      Comment for part payment
                    </FormLabel>
                    <Input
                      required
                      type="text"
                      color="primary"
                      sx={{ width: "350px" }}
                      placeholder=""
                      value={partPaymentComment}
                      onChange={(e) => setPartPaymentComment(e.target.value)}
                    ></Input>
                  </FormControl>
                  <FormControl
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "end",
                    }}
                  >
                    <Button
                      type="submit"
                      startDecorator={<MoneyRecive />}
                      loading={isPaymentLoading}
                    >
                      Recieve
                    </Button>
                  </FormControl>
                </Box>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <Divider sx={{ mt: "16px", mb: "10px" }} />
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
                {/* <th style={{ width: "10%",backgroundColor:"var(--bs-primary-text)",color:"#fff" }}>RECIEPT ID</th> */}
                <th
                  style={{
                    width: "12%",
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  TITLE
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  FEE
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  FINE
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  TRFEE
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  COMFEE
                </th>
                {FEE_HEADERS.map((item) => {
                  return (
                    <th
                      style={{
                        backgroundColor: "var(--bs-primary-text)",
                        color: "#fff",
                      }}
                    >
                      {item.titleShort}
                    </th>
                  );
                })}

                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  PAID
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  CONC.
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  DUE
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  Actions
                </th>
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
                    <>
                      <tr>
                        {/* <td>{item.paymentId}</td> */}
                        <td>{item.challanTitle}</td>
                        <td>
                          {monthlyFeeHeader ? monthlyFeeHeader.amount : 0}
                        </td>
                        <td>{lateFeeHeader ? lateFeeHeader.amount : 0}</td>
                        <td>
                          {transportationFeeHeader
                            ? transportationFeeHeader.amount
                            : 0}
                        </td>
                        <td>
                          {computerFeeHeader ? computerFeeHeader.amount : 0}
                        </td>
                        <td>{examFeeHeader ? examFeeHeader.amount : 0}</td>
                        <td>{annualFeeHeader ? annualFeeHeader.amount : 0}</td>
                        <td>
                          {admissionFeeHeader ? admissionFeeHeader.amount : 0}
                        </td>
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
                            <Button
                              variant="plain"
                              onClick={(e) => handleMenuClick(e, item)}
                            >
                              <MoreVert />
                            </Button>
                          </Tooltip>
                        </td>
                      </tr>
                    </>
                  );
                })
              ) : (
                <tr>
                  <th colSpan={14}>
                    <Typography
                      level="title-md"
                      sx={{ textAlign: "center", margin: "10px" }}
                    >
                      No Challan Found for this user
                    </Typography>
                  </th>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="studentFeeDetailsTableFooter">
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  Grand Total
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sumAmountByHeaderTitle("monthlyFee").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sumAmountByHeaderTitle("lateFine").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sumAmountByHeaderTitle("transportationFee").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sumAmountByHeaderTitle("computerFee").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sumAmountByHeaderTitle("examFee").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sumAmountByHeaderTitle("annualFee").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sumAmountByHeaderTitle("admissionFee").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sumAmountByHeaderTitle("otherFee").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sum("amountPaid").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sum("feeConsession").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                >
                  {sum("totalDue").toFixed(0)}
                </th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                ></th>
                <th
                  style={{
                    backgroundColor: "var(--bs-primary-text)",
                    color: "#fff",
                  }}
                ></th>
              </tr>
            </tfoot>
          </Table>
        </Box>
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
          <MenuItem onClick={() => generateCurrentFeeReciept(true)}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            Print Reciept
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setAddArrearModalopen(true)}>
            <ListItemIcon>
              <PaymentIcon fontSize="small" />
            </ListItemIcon>
            Add Fee Arrear
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => setAddFeeConsessionModalOpen(true)}>
            <ListItemIcon>
              <DiscountIcon fontSize="small" />
            </ListItemIcon>
            Add Consession
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setShowDeleteAuthenticationDialog(true);
            }}
          >
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>

        <AddFeeConsessionModal
          open={addFeeConsessionModalOpen}
          setOpen={setAddFeeConsessionModalOpen}
          challanData={selectedRow!}
        />
        {selectedRow ? (
          <AddFeeArrearModal
            open={addArrearModalOpen}
            setOpen={setAddArrearModalopen}
            studentId={selectedRow.studentId}
            challanDocId={selectedRow.challanId}
            paymentStatus={selectedRow.status}
            feeHeader={selectedRow.feeHeaders}
            challanData={{
              admissionFee:
                selectedRow.feeHeaders.find(
                  (header) => header.headerTitle === "admissionFee"
                )?.amount || 0,
              annualFee:
                selectedRow.feeHeaders.find(
                  (header) => header.headerTitle === "annualFee"
                )?.amount || 0,
              otherFee:
                selectedRow.feeHeaders.find(
                  (header) => header.headerTitle === "otherFee"
                )?.amount || 0,
              examFee:
                selectedRow.feeHeaders.find(
                  (header) => header.headerTitle === "examFee"
                )?.amount || 0,
            }}
          />
        ) : null}

        <InstantPaymentModal
          open={instantPaymentDialogOpen}
          studentMasterData={location.state[0]}
          setOpen={setInstantPaymentDialogOpen}
        />
        {selectedRow ? (
          <DeleteChallanConfirmationDialog
            open={showDeleteAuthenticationDialog}
            setOpen={setShowDeleteAuthenticationDialog}
            studentId={selectedRow.studentId}
            challanId={selectedRow.challanId}
          />
        ) : null}

        <ModalLoader loading={isGeneratingFeeReciept} />
      </LSPage>
    </PageContainer>
  );
}

export default StudentFeeDetails;
