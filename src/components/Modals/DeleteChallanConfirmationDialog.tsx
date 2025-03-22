import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
} from "@mui/joy";
import { Warning2 } from "iconsax-react";
import { useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import { enqueueSnackbar } from "notistack";
import { arrayRemove, collection, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
interface Props {
  open: boolean;
  setOpen: (props: boolean) => void;
  studentId: string;
  challanId: string;
}

const DeleteChallanConfirmationDialog: React.FC<Props> = ({
  open,
  setOpen,
  studentId,
  challanId,
}) => {

    //Get Firebase DB instance
    const {db} = useFirebase();
  

  const [accessKeyInput, setAccessKeyInput] = useState<string>("");
  const [accessKeyError, setAccessKeyError] = useState<string>("");

  const handleConfirmButton = async () => {
    if (accessKeyInput !== "123456") {
      setAccessKeyError("Access Key is incorrect!");
      return;
    }
  
    if (!studentId || !challanId) {
      enqueueSnackbar("Unable to delete, please try refreshing!", {
        variant: "error",
      });
      return;
    }
  
    try {
      const batch = writeBatch(db);
  
      const challanRef = doc(
        db,
        "STUDENTS",
        studentId,
        "CHALLANS",
        challanId
      );
  
      const paymentRefNlQuery = query(
        collection(db, "STUDENTS", studentId, "PAYMENTS"),
        where("challanId", "==", challanId)
      );
  
      const paymentRefGlQuery = query(
        collection(db, "MY_PAYMENTS"),
        where("challanId", "==", challanId)
      );
  
      const studentDocRef = doc(db, "STUDENTS", studentId);
  
      // Fetch documents for deletion
      const snapshot1 = await getDocs(paymentRefGlQuery);
      snapshot1.forEach((doc) => batch.delete(doc.ref));
  
      const snapshot2 = await getDocs(paymentRefNlQuery);
      snapshot2.forEach((doc) => batch.delete(doc.ref));
  
      // Delete the challan
      batch.delete(challanRef);
  
      // Update student document
      batch.update(studentDocRef, {
        generatedChallans: arrayRemove(challanId),
      });
  
      await batch.commit();
  
      enqueueSnackbar("Challan deleted successfully!", {
        variant: "success",
      });
      setOpen(false);
    } catch (e) {
      enqueueSnackbar("Failed to delete document!", { variant: "error" });
      console.error("Error deleting document using batch: ", e);
      setOpen(false);
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog variant="outlined" role="alertdialog">
        <DialogTitle>
          <Warning2 />
          Information
        </DialogTitle>
        <Divider />
        <DialogContent>
          Warning! it seems you are going to do ciritical change, are you sure ?
          <FormControl sx={{ mt: "1rem", mb: "1rem" }}>
            <FormLabel>Enter Change Key</FormLabel>
            <Input
              placeholder="enter change key"
              value={accessKeyInput}
              onChange={(e) => setAccessKeyInput(e.target.value)}
            ></Input>
            <FormHelperText>
              Key will be required to change these values, please contact admin.
            </FormHelperText>
            {accessKeyError === "" ? null : (
              <Alert
                variant="soft"
                color="danger"
                sx={{ mt: "1rem" }}
                startDecorator={<LockIcon />}
              >
                {accessKeyError}
              </Alert>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="solid" color="danger" onClick={handleConfirmButton}>
            Agree
          </Button>
          <Button
            variant="plain"
            color="neutral"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default DeleteChallanConfirmationDialog;
