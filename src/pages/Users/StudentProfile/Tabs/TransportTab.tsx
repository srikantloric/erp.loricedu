import { Box, Button, Chip, Divider, FormControl, FormHelperText, FormLabel, Option, Select, Stack, Switch, Typography } from '@mui/joy';
import React, { useEffect } from 'react'
import { StudentDetailsType } from 'types/student';
import BusIcon from "assets/bus-stop-icon.png"
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PlaceIcon from '@mui/icons-material/Place';
import { doc, getDoc } from 'firebase/firestore';
import { TransportLocationType, TransportVehicleType } from 'types/transport';
import { useFirebase } from 'context/firebaseContext';
import { enqueueSnackbar } from 'notistack';
interface StudentProfileProps {
    studentData: StudentDetailsType;
}



const TransportTab: React.FC<StudentProfileProps> = ({ studentData }) => {

    const [transportLocations, setTransportLocations] = React.useState<TransportLocationType[]>([]);
    const [transportVehicle, setTransportVehicle] = React.useState<TransportVehicleType[]>([]);
    const [checked, setChecked] = React.useState(false);
    //Get Firebase DB instance
    const { db } = useFirebase();

    useEffect(() => {

        if (!studentData) {
            enqueueSnackbar("Unable to load student data!", { variant: "error" });
            return;
        }
        setChecked(studentData.transportation_fee !== 0 ? true : false);

        // Fetch transport data from Firestore

        const fetchTransportData = async () => {
            try {
                const transportSnap = await getDoc(doc(db, "TRANSPORT", "transportLocations"));
                if (transportSnap.exists()) {
                    const { locations, vehicles } = transportSnap.data() || {};
                    setTransportLocations(locations || []);
                    setTransportVehicle(vehicles || []);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching transport data:", error);
            }
        };
        fetchTransportData();
    }, [db]);

    return (
        <>
            <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "2px", }}>
                <Stack direction="row" justifyContent={"space-between"} alignItems={"center"} p={1}>

                    <Box sx={{ padding: "1rem", fontSize: "1rem", fontWeight: "bold" }}>
                        Transport Details
                    </Box>
                    <FormControl
                        orientation="horizontal"
                        sx={{ width: 300, justifyContent: 'space-between' }}
                    >
                        <div>
                            <FormLabel>Transport Status</FormLabel>
                            <FormHelperText sx={{ mt: 0 }}>Enable/Disable Transport</FormHelperText>
                        </div>
                        <Switch
                            checked={checked}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setChecked(event.target.checked)
                            }
                            color={checked ? 'success' : 'neutral'}
                            variant={checked ? 'solid' : 'outlined'}
                            endDecorator={checked ? 'Enabled' : 'Disabled'}
                            slotProps={{
                                endDecorator: {
                                    sx: {
                                        minWidth: 24,
                                    },
                                },
                            }}
                        />
                    </FormControl>
                </Stack>
                <Divider />
                <Stack direction={"row"} p={1} gap={2} alignItems={"center"} justifyContent={"space-between"}>
                    <Stack direction={"row"} p={1} gap={2} alignItems={"center"}>
                        <img src={BusIcon} alt='bus-icon' height="150px" />
                        <Divider orientation='vertical' />
                        <Box>
                            <Typography level='title-md'>
                                Pickup Point:N/A
                            </Typography >
                            <Typography level='title-md'>
                                Distance From School:N/A
                            </Typography>
                            <Typography level='title-md'>
                                Transport Fee:N/A
                            </Typography>
                            <Typography level='title-md'>
                                Vehicle :N/A
                            </Typography>

                        </Box>
                    </Stack>
                    <Stack mr={2}>
                        <Chip variant="solid" color={checked ? "success" : "danger"}><Typography level="title-lg" sx={{ fontSize: "18px", color: "white", p: 1 }}>{checked ? "Enabled" : "Disabled"}</Typography></Chip>
                    </Stack>
                </Stack>
            </Box>
            <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", pl: 2, pr: 2, pt: 1, pb: 1, mt: 2 }}>
                <Box sx={{ padding: "0.7rem", fontSize: "1rem", fontWeight: "bold" }}>
                    Add/Edit Transport Details
                </Box>
                <Divider />

                <Stack direction={"row"} alignItems={"center"} mt={1} gap={2}>
                    <Select  placeholder="Pickup Point"
                        startDecorator={<PlaceIcon />}>
                        {transportLocations.map((location) => (
                            <Option key={location.locationId} value={location.locationId}>
                                {location.pickupPointName}
                            </Option>
                        ))}

                    </Select>
                    <Select  placeholder="Select Vehicle"
                        startDecorator={<DirectionsBusIcon />}>
                        {transportVehicle.map((vehicle) => (
                            <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                {vehicle.vehicleName}
                            </Option>
                        ))}
                    </Select>
                    <Button> Save/Edit</Button>
                </Stack>
            </Box>
        </>
    )
}

export default TransportTab