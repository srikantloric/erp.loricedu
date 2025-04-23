import { Box, Button, Chip, Divider, FormControl, FormHelperText, FormLabel, Option, Select, Stack, Switch, Typography } from '@mui/joy';
import React, { useEffect, useState } from 'react'
import { StudentDetailsType } from 'types/student';
import BusIcon from "assets/bus-stop-icon.png"
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PlaceIcon from '@mui/icons-material/Place';
import { doc, getDoc } from 'firebase/firestore';
import { TransportLocationType, TransportVehicleType } from 'types/transport';
import { useFirebase } from 'context/firebaseContext';
import { enqueueSnackbar } from 'notistack';
import { updateDoc, } from 'firebase/firestore';
interface StudentProfileProps {
    studentData: StudentDetailsType;
}



const TransportTab: React.FC<StudentProfileProps> = ({ studentData }) => {

    const [transportLocations, setTransportLocations] = React.useState<TransportLocationType[]>([]);
    const [transportVehicle, setTransportVehicle] = React.useState<TransportVehicleType[]>([]);
    const [checked, setChecked] = React.useState(false);
    const [transportLocationId, setTransportLocationId] = useState<string>("");
    const [transportVehicleId, setTransportVehicleId] = useState<string>("");
    const [studentTransportDetails, setStudentTransportDetails] = useState<TransportLocationType & TransportVehicleType | null>(null);
    //Get Firebase DB instance
    const { db } = useFirebase();


    const fetchStudentTransportDetails = async () => {
        try {
            const transportLocationDoc = await getDoc(doc(db, "TRANSPORT", "transportLocations"));
            if (transportLocationDoc.exists()) {
                const { locations, vehicles } = transportLocationDoc.data() || {};
                const location = locations?.find((loc: TransportLocationType) => loc.locationId === transportLocationId);
                const vehicle = vehicles?.find((veh: TransportVehicleType) => veh.vehicleId === transportVehicleId);

                if (location && vehicle) {
                    setStudentTransportDetails({ ...location, ...vehicle });
                }
            } else {
                console.log("No transport details found!");
            }
        } catch (error) {
            console.error("Error fetching student transport details:", error);
        }
    };

    useEffect(() => {

        if (!studentData) {
            enqueueSnackbar("Unable to load student data!", { variant: "error" });
            return;
        }

        //fetch transport data from firestore
        const transportLocationId = studentData.transport_location || "";
        const transportVehicleId = studentData.transport_vehicle || "";
        setTransportLocationId(transportLocationId);
        setTransportVehicleId(transportVehicleId);


        fetchStudentTransportDetails();

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

    const handleSave = async () => {
        // Handle save logic here
        console.log(transportLocationId, transportVehicleId);
        if (!transportLocationId || !transportVehicleId) {
            enqueueSnackbar("Please select both pickup point and vehicle!", { variant: "error" });
            return;
        }

        const transportFee = transportLocations.find((location) => location.locationId === transportLocationId)?.monthlyCharge || 0;

        const studentDocRef = doc(db, "STUDENTS", studentData.id);
        const transportation_fee = checked ? transportFee : 0;
        try {
            await updateDoc(studentDocRef, {
                transport_location: transportLocationId,
                transport_vehicle: transportVehicleId,
                transportation_fee: Number(transportation_fee),
            });

            console.log("Student transport details updated successfully!");
            fetchStudentTransportDetails();
            enqueueSnackbar("Transport details saved successfully!", { variant: "success" });

        } catch (error) {
            console.error("Error updating student transport details:", error);
            enqueueSnackbar("Failed to save transport details!", { variant: "error" });
        }
    };

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        if (!studentData || !studentTransportDetails) {
            enqueueSnackbar("Unable to load student data!", { variant: "error" });
            return;

        }
        // Update the transportation fee in Firestore based on the switch state
        const studentDocRef = doc(db, "STUDENTS", studentData.id);
        updateDoc(studentDocRef, {
            transportation_fee: event.target.checked ? Number(studentTransportDetails.monthlyCharge) : 0,
        })
            .then(() => {
                console.log("Student transport status updated successfully!");
                enqueueSnackbar("Transport status updated successfully!", { variant: "success" });
            })
            .catch((error) => {
                console.error("Error updating student transport status:", error);
                enqueueSnackbar("Failed to update transport status!", { variant: "error" });
            });
    };

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
                            onChange={handleSwitchChange}
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
                        <Box sx={{ width: "100%" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>Pickup Point</td>
                                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.pickupPointName || "N/A"}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>Distance From School</td>
                                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.distance || "N/A"}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>Transport Fee</td>
                                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{"₹" + studentTransportDetails?.monthlyCharge || "N/A"}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "bold" }}>Vehicle</td>
                                        <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.vehicleName || "N/A"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </Box>
                    </Stack>
                    <Stack mr={2}>
                        <Chip variant="solid" color={checked ? "success" : "danger"}><Typography level="title-lg" sx={{ fontSize: "18px", color: "white", p: 1 }}>{checked ? "Transport Yes" : "No Transport"}</Typography></Chip>
                    </Stack>
                </Stack>
            </Box>
            <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", pl: 2, pr: 2, pt: 1, pb: 1, mt: 2 }}>
                <Box sx={{ padding: "0.7rem", fontSize: "1rem", fontWeight: "bold" }}>
                    Vehicle Details
                </Box>
                <Divider />
                <Box sx={{ overflowX: "auto", mt: 2 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Vehicle ID</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.vehicleId || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Vehicle Name</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.vehicleName || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Driver Name</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.driverName || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Driver Contact</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.vehicleContact || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Conductor Name</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.conductorName || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Registration Number</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.registrationNumber || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Total Seats</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.totalSeat || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>License Date</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.licenseDate || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>RC Date</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.rcDate || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Insurance Date</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.insuranceDate || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Pollution Date</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.pollutionDate || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Students Allocated</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.studentsAllocated || "N/A"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>Seats Available</td>
                                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{studentTransportDetails?.seatsAvailable || "N/A"}</td>
                            </tr>
                        </tbody>
                    </table>
                </Box>
            </Box>
            <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", pl: 2, pr: 2, pt: 1, pb: 1, mt: 2 }}>
                <Box sx={{ padding: "0.7rem", fontSize: "1rem", fontWeight: "bold" }}>
                    Add/Edit Transport Details
                </Box>
                <Divider />

                <Stack direction={"row"} alignItems={"center"} mt={1} gap={2}>
                    <Select placeholder="Pickup Point"
                        onChange={(e, val) => setTransportLocationId(val!)}
                        value={transportLocationId}
                        startDecorator={<PlaceIcon />}>
                        {transportLocations.map((location) => (
                            <Option key={location.locationId} value={location.locationId}>
                                {location.pickupPointName}
                            </Option>
                        ))}

                    </Select>
                    <Select placeholder="Select Vehicle"
                        onChange={(e, val) => setTransportVehicleId(val!)}
                        value={transportVehicleId}
                        startDecorator={<DirectionsBusIcon />}>
                        {transportVehicle.map((vehicle) => (
                            <Option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                {vehicle.vehicleName}
                            </Option>
                        ))}
                    </Select>
                    <Button onClick={handleSave}> Save/Edit</Button>
                </Stack>
            </Box>
        </>
    )
}

export default TransportTab