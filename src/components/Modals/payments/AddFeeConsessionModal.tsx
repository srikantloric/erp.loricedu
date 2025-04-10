import {
  Box,
  Button,
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
  Table,
  Typography,
} from "@mui/joy";
import { Additem } from "iconsax-react";
// import { IStudentFeeChallanExtended } from "types/student";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { IChallanNL } from "types/payment";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  challanData: IChallanNL;
}

const AddFeeConsessionModal: React.FC<Props> = ({
  open,
  setOpen,
  challanData,
}) => {

  //Get Firebase DB instance
  const {db} = useFirebase();


  const [consessionAmount, setConsessionAmount] = useState<number>();
  const [consessionNarration, setConsessionNarration] = useState<string | null>(
    null
  );
  const [consessionAuthPerson, setConsessionAuthPerson] = useState<
    string | null
  >("PRINCIPAL");

  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  
    if (consessionAmount! > challanData.totalDue!) {
      enqueueSnackbar("Concession amount is more than due amount!", {
        variant: "error",
      });
      setLoading(false);
      return;
    }
  
    try {
      const batch = writeBatch(db);
  
      const challanRef = doc(
        db,
        "STUDENTS",
        challanData.studentId,
        "CHALLANS",
        challanData.challanId
      );
  
      const consessionLogRef = doc(
        db,
        "STUDENTS",
        challanData.studentId,
        "CONSESSION_LOG",
        crypto.randomUUID() // Generates a unique ID for the document
      );
  
      // Preparing data for concession log
      const consessionLogData = {
        createdAt: serverTimestamp(),
        createdBy: "admin",
        challanId: challanData.challanId,
        consessionAmount: consessionAmount,
        dueAmountBeforeConsession: challanData.totalDue,
        consessionNarration: consessionNarration,
        consessionAuthPerson: consessionAuthPerson,
      };
  
      batch.update(challanRef, { feeConsession: consessionAmount });
      batch.set(consessionLogRef, consessionLogData);
  
      await batch.commit();
  
      enqueueSnackbar("Concession Applied Successfully!", { variant: "success" });
      setLoading(false);
      setOpen(false);
      setConsessionAmount(0);
      setConsessionAuthPerson(null);
      setConsessionNarration("");
    } catch (error) {
      enqueueSnackbar("Error while adding concession!", { variant: "error" });
      setLoading(false);
    }
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
          Add Consession
        </Typography>
        <Typography id="modal-desc" textColor="text.tertiary" mt="5px">
          Using this functionality you can add discount to selected challan.
        </Typography>

        <Typography level="title-sm" mt="10px">
          Fee Challan Details
        </Typography>
        <Table
          variant="soft"
          sx={{ mt: "8px", border: "1px solid var(--bs-primary)" }}
          borderAxis="both"
        >
          <thead>
            <tr>
              <td>Challan Id</td>
              <td>{challanData && challanData.challanId}</td>
            </tr>
            <tr>
              <td>Due Amount</td>
              <td>Rs.{challanData && challanData.totalDue}/-</td>
            </tr>
          </thead>
        </Table>

        <Box mt="6px" component="form" onSubmit={handleFormSubmit}>
          <Grid
            container
            gap={1}
            sx={{ justifyContent: "space-between" }}
            mt="8px"
          >
            <Grid xs={5}>
              <FormControl required>
                <FormLabel>Consession Amount</FormLabel>
                <Input
                  placeholder="consession amount.."
                  required
                  type="number"
                  value={consessionAmount}
                  onChange={(e) =>
                    setConsessionAmount(parseInt(e.target.value))
                  }
                />
                {/* <FormHelperText>This is a helper text.</FormHelperText> */}
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl required>
                <FormLabel>Authorisation</FormLabel>
                <Select
                  placeholder="authrised by.."
                  required
                  defaultValue="PRINCIPAL"
                  onChange={(e, val) => setConsessionAuthPerson(val)}
                >
                  <Option value="PRINCIPAL">Principal</Option>
                  <Option value="SELF">Self</Option>
                </Select>

                {/* <FormHelperText>This is a helper text.</FormHelperText> */}
              </FormControl>
            </Grid>
          </Grid>

          <FormControl sx={{ mt: "8px" }} required>
            <FormLabel>Narration</FormLabel>
            <Input
              placeholder="consession narration.."
              required
              type="text"
              value={consessionNarration!}
              onChange={(e) => setConsessionNarration(e.target.value)}
            />
            {/* <FormHelperText>This is a helper text.</FormHelperText> */}
          </FormControl>

          <Typography mt="8px" level="body-sm" color="primary">
            Note : If consession already applied, then it will reset previous
            one and current consession will start reflecting.
          </Typography>
          <Stack
            direction="row"
            justifyContent="end"
            alignItems="end"
            mt="16px"
          >
            <Button type="submit" loading={loading}>
              Create Consession
            </Button>
          </Stack>
        </Box>
      </Sheet>
    </Modal>
  );
};

export default AddFeeConsessionModal;
