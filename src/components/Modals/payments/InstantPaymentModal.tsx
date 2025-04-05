import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalClose,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { FEE_HEADERS } from "../../../constants/index";
import { Additem } from "iconsax-react";
import { useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { SCHOOL_FEE_MONTHS, SCHOOL_FEE_YEAR } from "config/schoolConfig";
import {
  generateAlphanumericUUID,
  generateChallanDocId,
  getChallanTitle,
} from "utilities/UtilitiesFunctions";
import { StudentDetailsType } from "types/student";
import { enqueueSnackbar } from "notistack";
import { generateFeeHeadersForChallanWithMarkedAsPaid } from "utilities/PaymentUtilityFunctions";
import { IChallanHeaderType, IChallanNL, IPaymentNL } from "types/payment";
import { collection, doc, getDoc, serverTimestamp, Timestamp, writeBatch } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  studentMasterData: StudentDetailsType;
}

interface IInstantPaymentDetailsType {
  monthlyFee: number;
  computerFee: number;
  transportationFee: number;
  annualFee: number;
  admissionFee: number;
  otherFee: number;
  examFee: number;
  lateFine: number;
  feeConsession: number;
  fee_discount: number;
}

interface IInstantPaymentDetailsType extends Record<string, number> { }

const InstantPaymentModal: React.FC<Props> = ({
  open,
  setOpen,
  studentMasterData,
}) => {

  //Get Firebase DB instance
  const { db } = useFirebase();

  const [showMoreHeader, setShowMoreHeaders] = useState<boolean>(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  const [isMarkedAsPaid, setIsMarkedAsPaid] = useState<boolean>(false);

  const [totalFee, setTotalFee] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [feeDetail, setFeeDetails] = useState<IInstantPaymentDetailsType>({
    monthlyFee: 0,
    computerFee: 0,
    transportationFee: 0,
    annualFee: 0,
    admissionFee: 0,
    otherFee: 0,
    examFee: 0,
    lateFine: 0,
    feeConsession: 0,
    fee_discount: 0,
  });

  useEffect(() => {
    if (studentMasterData) {
      const feeInitialData: IInstantPaymentDetailsType = {
        monthlyFee: studentMasterData.monthly_fee!,
        computerFee: studentMasterData.computer_fee!,
        transportationFee: studentMasterData.transportation_fee!,
        annualFee: 0,
        admissionFee: 0,
        otherFee: 0,
        examFee: 0,
        lateFine: 0,
        feeConsession: 0,
        fee_discount: studentMasterData.fee_discount!,
      };
      setFeeDetails(feeInitialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    var totalFee =
      Number(feeDetail.monthlyFee) +
      Number(feeDetail.computerFee) +
      Number(feeDetail.transportationFee) +
      Number(feeDetail.admissionFee) +
      Number(feeDetail.examFee) +
      Number(feeDetail.annualFee) +
      Number(feeDetail.otherFee) +
      Number(feeDetail.lateFine) -
      Number(feeDetail.feeConsession);

    setTotalFee(totalFee);
  }, [feeDetail]);


  const generateFeeChallan = async () => {

    if (!studentMasterData) {
      enqueueSnackbar("Failed to fetch student data!", { variant: "error" });
      return;
    }

    const studentDocRef = doc(db, "STUDENTS", studentMasterData.id);
    const studentSnap = await getDoc(studentDocRef);

    if (!studentSnap.exists()) {
      enqueueSnackbar("Unable to fetch student details!", { variant: "error" });
      return;
    }

    const studentMasterDataUpdated = studentSnap.data() as StudentDetailsType;
    const challanDocId = generateChallanDocId(selectedMonth, selectedYear);

    const isAlreadyGenerated = studentMasterDataUpdated.generatedChallans?.includes(challanDocId) || false;

    if (isAlreadyGenerated) {
      enqueueSnackbar("Fee Challan Already Exists for this Month & Year.", { variant: "error" });
      return;
    }

    const { totalFeeAmount: baseTotalFeeAmount, feeHeaderList } = generateFeeHeadersForChallanWithMarkedAsPaid(
      studentMasterDataUpdated,
      isMarkedAsPaid
    );

    const additionalFeeHeaders: IChallanHeaderType[] = [
      { headerTitle: "admissionFee", amount: feeDetail.admissionFee },
      { headerTitle: "annualFee", amount: feeDetail.annualFee },
      { headerTitle: "examFee", amount: feeDetail.examFee },
      { headerTitle: "otherFee", amount: feeDetail.otherFee },
    ]
      .filter((fee) => fee.amount)
      .map((fee) => ({
        headerTitle: fee.headerTitle,
        amount: fee.amount,
        amountDue: 0,
        amountPaidTotal: isMarkedAsPaid ? fee.amount : 0,
        amountPaid: isMarkedAsPaid ? fee.amount : 0,
      }));

    if (feeDetail.lateFine) {
      additionalFeeHeaders.push({
        amount: feeDetail.lateFine,
        headerTitle: "lateFee",
        amountDue: 0,
        amountPaidTotal: isMarkedAsPaid ? feeDetail.lateFine : 0,
        amountPaid: isMarkedAsPaid ? feeDetail.lateFine : 0,
      });
    }

    // Calculate the total amount including additional fee headers
    const additionalFeeTotal = additionalFeeHeaders.reduce((sum, header) => sum + header.amount, 0);
    const totalFeeAmount = baseTotalFeeAmount + additionalFeeTotal;

    const finalFeeHeader = [...feeHeaderList, ...additionalFeeHeaders];
    const challanTitle = getChallanTitle(selectedMonth!, selectedYear!);

    const challan: IChallanNL = {
      challanTitle,
      studentId: studentMasterDataUpdated.id,
      challanId: challanDocId,
      feeHeaders: finalFeeHeader,
      totalAmount: totalFeeAmount,
      amountPaid: isMarkedAsPaid ? totalFeeAmount : 0,
      status: isMarkedAsPaid ? "PAID" : "UNPAID",
      createdBy: "Admin",
      createdOn: Timestamp.fromDate(new Date()),
      dueDate: Timestamp.fromDate(new Date("9999-12-31")),
      feeDiscount: studentMasterDataUpdated.fee_discount || 0,
      feeConsession: feeDetail.feeConsession,
    };

    const batch = writeBatch(db);
    const challanDocRef = doc(collection(studentDocRef, "CHALLANS"), challanDocId);

    // Updating generatedChallans array
    batch.update(studentDocRef, {
      generatedChallans: [...(studentMasterDataUpdated.generatedChallans || []), challanDocId],
    });

    // Adding challan to Firestore
    batch.set(challanDocRef, challan);

    // Adding fee concession log if applicable
    if (feeDetail.feeConsession) {
      const feeConsessionLogRef = doc(collection(studentDocRef, "CONSESSION_LOG"));
      batch.set(feeConsessionLogRef, {
        createdAt: serverTimestamp(),
        createdBy: "admin",
        challanId: challanDocId,
        consessionAmount: feeDetail.feeConsession,
        dueAmountBeforeConsession: 0,
        consessionNarration: "Not Available",
        consessionAuthPerson: "Instant Pay",
      });
    }

    // If marked as paid, add to payments
    if (isMarkedAsPaid) {
      const paymentData: IPaymentNL = {
        challanTitle,
        paymentId: generateAlphanumericUUID(8),
        studentId: studentMasterDataUpdated.id,
        challanId: challanDocId,
        amountPaid: totalFeeAmount,
        recievedBy: "Admin",
        recievedOn: Timestamp.now(),
        timestamp: Timestamp.now(),
        breakdown: finalFeeHeader,
        status: "PAID",
        feeConsession: feeDetail.feeConsession,
      };

      const paymentCollRef = doc(collection(studentDocRef, "PAYMENTS"));
      const paymentCollRefGlobal = doc(collection(db, "MY_PAYMENTS"));

      batch.set(paymentCollRef, paymentData);
      batch.set(paymentCollRefGlobal, paymentData);
    }

    try {
      await batch.commit();
      setOpen(false);
      setLoading(false);
      enqueueSnackbar("Payment Received Successfully :)", { variant: "success" });
    } catch (error) {
      setLoading(false);
      enqueueSnackbar("Something went wrong! " + error, { variant: "error" });
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generateFeeChallan();
  };

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      onClose={() => setOpen(false)}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: 500,
          borderRadius: "md",
          p: 3,
          boxShadow: "sm",
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Typography
          component="h2"
          id="modal-title"
          level="h4"
          textColor="inherit"
          fontWeight="lg"
          mb={1}
          sx={{ display: "flex", alignItems: "center", gap: "5px" }}
        >
          <Additem size="20" />
          Instant Fee Payment
        </Typography>
        <Typography level="body-sm" textColor="text.tertiary">
          Using this functionality you can create instant fee and directly pay.
        </Typography>
        <Box component="form" onSubmit={handleFormSubmit} mt="1rem">
          <Grid container mb="1rem" justifyContent="space-between">
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Fee Month</FormLabel>
                <Select
                  defaultValue={selectedMonth && selectedMonth}
                  onChange={(e, val) => setSelectedMonth(val!)}
                >
                  {SCHOOL_FEE_MONTHS.map((item) => (
                    <Option value={item.value} key={item.title}>
                      {item.value === currentMonth
                        ? item.title + " (Current Month)"
                        : item.title}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={5}>
              <FormControl>
                <FormLabel>Fee Year</FormLabel>
                <Select
                  defaultValue={selectedYear}
                  onChange={(e, val) => setSelectedYear(val!)}
                >
                  {SCHOOL_FEE_YEAR.map((item) => (
                    <Option value={item.value} key={item.title}>
                      {item.value === currentYear
                        ? item.title + " (Current Year)"
                        : item.title}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Divider />

          <Grid container gap="0.5rem" justifyContent="space-between" mt="1rem">
            <Grid xs={5}>
              <Typography>Monthy Fee</Typography>
            </Grid>
            <Grid xs={5}>
              <Typography>Rs. {feeDetail && feeDetail.monthlyFee}</Typography>
            </Grid>
            {studentMasterData.fee_discount ? (
              <>
                <Grid xs={5}>
                  <Typography>Fee Discount</Typography>
                </Grid>
                <Grid xs={5}>
                  <Typography>
                    Rs. {feeDetail && feeDetail.fee_discount}
                  </Typography>
                </Grid>
              </>
            ) : null}

            <Grid xs={5}>
              <Typography>Computer Fee</Typography>
            </Grid>
            <Grid xs={5}>Rs. {feeDetail && feeDetail.computerFee}</Grid>
            <Grid xs={5}>
              <Typography>Transport Fee</Typography>
            </Grid>
            <Grid xs={5}>Rs. {feeDetail && feeDetail.transportationFee}</Grid>

            <Grid xs={12}>
              <Button
                startDecorator={<ArrowDropDownIcon />}
                onClick={() => setShowMoreHeaders(!showMoreHeader)}
                variant="plain"
              >
                Show more headers
              </Button>
            </Grid>
            {showMoreHeader
              ? FEE_HEADERS.map((item) => {
                return (
                  <>
                    <Grid xs={5}>
                      <Typography>{item.title}</Typography>
                    </Grid>
                    <Grid xs={5}>
                      <Input
                        name={item.field}
                        value={feeDetail[item.field]}
                        onChange={(e) =>
                          setFeeDetails((prev) => ({
                            ...prev,
                            [item.field]: parseInt(e.target.value) || 0,
                          }))
                        }
                        defaultValue={0}
                        startDecorator={"₹"}
                      />
                    </Grid>
                  </>
                );
              })
              : null}
          </Grid>
          <Grid container justifyContent={"space-between"}>
            <Grid xs={5.8}>
              <FormControl>
                <FormLabel>Late Fee</FormLabel>
                <Input
                  value={feeDetail.lateFine}
                  onChange={(e) =>
                    setFeeDetails((prev) => ({
                      ...prev,
                      lateFine: parseInt(e.target.value) || 0,
                    }))
                  }
                  startDecorator={"₹"}
                />
              </FormControl>
            </Grid>
            <Grid xs={5.8}>
              <FormControl>
                <FormLabel>Consession</FormLabel>
                <Input
                  value={feeDetail.feeConsession}
                  onChange={(e) =>
                    setFeeDetails((prev) => ({
                      ...prev,
                      feeConsession: parseInt(e.target.value) || 0,
                    }))
                  }
                  startDecorator={"₹"}
                />
              </FormControl>
            </Grid>
            <Grid xs={12} md={12} mt="0.5rem">
              <Alert variant="soft" color="success">
                Total Fee Amount : {totalFee}
              </Alert>
            </Grid>
          </Grid>
          <Stack
            direction="row"
            justifyContent="end"
            alignItems="center"
            mt="16px"
            gap="1rem"
          >
            <Checkbox
              label="Mark as paid"
              size="sm"
              checked={isMarkedAsPaid}
              onChange={(e) => setIsMarkedAsPaid(e.target.checked)}
            />
            <Button type="submit" loading={loading}>
              {isMarkedAsPaid ? "Collect Payment" : "Create Challan"}
            </Button>
          </Stack>
        </Box>
      </Sheet>
    </Modal>
  );
};

export default InstantPaymentModal;
