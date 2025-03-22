import { DialogTitle, Modal, ModalDialog, Stack } from "@mui/joy";
import { Button, Divider, FormControl, FormHelperText, FormLabel, Input } from "@mui/joy"
import { useState } from "react";
import { db } from "../../../firebase";
import { enqueueSnackbar } from "notistack";
import { doc, updateDoc } from "firebase/firestore";


type SerialNumber = {
    serialNo?: number
}


type TransportData = SerialNumber & {
    locationId?: string,
    pickupPointName: string,
    distance: string,
    monthlyCharge: string
}


type EditPickupPointDialogProps = {
    locationData: TransportData[],
    selectedLocation: TransportData,
    open: boolean,
    onClose: () => void
    fetchTransportData: () => void
}

function EditPickupPointModal(props: EditPickupPointDialogProps) {
    const { open, onClose, fetchTransportData, locationData, selectedLocation } = props
    const [formState, setFormState] = useState<TransportData>({
        pickupPointName: selectedLocation.pickupPointName,
        distance: selectedLocation.distance,
        monthlyCharge: selectedLocation.monthlyCharge,
        locationId: selectedLocation.locationId
    })

    const [formError, setFormError] = useState({
        pickupPointName: "",
        distance: "",
        monthlyCharge: ""
    })


    const handleFormChange = (e: any) => {
        setFormError({
            ...formError,
            [e.target.name]: ""
        })
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        })
    }
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newFormError = {
            pickupPointName: formState.pickupPointName ? "" : "Pickup Point Name is required",
            distance: formState.distance ? "" : "Distance is required",
            monthlyCharge: formState.monthlyCharge ? "" : "Monthly Charge is required",
        };

        setFormError(newFormError);

        // Check for validation errors
        if (Object.values(newFormError).some((err) => err !== "")) return;

        try {

            const transportRef = doc(db, "TRANSPORT", "transportLocations");

            // Update location data
            const locationIndex = locationData.findIndex(
                (location) => location.locationId === selectedLocation.locationId
            );

            if (locationIndex !== -1) {
                locationData[locationIndex] = { ...formState };

                await updateDoc(transportRef, { locations: locationData });

                enqueueSnackbar("Pickup Point updated successfully!", { variant: "success" });
                fetchTransportData();
                onClose();
            } else {
                enqueueSnackbar("Location not found!", { variant: "error" });
            }
        } catch (error) {
            console.error("Error updating transport data:", error);
            enqueueSnackbar("Failed to update pickup point!", { variant: "error" });
        }
    };


    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog minWidth="sm">
                <DialogTitle>Create New Pickup Point</DialogTitle>
                <form
                    onSubmit={handleFormSubmit}
                >
                    <Stack spacing={2}>
                        <FormControl error={formError.pickupPointName ? true : false}>
                            <FormLabel>Pickup Point Name</FormLabel>
                            <Input placeholder="Pickup Point Name" onChange={handleFormChange} name="pickupPointName" value={formState.pickupPointName} />
                            {formError.pickupPointName && <FormHelperText>{formError.pickupPointName}</FormHelperText>}
                        </FormControl>
                        <FormControl error={formError.distance ? true : false}>
                            <FormLabel>Distance</FormLabel>
                            <Input placeholder="Distance" name="distance" value={formState.distance} onChange={handleFormChange} />
                            {formError.distance && <FormHelperText>{formError.distance}</FormHelperText>}
                        </FormControl>
                        <FormControl error={formError.monthlyCharge ? true : false}>
                            <FormLabel>Monthly Charge</FormLabel>
                            <Input placeholder="Monthly Charge" name="monthlyCharge" value={formState.monthlyCharge} onChange={handleFormChange} />
                            {formError.monthlyCharge && <FormHelperText>{formError.monthlyCharge}</FormHelperText>}
                        </FormControl>
                        <Divider sx={{ mt: 1 }} />
                        <Button type="submit" color="primary">Update</Button>
                    </Stack>
                </form>
            </ModalDialog>
        </Modal>
    )
}

export default EditPickupPointModal