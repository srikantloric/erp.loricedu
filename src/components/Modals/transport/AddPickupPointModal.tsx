import { DialogTitle, Modal, ModalDialog, Stack } from "@mui/joy";
import { Button, Divider, FormControl, FormHelperText, FormLabel, Input } from "@mui/joy";
import { useState } from "react";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { useFirebase } from "context/firebaseContext";

type SerialNumber = {
  serialNo?: number;
};

type TransportData = SerialNumber & {
  locationId?: string;
  pickupPointName: string;
  distance: string;
  monthlyCharge: string;
};

type AddPickupPointDialogProps = {
  open: boolean;
  onClose: () => void;
  fetchTransportData: () => void;
};

function AddPickupPointModal(props: AddPickupPointDialogProps) {

  //Get Firebase DB instance
  const { db } = useFirebase();

  const { open, onClose, fetchTransportData } = props;
  const [formState, setFormState] = useState<TransportData>({
    pickupPointName: "",
    distance: "",
    monthlyCharge: "",
  });

  const [formError, setFormError] = useState({
    pickupPointName: "",
    distance: "",
    monthlyCharge: "",
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError({ ...formError, [e.target.name]: "" });
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let error = false;

    const newFormError = {
      pickupPointName: formState.pickupPointName ? "" : "Pickup Point Name is required",
      distance: formState.distance ? "" : "Distance is required",
      monthlyCharge: formState.monthlyCharge ? "" : "Monthly Charge is required",
    };

    setFormError(newFormError);
    error = Object.values(newFormError).some((err) => err !== "");

    if (!error) {
      const generateUniqueNumber = () => Math.floor(100000 + Math.random() * 900000).toString();
      const locationId = generateUniqueNumber(); // Generate a unique 6-digit transport ID

      const transportDataForSave: TransportData = { locationId, ...formState };

      try {
        const transportRef = doc(db, "TRANSPORT", "transportLocations");
        await setDoc(
          transportRef,
          { locations: arrayUnion(transportDataForSave) },
          { merge: true }
        );

        setFormState({ pickupPointName: "", distance: "", monthlyCharge: "" });
        onClose();
        enqueueSnackbar("Pickup Point Added Successfully", { variant: "success" });
        fetchTransportData();
      } catch (error) {
        enqueueSnackbar("Failed to add pickup point", { variant: "error" });
        console.error("Error adding pickup point:", error);
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog minWidth="sm">
        <DialogTitle>Create New Pickup Point</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <Stack spacing={2}>
            <FormControl error={!!formError.pickupPointName}>
              <FormLabel>Pickup Point Name</FormLabel>
              <Input
                placeholder="Pickup Point Name"
                name="pickupPointName"
                value={formState.pickupPointName}
                onChange={handleFormChange}
              />
              {formError.pickupPointName && <FormHelperText>{formError.pickupPointName}</FormHelperText>}
            </FormControl>
            <FormControl error={!!formError.distance}>
              <FormLabel>Distance</FormLabel>
              <Input placeholder="Distance" name="distance" value={formState.distance} onChange={handleFormChange} />
              {formError.distance && <FormHelperText>{formError.distance}</FormHelperText>}
            </FormControl>
            <FormControl error={!!formError.monthlyCharge}>
              <FormLabel>Monthly Charge</FormLabel>
              <Input
                placeholder="Monthly Charge"
                name="monthlyCharge"
                value={formState.monthlyCharge}
                onChange={handleFormChange}
              />
              {formError.monthlyCharge && <FormHelperText>{formError.monthlyCharge}</FormHelperText>}
            </FormControl>
            <Divider sx={{ mt: 1 }} />
            <Button type="submit" color="primary">
              Add
            </Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}

export default AddPickupPointModal;
