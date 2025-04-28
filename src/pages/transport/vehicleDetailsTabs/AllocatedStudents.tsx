import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { StudentDetailsType } from "types/student";
import { useFirebase } from "context/firebaseContext";
import { enqueueSnackbar } from "notistack";
import { Avatar, Box, LinearProgress } from "@mui/joy";
import MaterialTable from "@material-table/core";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import { TransportVehicleType } from "types/transport";

const classLookup = {
    1: "Nursery",
    2: "LKG",
    3: "UKG",
    4: "STD-1",
    5: "STD-2",
    6: "STD-3",
    7: "STD-4",
    8: "STD-5",
    9: "STD-6",
    10: "STD-7",
    11: "STD-8",
    12: "STD-9",
    13: "STD-10",
    14: "Pre-Nursery",
};


function AllocatedStudents() {
    const { vehicleId } = useParams();
    const [vehicleDetails, setVehicleDetails] = useState<TransportVehicleType | null>(null)
    const [students, setStudents] = useState<StudentDetailsType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    //Get Firebase DB instance
    const { db } = useFirebase();

    //fetch vehicle using vehicleId
    useEffect(() => {
        if (!vehicleId) {
            enqueueSnackbar("No vehicle ID provided", { variant: "error" });
        }
        const fetchVehicleDetails = async () => {
            setLoading(true);
            try {
                const transportRef = doc(db, "TRANSPORT", "transportLocations");
                const transportSnap = await getDoc(transportRef);

                if (transportSnap.exists()) {
                    const data = transportSnap.data();
                    if (!data.vehicles) {
                        console.log("No vehicle found!")
                        setLoading(false);
                        return
                    }
                    const vehicles = data.vehicles as TransportVehicleType[];
                    const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
                    if (vehicle) {
                        setVehicleDetails(vehicle);
                        setLoading(false);
                    } else {
                        enqueueSnackbar("Vehicle not found", { variant: "error" });
                        setLoading(false);
                    }
                }

            } catch (error) {
                setLoading(false);
                enqueueSnackbar("Error fetching vehicle details", { variant: "error" });
                console.error("Error fetching vehicle details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicleDetails();
    }, [vehicleId]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (vehicleId) {
                setLoading(true);
                try {
                    const studentsRef = collection(db, "STUDENTS");
                    const q = query(studentsRef, where("transport_vehicle", "==", vehicleId));
                    const querySnapshot = await getDocs(q);
                    const studentsData = querySnapshot.docs.map(doc => ({ ...doc.data() }));
                    setStudents(studentsData as StudentDetailsType[]);
                    setLoading(false);
                }
                catch (error) {
                    enqueueSnackbar("Error fetching students", { variant: "error" });
                    console.error("Error fetching students:", error);
                    setLoading(false);
                }

            }
        };

        fetchStudents();
    }, [vehicleId, db]);

    const columnMat = [
        {
            field: "admission_no",
            title: "ID",
            render: (rowData: StudentDetailsType) => {
                return (
                    <Link
                        to={`/students/profile/${rowData.id}`}
                        style={{
                            fontSize: "14px",
                            textDecoration: "none",
                            fontWeight: "500",
                            color: "var(--bs-primary-text)",
                        }}
                    >
                        {rowData.admission_no}
                    </Link>
                );
            },
        },
        {
            title: "Profile",
            field: "profil_url",

            export: false,
            render: (rowData: StudentDetailsType) => {

                return <Avatar src={rowData.profil_url} alt="profile-student" />;
            },
        },

        { field: "student_name", title: "Name" },
        {
            field: "class",
            title: "Class",
            lookup: classLookup,
            render: (rowData: StudentDetailsType) => {
                const className = classLookup[rowData.class as keyof typeof classLookup] || "Class unknown";
                return <p>{className}</p>;
            },
        },
        { field: "section", title: "Section" },
        { field: "class_roll", title: "Roll" },
        { field: "father_name", title: "Father Name" },
        { field: "contact_number", title: " Contact number" },
    ];


    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <PageHeaderWithHelpButton title="Allocated Students" />

                {loading &&
                    <LinearProgress sx={{ mt: 2 }} />
                }
                <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "2px", mt: 1 }}>
                    <MaterialTable
                        style={{
                            display: "grid", overflow: "hidden", boxShadow: "none"
                        }}
                        columns={columnMat}
                        data={students}
                        title={`Details of students allocated to the ${vehicleDetails?.vehicleName} (${students.length})`}
                        options={{
                            padding: 'dense',

                            headerStyle: {
                                backgroundColor: "#5d87ff",
                                color: "#FFF",
                                paddingLeft: "1rem",
                                paddingRight: "1rem",
                            },
                            actionsColumnIndex: -1,
                            exportMenu: [
                                {
                                    label: 'Export PDF',
                                    exportFunc: (cols, data) => {
                                        ExportPdf(cols, data, `Students Allocated to ${vehicleDetails?.vehicleName} (${students.length})`);
                                    }
                                },
                                {
                                    label: 'Export CSV',
                                    exportFunc: (cols, data) => {
                                        ExportCsv(cols, data, `Students Allocated to ${vehicleDetails?.vehicleName} (${students.length})`);
                                    }
                                }
                            ]
                        }}

                    />
                </Box>
            </LSPage>
        </PageContainer>
    )
}

export default AllocatedStudents