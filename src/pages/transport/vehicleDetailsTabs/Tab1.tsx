import MaterialTable from "@material-table/core";
import { Add, Edit } from "@mui/icons-material";
import { Box, Button, Chip, IconButton, LinearProgress, Sheet, Stack, Typography } from "@mui/joy";
import AddVehicleModal from "components/Modals/transport/AddVehicleModal";
import { useCallback, useEffect, useState } from "react";
import EditVehicleDetail from "components/Modals/transport/EditVehicleDetail";
import { TransportVehicleType } from "types/transport";
import { collection, doc, getCountFromServer, getDoc, query, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { enqueueSnackbar } from "notistack";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from "react-router-dom";
import { ExportCsv, ExportPdf } from "@material-table/exporters";

function Tab1() {
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [transportVehicles, setTransportVehicles] = useState<TransportVehicleType[]>([]);
  const [selectedVechile, setSelectedVehicle] = useState<TransportVehicleType | null>(null)
  const [loading, setLoading] = useState<boolean>(false);
  //Get Firebase DB instance
  const { db } = useFirebase();
  const navigate = useNavigate();

  const handleAddVehicleModalClose = () => {
    setIsAddVehicleModalOpen(false);
  };

  const columnMat = [
    {
      title: "S.No",
      field: "serialNo",
      render: (rowData: any) => rowData.tableData.id + 1,
      cellStyle: { width: 60, maxWidth: 60 },
      headerStyle: { width: 60, maxWidth: 60 }
    },
    { title: "ID", field: "vehicleId", },
    { title: "Name", field: "vehicleName" },
    { title: "Vehicle Number", field: "registrationNumber" },
    { title: "Vehicle Contact", field: "vehicleContact" },
    { title: "Driver", field: "driverName" },
    { title: "Conductor", field: "conductorName" },
    { title: "Total Seat", field: "totalSeat" },
    {
      title: "Student Allocated", field: "studentsAllocated", render: (rowData: TransportVehicleType) => {
        return (

          <Chip variant="soft" color="primary" sx={{ pr: 2, pl: 2 }}>
            <Stack direction={"row"} spacing={0.5} sx={{ alignItems: "center", justifyContent: "center" }}>
              <Typography level="title-lg">
                {rowData.studentsAllocated}
              </Typography>
              {rowData.studentsAllocated! > 0 &&
                <IconButton onClick={() => navigate(`allocated-students/${rowData.vehicleId}`)}>
                  <VisibilityIcon />
                </IconButton>
              }
            </Stack>
          </Chip>
        );
      },
    },
    {
      title: "Available Seat",
      field: "seatsAvailable",
      render: (rowData: TransportVehicleType) => {
        return (
          <Chip variant="soft" color="success" sx={{ pr: 2, pl: 2, }}><b>{rowData.seatsAvailable}</b></Chip>
        )
      }
    },
  ];

  const fetchVehicleData = useCallback(async () => {
    try {
      setLoading(true);
      setTransportVehicles([]);
      const transportRef = doc(db, "TRANSPORT", "transportLocations");
      const transportSnap = await getDoc(transportRef);

      if (transportSnap.exists()) {
        const data = transportSnap.data();
        if (!data.vehicles) {
          console.log("No vehicle found!")
          setLoading(false);
          return
        }

        const transportVehicles = data.vehicles as any[]

        const updatedVehicles = await Promise.all(
          transportVehicles.map(async (vehicle) => {
            const q = query(collection(db, "STUDENTS"), where("transport_vehicle", "==", vehicle.vehicleId));
            const snapshot = await getCountFromServer(q);
            const count = snapshot.data().count;

            return {
              ...vehicle,
              studentsAllocated: count,
              seatsAvailable: vehicle.totalSeat - count,
            };
          })
        );

        setTransportVehicles(updatedVehicles || []);
        setLoading(false)
      } else {
        setTransportVehicles([]);
        setLoading(false)
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      enqueueSnackbar("Error while fetching vehicle data!", { variant: "error" })
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]);

  return (
    <>
      <Sheet sx={{ display: "flex", justifyContent: "end" }}>
        <Button
          variant="solid"
          color="primary"
          startDecorator={<Add />}
          onClick={() => setIsAddVehicleModalOpen(true)}
        >
          Add Vehicle
        </Button>
      </Sheet>

      {loading &&
        <LinearProgress sx={{ mt: 2 }} />
      }
      <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "2px", mt: 1 }}>
        <MaterialTable
          style={{
            display: "grid", overflow: "hidden", boxShadow: "none"
          }}
          columns={columnMat}
          data={transportVehicles}
          title={`Vehicle List (${transportVehicles.length})`}
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
                  ExportPdf(cols, data, `Vehicle List (${transportVehicles.length}) - ${currentDate}`);
                }
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, data) => {
                  const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                  ExportCsv(cols, data, `Vehicle List (${transportVehicles.length}) - ${currentDate}`);
                }
              }
            ]
          }}
          actions={[
            {
              icon: () => <Edit sx={{ color: "var(--bs-primary)" }} />,
              tooltip: "Edit Row",
              onClick: (event, rowData) => {
                setSelectedVehicle(rowData as TransportVehicleType);
                setIsAddVehicleModalOpen(true)
              },
            },
          ]}
        />
      </Box>
      <AddVehicleModal
        open={isAddVehicleModalOpen}
        onClose={handleAddVehicleModalClose}
        fetchVehicleData={fetchVehicleData}
      />
      {selectedVechile &&
        <EditVehicleDetail open={isAddVehicleModalOpen}
          onClose={handleAddVehicleModalClose}
          selectedVehicle={selectedVechile}
          fetchVehicleData={fetchVehicleData}
          vehicleData={transportVehicles}
        />
      }
    </>
  );
}

export default Tab1;
