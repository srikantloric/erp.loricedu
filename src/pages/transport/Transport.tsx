import MaterialTable from "@material-table/core"
import { Add, Edit } from "@mui/icons-material"
import { Button, Sheet, Stack } from "@mui/joy"
import { IconBus } from "@tabler/icons-react"
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { db } from "../../firebase"
import { useEffect, useState } from "react"
import AddPickupPointModal from "components/Modals/transport/AddPickupPointModal"
import EditPickupPointModal from "components/Modals/transport/EditPickupPointModal"
import { doc, getDoc } from "firebase/firestore"

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

    const handleAddPickupPointModalClose = () => {
        setOpen(false)
        setSelectedLocation(null)
    }

    const fetchTransportData = async () => {
        try {
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
            } else {
              setTransportData([]);
              console.log("No locations found!");
            }
          } else {
            setTransportData([]);
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching transport data:", error);
        }
      };
    useEffect(() => {
        fetchTransportData();
    }, [])
    const columnMat = [
        { title: "S.No", field: "serialNo" },
        { title: "Pickup Point Name", field: "pickupPointName" },
        { title: "Distance", field: "distance" },
        {
            title: "Monthly Charge", field: "monthlyCharge", render: (rowData: TransportData) => {
                return <p>Rs.{rowData.monthlyCharge}/pm</p>;
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
                <Sheet variant="outlined">
                    <MaterialTable
                        style={{ display: "grid" }}
                        columns={columnMat}
                        data={transportData}
                        title="Transport Pickup Points List"
                        options={{
                            // grouping: true,
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
                </Sheet>
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