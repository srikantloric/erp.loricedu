import { Breadcrumbs, FormHelperText, FormLabel, Grid, MenuItem, styled, Typography } from "@mui/material";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { Form, Formik } from "formik";

import { Link } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";


//Custom UI Components
import Textfield from "../../components/FormsUi/Textfield"
import Select from "../../components/FormsUi/Select"
import DateTimePicker from "components/FormsUi/DateTimePicker";

import SelectCustom from "../../components/FormsUi/SelectCustom"

import * as Yup from "yup"
import { BLOOD_GROUPS, CASTES, RELIGIONS, SCHOOL_CLASSES, SCHOOL_GENDERS, SCHOOL_SECTIONS } from "config/schoolConfig";
import { useEffect, useState } from "react";
import { IconEdit } from "@tabler/icons-react";
import { TransportLocationType, TransportVehicleType } from "types/transport";
import TransportFeeField from "components/FormsUi/Textfield/TransportFeeField";
import MonthlyFeeField from "components/FormsUi/Textfield/MonthlyFeeField";

import { addstudent } from "store/reducers/studentSlice";
import { useDispatch } from "store";
import { enqueueSnackbar } from "notistack";
import LoadingButtonWrapper from "components/FormsUi/LoadingButton";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { Box } from "@mui/joy";



const SeperatorHeader = styled("div")(({ theme }) => (
    {
        margin: "15px 0",
        display: "inline-block",
        fontSize: "12px",
        fontWeight: 500,
        textTransform: "uppercase",
        color: "white"
        , background: theme.palette.primary.main,
        padding: 6,
        width: "100%"
    }
))
const iconStyle: React.CSSProperties = {
    cursor: "pointer",
    height: "38px",
    width: "30px",
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid rgb(255, 255, 255)",
    color: "#fff",
    backgroundColor: "var(--bs-primary)", // Bootstrap primary color
};

const FormValidationSchema = Yup.object().shape({
    student_name: Yup.string().required("required"),
    class: Yup.number().nullable().required("required"),
    section: Yup.string().nullable().required("required"),
    class_roll: Yup.number().nullable().required("required"),
    dob: Yup.date().nullable().required("required"),
    date_of_addmission: Yup.date().nullable().required("required"),
    gender: Yup.string().required("required"),
    blood_group: Yup.string().required("required"),
    religion: Yup.string().required("requird"),
    caste: Yup.string().optional(),
    aadhar_number: Yup.string().min(12, "Exactly 12 digit accepted").max(12,
        "Exactly 12 digit accepted"
    ),
    father_name: Yup.string().required("required"),
    father_occupation: Yup.string(),
    father_qualification: Yup.string().optional(),
    mother_name: Yup.string().required("required"),
    mother_occupation: Yup.string().optional(),
    mother_qualifiation: Yup.string().optional(),
    contact_number: Yup.string().required("required").min(10, "Enter 10 digit phone number").max(10, "Enter 10 digit phone number"),
    alternate_number: Yup.string().optional(),
    email: Yup.string().optional(),
    address: Yup.string().required("required"),
    city: Yup.string().required("required"),
    state: Yup.string().required("required"),
    postal_code: Yup.string().required("required").min(6, "Please enter 6 digit Postal Code").max(6, "Please enter 6 digit postal code"),
    transport_location: Yup.string().required("required"),
    transport_vehicle: Yup.string().optional(),
    monthly_fee: Yup.number().required("required"),
    computer_fee: Yup.number().optional(),
    transport_fee: Yup.number().optional(),
    admission_fee: Yup.number().optional()

})

