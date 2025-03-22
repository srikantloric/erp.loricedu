import {
  Alert,
  Box,
  Button,
  Grid,
  Input,
  Modal,
  ModalClose,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import { FEE_HEADERS } from "../../constants/index";
import { Additem } from "iconsax-react";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { IChallanHeaderType, IChallanHeaderTypeForChallan, IChallanNL } from "types/payment";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

interface IAddArrearInputTypes {
  examFee: number;
  annualFee: number;
  admissionFee: number;
  otherFee: number;
}
interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  challanDocId: string;
  studentId: string;
  challanData: IAddArrearInputTypes;
  paymentStatus: string;
  feeHeader: IChallanHeaderTypeForChallan[];
}

interface IAddArrearInputTypes extends Record<string, number> { }

const AddFeeArrearModal: React.FC<Props> = ({
  open,
  setOpen,
  challanData,
  studentId,
  challanDocId,
  paymentStatus,
  feeHeader,
}) => {
  const [feeHeaderData, setFeeHeaderData] = useState<IAddArrearInputTypes>({
    examFee: 0,
    annualFee: 0,
    admissionFee: 0,
    otherFee: 0,
  });


  // Get Firebase DB ref
  const { db } = useFirebase()

  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    const total =
      feeHeaderData.admissionFee +
      feeHeaderData.annualFee +
      feeHeaderData.examFee +
      feeHeaderData.otherFee;
    setTotalAmount(total);
  }, [feeHeaderData]);

  async function updateFeeHeaders(
    studentId: string,
    challanId: string,
    newHeaders: IChallanHeaderType[]
  ): Promise<void> {
    try {
      // Reference to the specific challan document
      const challanRef = doc(db, "STUDENTS", studentId, "CHALLANS", challanId);

      // Fetch the current challan document
      const challanDoc = await getDoc(challanRef);
      if (!challanDoc.exists()) {
        throw new Error("Challan not found");
      }

      // Get the current data
      const challanData = challanDoc.data() as IChallanNL;
      const { feeHeaders = [] } = challanData;

      // Create a map of existing headers for quick lookup
      const feeHeadersMap = new Map(
        feeHeaders.map((header) => [header.headerTitle, header])
      );

      // Update the headers
      newHeaders.forEach((newHeader) => {
        if (feeHeadersMap.has(newHeader.headerTitle)) {
          // Header exists, update the amount
          const existingHeader = feeHeadersMap.get(newHeader.headerTitle);
          if (existingHeader) {
            existingHeader.amount += newHeader.amount;
            existingHeader.amountPaidTotal += newHeader.amountPaid;
          }
        } else {
          // Header does not exist, append the new header
          feeHeadersMap.set(newHeader.headerTitle, newHeader);
        }
      });

      // Convert the map back to an array
      const updatedFeeHeaders = Array.from(feeHeadersMap.values());

      let pStatus = "";
      switch (paymentStatus) {
        case "PAID":
        case "PARTIAL":
          pStatus = "PARTIAL";
          break;
        case "UNPAID":
          pStatus = "UNPAID";
          break;
        default:
          pStatus = "";
      }

      // Update the document with the modified feeHeaders array
      await updateDoc(challanRef, {
        feeHeaders: updatedFeeHeaders,
        status: pStatus,
      });

      enqueueSnackbar("Fee Header Updated Successfully!", { variant: "success" });
      setOpen(false);
    } catch (error) {
      enqueueSnackbar("Failed to update! " + error, { variant: "error" });
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    var feeHeaderList: IChallanHeaderType[] = [];

    if (feeHeaderData.admissionFee) {
      feeHeaderList.push({
        headerTitle: "admissionFee",
        amountPaid: 0,
        amount: feeHeaderData.admissionFee,
        amountDue: 0,
        amountPaidTotal: 0
      });
    }
    if (feeHeaderData.examFee) {
      feeHeaderList.push({
        headerTitle: "examFee",
        amountPaid: 0,
        amount: feeHeaderData.examFee,
        amountDue: 0,
        amountPaidTotal: 0
      });
    }
    if (feeHeaderData.annualFee) {
      feeHeaderList.push({
        headerTitle: "annualFee",
        amountPaid: 0,
        amount: feeHeaderData.annualFee,
        amountDue: 0,
        amountPaidTotal: 0
      });
    }
    if (feeHeaderData.otherFee) {
      feeHeaderList.push({
        headerTitle: "otherFee",
        amountPaid: 0,
        amount: feeHeaderData.otherFee,
        amountDue: 0,
        amountPaidTotal: 0
      });
    }

    updateFeeHeaders(studentId, challanDocId, feeHeaderList);
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
          Create Fee Arrear
        </Typography>
        <Typography id="modal-desc" textColor="text.tertiary">
          Using this functionality you can add fee arrear for student.
        </Typography>
        <Box mt="6px" component="form" onSubmit={handleFormSubmit}>
          <Grid container gap="0.5rem" mt="1rem" justifyContent="space-between">
            {FEE_HEADERS.map((item) => {
              return (
                <>
                  <Grid xs={5}>
                    <Typography>{item.title}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Input
                      value={feeHeaderData[item.field]}
                      onChange={(e) =>
                        setFeeHeaderData((prev) => ({
                          ...prev,
                          [item.field]: parseInt(e.target.value) || 0,
                        }))
                      }
                      defaultValue={0}
                      startDecorator={"Rs."}
                    />
                  </Grid>
                </>
              );
            })}
          </Grid>
          <Alert sx={{ mt: "1rem" }} color="danger">
            Total amount of Rs.{totalAmount} will be added to existing challan.
          </Alert>

          <Stack
            direction="row"
            justifyContent="end"
            alignItems="center"
            mt="16px"
          >
            <Button type="submit">Add Fee Arrear</Button>
          </Stack>
        </Box>
      </Sheet>
    </Modal>
  );
};

export default AddFeeArrearModal;
