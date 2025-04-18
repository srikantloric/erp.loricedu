import { DialogTitle, Modal, ModalDialog, Stack } from "@mui/joy";
import { enqueueSnackbar } from "notistack";
import { TransportVehicleType } from "types/transport";

// Form imports
import * as Yup from "yup";
import { Formik, Form } from "formik";

// Custom UI Components

// import DateTimePicker from "components/FormsUi/DateTimePicker";
import LoadingButton from "components/FormsUi/LoadingButton";

import { Divider } from "@mui/material";
import { useState } from "react";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import TextField from "../../FormsUi/Textfield";
import DateTimePicker from "components/FormsUi/DateTimePicker";

// Validation Schema
const FormValidationSchema = Yup.object().shape({
  vehicleName: Yup.string().required("Vehicle name is required"),
  vehicleContact: Yup.string()
    .required("Contact number is required")
    .min(10, "Please enter 10 digit number")
    .max(10, "Please enter 10 digit number"),
  driverName: Yup.string().required("Driver name is required"),
  conductorName: Yup.string().optional(),
  registrationNumber: Yup.string().required("Registration number required"),
  totalSeat: Yup.number().required("Total number of seats is required"),
  licenseDate: Yup.string().optional(),
  rcDate: Yup.string().optional(),
  insuranceDate: Yup.string().optional(),
  pollutionDate: Yup.string().optional(),
});

// Props Type
type AddVehicleModalProps = {
  open: boolean;
  onClose: () => void;
  fetchVehicleData: () => void;
};

function AddVehicleModal({ open, onClose, fetchVehicleData }: AddVehicleModalProps) {

  //Get Firebase DB instance
  const { db } = useFirebase();

  const [loading, setLoading] = useState(false);

  const FormInitialState: TransportVehicleType = {
    vehicleName: "",
    driverName: "",
    vehicleContact: "",
    conductorName: "",
    registrationNumber: "",
    totalSeat: 0,
    licenseDate: "",
    rcDate: "",
    insuranceDate: "",
    pollutionDate: "",
  };

  const saveVehicleToDb = async (vehicle: TransportVehicleType) => {
    try {
      setLoading(true);
      const vehicleId = Math.floor(100000 + Math.random() * 900000).toString();
      const transportDataForSave: TransportVehicleType = { vehicleId, ...vehicle };

      const transportRef = doc(db, "TRANSPORT", "transportLocations");

      await updateDoc(transportRef, {
        vehicles: arrayUnion(transportDataForSave),
      });

      enqueueSnackbar("Vehicle added successfully", { variant: "success" });
      fetchVehicleData();
      onClose();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      enqueueSnackbar("Failed to add vehicle. Please try again.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog minWidth="md" sx={{ overflow: "scroll" }}>
        <DialogTitle>Create New Vehicle Data</DialogTitle>
        <Divider />
        <Formik
          initialValues={FormInitialState}
          validationSchema={FormValidationSchema}
          onSubmit={saveVehicleToDb}
        >
          {({ isSubmitting }) => (
            <Form>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField label="Bus/Vehicle Name" name="vehicleName" required />
                  <TextField
                    label="Vehicle Registration Number"
                    name="registrationNumber"
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField label="Driver Name" name="driverName" required />
                  <TextField label="Vehicle Contact" name="vehicleContact" required />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField label="Conductor Name" name="conductorName" />
                  <TextField label="Total Seat" name="totalSeat" required />
                </Stack>
                <Stack direction="row" gap={2}>
                  <DateTimePicker label="License Date" name="licenseDate" />
                  <DateTimePicker label="RC Date" name="rcDate" />
                </Stack>
                <Stack direction="row" gap={2}>
                  <DateTimePicker label="Insurance Date" name="insuranceDate" />
                  <DateTimePicker label="Pollution Date" name="pollutionDate" />
                </Stack>
                <Divider sx={{ mt: 1 }} />
                <LoadingButton loading={isSubmitting || loading} type="submit">
                  Submit
                </LoadingButton>
              </Stack>
            </Form>
          )}
        </Formik>
      </ModalDialog>
    </Modal>
  );
}

export default AddVehicleModal;
