import MaterialTable from "@material-table/core"
import { Add, Edit } from "@mui/icons-material"
import { Box, Button, Chip, LinearProgress, Stack, Typography } from "@mui/joy"
import { IconBus } from "@tabler/icons-react"
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { useCallback, useEffect, useState } from "react"
import AddPickupPointModal from "components/Modals/transport/AddPickupPointModal"
import EditPickupPointModal from "components/Modals/transport/EditPickupPointModal"
import { doc, getDoc } from "firebase/firestore"
import { useFirebase } from "context/firebaseContext"

type SerialNumber = {
    serialNo?: number
}


type TransportData = SerialNumber & {
    locationId?: string,
    pickupPointName: string,
    distance: string,
    monthlyCharge: string
}

function Transport() {

    const [transportData, setTransportData] = useState<TransportData[]>([])
    const [open, setOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<TransportData | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    //Get Firebase DB instance
    const { db } = useFirebase();

    const handleAddPickupPointModalClose = () => {
        setOpen(false)
        setSelectedLocation(null)
    }

    const fetchTransportData = useCallback(async () => {
        try {
            setLoading(true)
            const transportRef = doc(db, "TRANSPORT", "transportLocations");
            const transportSnap = await getDoc(transportRef);

            if (transportSnap.exists()) {
                const data = transportSnap.data();
                if (data?.locations) {
                    const locationsWithSerialNo = data.locations.map(
                        (location: TransportData, index: number) => ({
                            ...location,
                            serialNo: index + 1,
                        })
                    );

                    setTransportData(locationsWithSerialNo);
                    setLoading(false)
                } else {
                    setTransportData([]);
                    setLoading(false)
                    console.log("No locations found!");
                }
            } else {
                setTransportData([]);
                setLoading(false)
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error fetching transport data:", error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchTransportData();
    }, [fetchTransportData])


    const columnMat = [
        { title: "S.No", field: "serialNo" },
        { title: "Pickup Point Name", field: "pickupPointName" },
        { title: "Distance", field: "distance" },
        {
            title: "Monthly Charge", field: "monthlyCharge", render: (rowData: TransportData) => {
                return <Chip sx={{ pl: 2, pr: 2, }} variant="soft" color="success" ><Typography level="title-lg">₹{rowData.monthlyCharge}/pm</Typography></Chip>;
            },
        }
    ]

    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <BreadCrumbsV2
                    Icon={IconBus}
                    Path="Transport Management/Transport"
                />
                <br />
                <br />
                <Stack direction="row" justifyContent="end">
                    <Button
                        startDecorator={<Add />}
                        color="primary"
                        onClick={() => setOpen(true)}
                    >
                        Add Pickup Point
                    </Button>
                </Stack>
                <br />
                {loading &&
                    <LinearProgress sx={{ mb: 1, mt: 1 }} />
                }
                <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "2px", }}>
                    <MaterialTable
                        style={{ display: "grid", overflow: "hidden", border: "none", boxShadow: "none", }}
                        columns={columnMat}
                        data={transportData}
                        title={`Transport Pickup Points List (${transportData.length})`}
                        options={{
                            padding: 'dense',
                            headerStyle: {
                                backgroundColor: "#5d87ff",
                                color: "#FFF",
                                paddingLeft: "1rem",
                                paddingRight: "1rem",
                            },
                            actionsColumnIndex: -1,
                        }}
                        actions={[
                            {
                                icon: () => <Edit sx={{ color: "var(--bs-primary)" }} />,
                                tooltip: "Edit Row",
                                onClick: (event, rowData) => {

                                    setSelectedLocation(rowData as TransportData);
                                    setOpen(true);
                                },
                            },
                        ]}
                    />
                </Box>
            </LSPage>
            <AddPickupPointModal
                open={open}
                onClose={handleAddPickupPointModalClose}
                fetchTransportData={fetchTransportData}
            />
            {selectedLocation &&
                <EditPickupPointModal
                    locationData={transportData}
                    selectedLocation={selectedLocation}
                    open={open}
                    onClose={handleAddPickupPointModalClose}
                    fetchTransportData={fetchTransportData}
                />
            }
        </PageContainer>
    )
}

export default Transport