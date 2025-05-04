import MaterialTable from "@material-table/core"
import { Add, Edit } from "@mui/icons-material"
import { Box, Button, Chip, IconButton, LinearProgress, Stack, Typography } from "@mui/joy"
import { IconBus } from "@tabler/icons-react"
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { useCallback, useEffect, useState } from "react"
import AddPickupPointModal from "components/Modals/transport/AddPickupPointModal"
import EditPickupPointModal from "components/Modals/transport/EditPickupPointModal"
import { collection, doc, getCountFromServer, getDoc, query, where } from "firebase/firestore"
import { useFirebase } from "context/firebaseContext"
import { ExportCsv, ExportPdf } from "@material-table/exporters"
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from "react-router-dom"
import { TransportLocationType } from "types/transport"


function Transport() {

    const [transportData, setTransportData] = useState<TransportLocationType[]>([])
    const [open, setOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<TransportLocationType | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    //Get Firebase DB instance
    const { db } = useFirebase();
    const navigate = useNavigate()

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
                    const transportLocations = data.locations as any[]

                    const updatedTransports = await Promise.all(
                        transportLocations.map(async (vehicle) => {
                            const q = query(collection(db, "STUDENTS"), where("transport_location", "==", vehicle.locationId));
                            const snapshot = await getCountFromServer(q);
                            const count = snapshot.data().count;

                            return {
                                ...vehicle,
                                studentsAllocated: count,
                            };
                        })
                    );

                    setTransportData(updatedTransports);
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
        {
            title: "S.No",
            field: "serialNo",
            render: (rowData: any) => rowData.tableData.id + 1,
            cellStyle: { width: 60, maxWidth: 60 },
            headerStyle: { width: 60, maxWidth: 60 }
        },
        {
            title: "Id",
            field: "locationId",
        },
        { title: "Pickup Point Name", field: "pickupPointName" },
        {
            title: "Student Allocated", field: "studentsAllocated", render: (rowData: TransportLocationType) => {
                return (

                    <Chip variant="soft" color="primary" sx={{ pr: 2, pl: 2 }}>
                        <Stack direction={"row"} spacing={0.5} sx={{ alignItems: "center", justifyContent: "center" }}>
                            <Typography level="title-lg">
                                {rowData.studentsAllocated}
                            </Typography>
                            {rowData.studentsAllocated! > 0 &&
                                <IconButton onClick={() => navigate(`allocated-students/${rowData.locationId}`)}>
                                    <VisibilityIcon />
                                </IconButton>
                            }
                        </Stack>
                    </Chip>
                );
            },
        },
        {
            title: "Distance", field: "distance", render: (rowData: TransportLocationType) => {
                return <Chip sx={{ pl: 2, pr: 2, }} variant="soft" color="warning" ><Typography level="title-lg">{rowData.distance} km</Typography></Chip>;
            }
        },
        {
            title: "Monthly Charge", field: "monthlyCharge", render: (rowData: TransportLocationType) => {
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
                            exportAllData: true,
                            exportMenu: [
                                {
                                    label: 'Export PDF',
                                    exportFunc: (cols, data) => {
                                        const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                                        ExportPdf(cols, data, `Transport Locations (${transportData.length}) - ${currentDate}`);
                                    }
                                },
                                {
                                    label: 'Export CSV',
                                    exportFunc: (cols, data) => {
                                        const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                                        ExportCsv(cols, data, `Transport Locations (${transportData.length}) - ${currentDate}`);
                                    }
                                }
                            ]
                        }}
                        actions={[
                            {
                                icon: () => <Edit sx={{ color: "var(--bs-primary)" }} />,
                                tooltip: "Edit Row",
                                onClick: (event, rowData) => {
                                    setSelectedLocation(rowData as TransportLocationType);
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