function AddStudentNew() {

    //loading
    const [loading, setLoading] = useState(false);

    const [transportLocations, setTransportLocations] = useState<TransportLocationType[]>([]);
    const [transportVehicle, setTransportVehicle] = useState<TransportVehicleType[]>([]);

    //Fee Details Controller State
    const [isMonthlyFeeEditable, setIsMonthlyFeeEditable] = useState(true);
    const [isComputerFeeEditable, setIsComputerFeeEditable] = useState(true);
    const [isAdmissionFeeEditable, setIsAdmissionFeeEditable] = useState(true);
    const [isTransportationFeeEditable, setIsTransportationFeeEditable] = useState(true);
    const [defaultFee, setDefaultFee] = useState(null);

    //Get Firebase DB instance
    const { db } = useFirebase();

    const dispatch = useDispatch();



    const InitialFormState = {
        student_name: "",
        class: "",
        section: "",
        class_roll: "",
        dob: new Date(),
        date_of_addmission: new Date(),
        gender: "",
        blood_group: "",
        religion: "",
        caste: "",
        aadhar_number: "",
        father_name: "",
        father_occupation: "",
        father_qualification: "",
        mother_name: "",
        mother_occupation: "",
        mother_qualifiation: "",
        contact_number: "",
        alternate_number: "",
        email: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        transport_location: "",
        transport_vehicle: "",
        monthly_fee: 0,
        transport_fee: 0,
        computer_fee: 0,
        admission_fee: 0

    }

    useEffect(() => {
        const fetchTransportData = async () => {
            try {
                const transportRef = doc(db, "TRANSPORT", "transportLocations");
                const transportSnap = await getDoc(transportRef);

                if (transportSnap.exists()) {
                    const data = transportSnap.data();
                    if (data) {
                        setTransportLocations(data.locations as TransportLocationType[]);
                        setTransportVehicle(data.vehicles as TransportVehicleType[]);
                    } else {
                        console.log("No such document!");
                    }
                }
            } catch (error) {
                console.error("Error fetching transport data:", error);
            }
        };

        const fetchDefaultFees = async () => {
            try {
                const paymentRef = doc(db, "CONFIG", "PAYMENT_CONFIG");
                const paymentSnap = await getDoc(paymentRef);

                if (paymentSnap.exists()) {
                    setDefaultFee(paymentSnap.data()?.defaultMonthlyFee);
                }
            } catch (error) {
                console.error("Error fetching default fees:", error);
            }
        };

        fetchTransportData();
        fetchDefaultFees();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);




    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <div
                    style={{
                        backgroundColor: "var(--bs-gray-201)",
                        padding: "10px",
                        borderRadius: "5px",
                        margin: "0px 8px",
                    }}
                >
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link
                            to="/"
                            style={{
                                textDecoration: "none",
                                color: "#343a40",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <PersonAddIcon sx={{ mr: 0.3 }} fontSize="inherit" />
                            Faculty
                        </Link>

                        <Typography
                            sx={{ display: "flex", alignItems: "center" }}
                            color="text.secondary"
                        >
                            {/* <GrainIcon sx={{ mr: 0.3 }} fontSize="inherit" /> */}
                            All Faculties
                        </Typography>
                    </Breadcrumbs>
                </div>
                <br />
                <Box
                    sx={{ padding: "10px 30px", margin: "0px 10px ", border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px" }}

                >
                    <div style={{ marginTop: "4px" }}>
                        <h3>Add Student Form</h3>
                    </div>
                    <Formik
                        initialValues={{ ...InitialFormState }}
                        validationSchema={FormValidationSchema}
                        onSubmit={(values, { resetForm }) => {
                            setLoading(true);
                            values.monthly_fee = Number(values.monthly_fee || 0);
                            values.transport_fee = Number(values.transport_fee || 0);
                            values.computer_fee = Number(values.computer_fee || 0);
                            values.admission_fee = Number(values.admission_fee || 0);
                            console.log("called..")
                            dispatch(
                                // @ts-ignore
                                addstudent({ studentData: values })
                            ).unwrap()
                                .then((d) => {
                                    enqueueSnackbar("Successfully Registered", { variant: "success" });
                                    setLoading(false);
                                    resetForm();
                                })
                                .catch((e) => {
                                    console.log({ "dispatch error": e });
                                    enqueueSnackbar(e, { variant: "error" });
                                    setLoading(false);
                                });
                        }}
                    >
                        {({ values, setFieldValue }) => (
                            <Form>
                                <SeperatorHeader>Personal Details</SeperatorHeader>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            name="student_name"
                                            label="Student Name"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Select
                                            name="class"
                                            options={SCHOOL_CLASSES}
                                            label="Class"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Select
                                            name="section"
                                            label="Section"
                                            options={SCHOOL_SECTIONS}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Class Roll"
                                            name="class_roll"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <DateTimePicker
                                            name="dob"
                                            label="DOB"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <DateTimePicker
                                            name="date_of_addmission"
                                            label="Admission Date"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Select
                                            name="gender"
                                            label="Gender"
                                            options={SCHOOL_GENDERS}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Select
                                            name="blood_group"
                                            label="Blood Group"
                                            options={BLOOD_GROUPS}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Select
                                            name="religion"
                                            label="Religion"
                                            options={RELIGIONS}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Select
                                            name="caste"
                                            label="Caste"
                                            options={CASTES}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Aadhar Number"
                                            name="aadhar_number"
                                        />
                                    </Grid>
                                </Grid>
                                {/* Family Details */}
                                <br />
                                <br />
                                <SeperatorHeader>Family Details</SeperatorHeader>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Father Name"
                                            name="father_name"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Father Occupation"
                                            name="father_occupation"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Father Qualification"
                                            name="father_qualification"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Mother Name"
                                            name="mother_name"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Mother Occupation"
                                            name="mother_occupation"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Mother Qualification"
                                            name="mother_qualification"
                                        />
                                    </Grid>
                                </Grid>
                                {/* Correspondance */}
                                <br />
                                <br />
                                <SeperatorHeader>Contact Details</SeperatorHeader>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Contact Number"
                                            name="contact_number"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Textfield
                                            label="Alternate Number"
                                            name="alternate_number"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12}>
                                        <Textfield
                                            label="Email Id"
                                            name="email"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={12}>
                                        <Textfield
                                            label="Address Full"
                                            name="address"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="City"
                                            name="city"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="State"
                                            name="state"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Textfield
                                            label="Postal Code"
                                            name="postal_code"
                                        />
                                    </Grid>
                                </Grid>
                                <br />
                                <br />
                                <SeperatorHeader>Transport</SeperatorHeader>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <SelectCustom
                                            name="transport_location"
                                            label="Transport Pick Up Location"
                                        >
                                            {
                                                transportLocations && transportLocations.map((item, pos) => {
                                                    return (
                                                        <MenuItem key={pos} value={item.locationId}>{item.pickupPointName}</MenuItem>
                                                    )
                                                })
                                            }
                                        </SelectCustom>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <SelectCustom
                                            name="transport_vehicle"
                                            label="Transport Vehicle"
                                        >
                                            {
                                                transportVehicle && transportVehicle.map((item, pos) => {
                                                    return (
                                                        <MenuItem key={pos} value={item.vehicleId}>{item.vehicleName}</MenuItem>
                                                    )
                                                })
                                            }
                                        </SelectCustom>

                                    </Grid>
                                </Grid>
                                <br />
                                <SeperatorHeader>Fee Details</SeperatorHeader>

                                <Grid
                                    container
                                    spacing={2}
                                    sx={{ display: "flex", alignItems: "center" }}
                                >
                                    <Grid item xs={12} md={4}>
                                        <FormLabel>Monthly/Computer/Transportation Fee</FormLabel>
                                        <FormHelperText sx={{ mt: 0 }}>
                                            Adjust fee or use default.
                                        </FormHelperText>

                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        md={2}
                                        sx={{ display: "flex", alignItems: "center", gap: "2px" }}
                                    >
                                        {defaultFee &&
                                            (
                                                <>
                                                    <MonthlyFeeField
                                                        defaultFee={defaultFee}
                                                        disabled={isMonthlyFeeEditable}
                                                        type="number"
                                                    />

                                                    <IconEdit
                                                        stroke={2}
                                                        style={iconStyle}
                                                        onClick={() => setIsMonthlyFeeEditable(!isMonthlyFeeEditable)}
                                                    />
                                                </>
                                            )
                                        }
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        md={2}
                                        sx={{ display: "flex", alignItems: "center", gap: "2px" }}
                                    >
                                        <Textfield
                                            label="Computer Fee"
                                            name="computer_fee"
                                            disabled={isComputerFeeEditable}
                                        />
                                        <IconEdit
                                            stroke={2}
                                            style={iconStyle}
                                            onClick={() =>
                                                setIsComputerFeeEditable(!isComputerFeeEditable)
                                            }
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        md={2}
                                        sx={{ display: "flex", alignItems: "center", gap: "2px" }}
                                    >
                                        <TransportFeeField
                                            transportLocations={transportLocations}
                                            disabled={isTransportationFeeEditable}
                                            type="number"
                                        />
                                        <IconEdit
                                            stroke={2}
                                            style={iconStyle}
                                            onClick={() =>
                                                setIsTransportationFeeEditable(!isTransportationFeeEditable)
                                            }
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        md={2}
                                        sx={{ display: "flex", alignItems: "center", gap: "2px" }}
                                    >
                                        <Textfield
                                            label="Admission Fee"
                                            name="admission_fee"
                                            type="number"
                                            disabled={isAdmissionFeeEditable}
                                        />
                                        <IconEdit
                                            stroke={2}
                                            style={iconStyle}
                                            onClick={() =>
                                                setIsAdmissionFeeEditable(!isAdmissionFeeEditable)
                                            }
                                        />
                                    </Grid>
                                </Grid>
                                <br />
                                <br />
                                <Grid container sx={{ display: "flex", justifyContent: "end" }} spacing={2}>
                                    <Grid
                                        item
                                    >
                                        <LoadingButtonWrapper variant="solid" color="danger" >
                                            Reset
                                        </LoadingButtonWrapper>
                                    </Grid>
                                    <Grid
                                        item
                                    >
                                        <LoadingButtonWrapper variant="solid" loading={loading} color="primary" >
                                            Submit
                                        </LoadingButtonWrapper>
                                    </Grid>
                                </Grid>
                                <br />
                                <br />
                            </Form>
                        )}
                    </Formik>
                </Box>
            </LSPage>
        </PageContainer>
    )
}

export default AddStudentNew