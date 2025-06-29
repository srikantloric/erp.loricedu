import { InfoOutlined, Pageview, Restore } from "@mui/icons-material"
import { Box, Button, Checkbox, Chip, Divider, FormControl, FormLabel, Input, Option, Select, Stack, Typography } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import MonthCard from "components/Card/MonthCard"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { useEffect, useState } from "react"
import { FeeHeadType, InstallmentChallanType } from "types/payments/payments"
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useParams } from "react-router-dom"
import { StudentDetailsType } from "types/student"
import { enqueueSnackbar } from "notistack"
import { doc, getDoc, getDocs, Timestamp } from "firebase/firestore"
import { useFirebase } from "context/firebaseContext"
import StudentDetailsFeeHeader from "components/Headers/StudentDetailsFeeHeader"
import TransportIcon from "assets/bus-stop-icon.png"
import FeeHeadersTable from "components/FeeManager/FeeHeadersTable"
import { z as Z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircularProgress, FormHelperText } from "@mui/material"
import { numberToWords } from "utilities/UtilitiesFunctions"
import { TransportLocationType, TransportVehicleType } from "types/transport"
import { useNavbar } from "context/NavbarContext"
import { collection, addDoc } from "firebase/firestore";
import { arrayUnion, updateDoc } from "firebase/firestore";


// Use a schema that allows concessionTotal to be validated against the current calculated amountTotal
const schema = Z.object({
    lateFine: Z.number(),
    concessionTotal: Z.coerce.number().min(0, { message: "Must be non-negative" }).default(0),
    paidAmount: Z.coerce.number().min(0, { message: "Must be non-negative" }).default(0),
    amountTotal: Z.coerce.number().default(0),
    consessionReason: Z.string().optional(),
    payableAmount: Z.coerce.number(),
    miscTotal: Z.coerce.number(),
    posCharge: Z.coerce.number(),
    paymentMethod: Z.string(),
    printPDF: Z.boolean().default(true),
}).superRefine((data, ctx) => {
    if (data.concessionTotal > data.amountTotal) {
        ctx.addIssue({
            code: Z.ZodIssueCode.custom,
            path: ["concessionTotal"],
            message: "Concession cannot be more than total amount",
        });
    }
    if (data.paidAmount > data.payableAmount) {
        ctx.addIssue({
            code: Z.ZodIssueCode.custom,
            path: ["paidAmount"],
            message: "Paid amount cannot be more than payable amount",
        });
    }
});

type PayableFormFields = Z.infer<typeof schema>;

function NewFeeCollection() {

    const [studentDetails, setStudentDetails] = useState<StudentDetailsType | null>(null)
    const [feeHeaders, setFeeHeaders] = useState<FeeHeadType[]>([])
    const [finalHeaders, setFinalHeaders] = useState<FeeHeadType[]>([]);

    // const [amountTotal, setAmountTotal] = useState<number>(0);
    const [installmentTotal, setInstallmentTotal] = useState<number>(0);
    const [preDuesTotal, setPreDuesTotal] = useState<number>(0);
    const [currentDue, setCurrentDue] = useState<number>(0);

    //Transport
    const [studentTransportDetails, setStudentTransportDetails] = useState<TransportLocationType & TransportVehicleType | null>(null);
    //Loading
    const [loading, setLoading] = useState<boolean>(false);

    const [installments, setInstallments] = useState<InstallmentChallanType[]>([]);


    const {
        setValue,
        watch,
        register,
        handleSubmit,
        // reset,
        formState: { errors },
    } = useForm<PayableFormFields>({
        resolver: zodResolver(schema),
        mode: "onChange",       // Re-validate on each change
        reValidateMode: "onChange", // Optional, but reinforces re-validation on change
        defaultValues: {
            lateFine: 0,
            concessionTotal: 0,
            paidAmount: 0,
            consessionReason: "",
            payableAmount: 0,
            miscTotal: 0,
            posCharge: 0,
            paymentMethod: "",
            printPDF: true,

        }
    });


    //hooks
    const { db } = useFirebase()
    const { studentId } = useParams();
    const { session } = useNavbar();

    // Watch the form fields to get their current values
    const lateFine = watch("lateFine");
    const posCharge = watch("posCharge");
    const miscTotal = watch("miscTotal");
    const payableAmount = watch("payableAmount");
    const paidAmount = watch("paidAmount");
    const amountTotal = watch("amountTotal");
    const concessionTotal = Number(watch("concessionTotal") || 0);



    const fetchStudentDetails = async (studentId: string) => {
        // Fetch student details from the Firestore
        const docPath = doc(db, "STUDENTS", studentId);
        const studentData = await getDoc(docPath);
        setStudentDetails(studentData.data() as StudentDetailsType);
        return studentData.data() as StudentDetailsType;
    }

    const initAll = async () => {
        if (!studentId) {
            enqueueSnackbar("Student ID not found", { variant: "error" });
            return;
        }

        // Fetch student details
        const studentDetails = await fetchStudentDetails(studentId);

        //Fetch transport details
        fetchStudentTransportDetails(studentDetails.transport_location!, studentDetails.transport_vehicle!);

        // Setup Fee Headers based on installments

        const paidInstallments = studentDetails.paidInstallments

        // Helper to get month names
        const monthNames = [
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December", "January", "February", "March"
        ];

        // Extract session years
        let sessionStart = 0, sessionEnd = 0;
        if (session && typeof session === "string") {
            const [start, end] = session.split("-").map(Number);
            sessionStart = start;
            sessionEnd = end;
        }

        // Build installments array
        const generatedInstallments: InstallmentChallanType[] = monthNames.map((month, idx) => {
            // April (idx 0) to December (idx 8) are sessionStart, Jan/Feb/Mar are sessionEnd
            const year = idx < 9 ? sessionStart : sessionEnd;
            // Format month number as 2-digit
            const monthNum = (idx + 4) > 12 ? (idx - 8) : (idx + 4);
            const monthNumStr = monthNum.toString().padStart(2, "0");
            // ID format: INST_202526_04
            const id = `INST_${sessionStart}${sessionEnd}_${monthNumStr}`;
            // Check if paid

            const status = paidInstallments && paidInstallments.includes(id) ? "Paid" : "Pending";
            return {
                id: id, month: month, year: year.toString(), session: `${sessionStart}-${sessionEnd}`, status: status
            } as InstallmentChallanType;
        });
        setInstallments(generatedInstallments);

        // Calculate pre dues total
        const subColRef = collection(db, "STUDENTS", studentId, "FEE_COLLECTIONS");

        const feeCollectionSnap = await getDocs(subColRef);

        const initialFeeHeaders: FeeHeadType[] = [];

        feeCollectionSnap.forEach((doc) => {
            const data = doc.data()
            console.log("Fee Collection Data:", data,doc.id);
            if (data.dueAmount && data.dueAmount > 0) {
                setPreDuesTotal((prev) => prev + data.dueAmount);
                const headers = data.headers as FeeHeadType[];

                console.log("Headers Data:", headers);

                initialFeeHeaders.push(...headers.map((header: FeeHeadType) => ({
                    ...header,
                    previousDues: header.dueAmount,
                    amount: 0
                })));

            }
        }
        );

        setFeeHeaders(initialFeeHeaders);


    }

    //Main useEffect
    useEffect(() => {
        initAll();
    }, [session, studentId, db]);


    const handleInstallmentSelection = (selectedInstallment: any) => {
        const selectedIndex = installments.findIndex(
            (inst) => inst.id === selectedInstallment.id
        );
        const newInstallments = [...installments];

        if (selectedInstallment.status === "Pending") {
            // Select all previous months (including current) if not already selected
            for (let i = 0; i <= selectedIndex; i++) {
                if (newInstallments[i].status === "Pending") {
                    newInstallments[i].status = "Added";
                    setFeeHeaders((oldState) => {
                        const exists = oldState.some(
                            (header) => header.headerId === newInstallments[i].id
                        );
                        if (!exists) {
                            const dataHeader: FeeHeadType = {
                                headerId: newInstallments[i].id,
                                installment: newInstallments[i].month + " " + newInstallments[i].year,
                                headName: "Tution Fee",
                                amount: 250,
                                concessionAmount: 0,
                                dueAmount: 0,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            };
                            return [...oldState, dataHeader];
                        }
                        return oldState;
                    });
                }
            }
        } else if (selectedInstallment.status === "Added") {
            // Deselect current and all following months
            for (let i = selectedIndex; i < newInstallments.length; i++) {
                if (newInstallments[i].status === "Added") {
                    newInstallments[i].status = "Pending";
                }
            }
            setFeeHeaders((oldState) =>
                oldState.filter(
                    (header) => {
                        // Remove headers for deselected months
                        const monthIndex = installments.findIndex(inst => inst.id === header.headerId);
                        return monthIndex < selectedIndex;
                    }
                )
            );
        }
        setInstallments(newInstallments);
    }

    useEffect(() => {
        // Calculate totals based on selected installments and fees
        const totalInstallmentAmount: number = feeHeaders.reduce((sum, header) => sum + (header.amount || 0), 0);
        setInstallmentTotal(totalInstallmentAmount);

        const totalAmount = totalInstallmentAmount + preDuesTotal + posCharge + miscTotal + lateFine;

        setValue("amountTotal", totalAmount);
        const concessionAmount = watch("concessionTotal");
        setValue("payableAmount", totalAmount - concessionAmount);

        //set current due based on payable and paid amounts
        setCurrentDue(watch("payableAmount") - watch("paidAmount"));

    }, [installments, feeHeaders, watch("concessionTotal"), watch("paidAmount"), preDuesTotal, posCharge, miscTotal, lateFine, setValue]);


    useEffect(() => {
        setValue("paidAmount", payableAmount, {
            shouldValidate: true,
        });
    }, [payableAmount, setValue]);


    //fetch transport details

    const fetchStudentTransportDetails = async (trasportLocationId: string, transportVehicleId: string) => {
        try {
            setStudentTransportDetails(null);
            console.log("Fetching student transport details...");
            setLoading(true);
            const transportLocationDoc = await getDoc(doc(db, "TRANSPORT", "transportLocations"));
            if (transportLocationDoc.exists()) {
                const { locations, vehicles } = transportLocationDoc.data() || {};
                const location = locations?.find((loc: TransportLocationType) => loc.locationId === trasportLocationId);
                const vehicle = vehicles?.find((veh: TransportVehicleType) => veh.vehicleId === transportVehicleId);


                setStudentTransportDetails({ ...location, ...vehicle });


                setLoading(false);

            } else {
                setLoading(false);
                console.log("No transport details found!");
            }
        } catch (error) {
            setLoading(false);
            console.error("Error fetching student transport details:", error);
        }
    };




    const onSubmit = (data: PayableFormFields) => {

        if (!studentDetails) {
            enqueueSnackbar("Student details not found", { variant: "error" });
            return;
        }

        const saveFeeCollection = async () => {
            try {
                if (!studentId) {
                    enqueueSnackbar("Student ID missing", { variant: "error" });
                    return;
                }
                setLoading(true);

                const dueAmount = data.payableAmount - data.paidAmount;



                // Prepare the data to save
                const feeCollectionData = {
                    studentId,
                    amountTotal: data.amountTotal,
                    paidAmount: data.paidAmount,
                    payableAmount: data.payableAmount,
                    dueAmount: dueAmount,
                    concessionTotal: data.concessionTotal,
                    lateFine: data.lateFine,
                    posCharge: data.posCharge,
                    miscTotal: data.miscTotal,
                    consessionReason: data.consessionReason,
                    headers: finalHeaders,
                    paymentMethod: data.paymentMethod,
                    paymentStatus: dueAmount <= 0 ? "Paid" : "Pending",
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                };


                const subColRef = collection(db, "STUDENTS", studentId, "FEE_COLLECTIONS");
                await addDoc(subColRef, feeCollectionData);

                const studentRef = doc(db, "STUDENTS", studentId);

                // Update the student's paid installments
                await updateDoc(studentRef, {
                    paidInstallments: arrayUnion(...finalHeaders.map(h => h.headerId)),
                });

                enqueueSnackbar("Fee collection saved successfully!", { variant: "success" });

                setInstallments((prev) =>
                    prev.map(inst =>
                        finalHeaders.some(header => header.headerId === inst.id)
                            ? { ...inst, status: "Paid" }
                            : inst
                    )
                );

                resetFeeHeaders(finalHeaders)


            } catch (error) {
                enqueueSnackbar("Failed to save fee collection", { variant: "error" });
                console.error("Error saving fee collection:", error);
            } finally {
                setLoading(false);
            }
        };

        saveFeeCollection();

    }


    const resetFeeHeaders = (finalFeeHeaders?: FeeHeadType[]) => {
        // Reset all form fields to default values
        setValue("lateFine", 0);
        setValue("concessionTotal", 0);
        setValue("paidAmount", 0);
        setValue("consessionReason", "");
        setValue("payableAmount", 0);
        setValue("miscTotal", 0);
        setValue("posCharge", 0);
        setValue("paymentMethod", "");
        setValue("printPDF", true);
        // Reset all installments to Pending except Paid
        setInstallments((prev) => prev.map(inst => ({
            ...inst,
            status: inst.status === "Paid" ? "Paid" : "Pending"
        })));
        // Clear feeHeaders

        if (finalFeeHeaders) {
            const headsNew = finalFeeHeaders.filter(header => header.dueAmount && header.dueAmount > 0)
            console.log("Resetting Fee Headers:", headsNew);
            setFeeHeaders(headsNew);
        }


    }

    return (
        <>
            <PageContainer>
                <Navbar />
                <LSPage>
                    <PageHeaderWithHelpButton title="Students Fee Collection" />

                    <br />
                    <Stack direction={{ xs: "column", lg: "row" }} flex={1} spacing={2}>
                        <Stack sx={{ flex: 1, }} spacing={2} >

                            <Box>
                                <Typography level="title-lg" startDecorator={<InfoOutlined />} color="primary" mt={2.5}>Student Details</Typography>
                                <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "6px", mt: 1, display: "flex", gap: 1, }}>
                                    {studentDetails && (
                                        <StudentDetailsFeeHeader
                                            studentMasterData={studentDetails}

                                        />
                                    )}

                                </Box>
                            </Box>
                            {loading && <CircularProgress />}
                            <Box>
                                <Typography level="title-lg" startDecorator={<InfoOutlined />} color="primary">Transport Details</Typography>
                                <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "8px", display: "flex", mt: 1, gap: 1, }}>
                                    <img src={TransportIcon} alt="Transport" width={50} height={50} />
                                    <Stack direction={"row"} spacing={2} justifyContent={"space-between"} sx={{ flex: 1 }}>
                                        <Stack direction={"column"}>
                                            <Typography level="body-sm">Transport Pickup Point</Typography>
                                            <Typography
                                                level="title-lg"
                                                onClick={() => alert('Van 1 clicked')}
                                                sx={{ cursor: 'pointer' }}

                                                endDecorator={<Pageview sx={{ mt: 0.5 }} color="primary" />}
                                            >
                                                {studentTransportDetails?.pickupPointName || "N/A"}
                                            </Typography>
                                        </Stack>
                                        <Stack direction={"column"}>
                                            <Typography level="body-sm">Distance From School</Typography>
                                            <Typography level="title-lg" >{studentTransportDetails?.distance}KM</Typography>
                                        </Stack>
                                        <Stack direction={"column"}>
                                            <Typography level="body-sm">Vehicle</Typography>

                                            <Typography
                                                level="title-lg"
                                                onClick={() => alert('Van 1 clicked')}
                                                sx={{ cursor: 'pointer' }}
                                                // color="primary"
                                                endDecorator={<Pageview sx={{ mt: 0.5 }} color="primary" />}
                                            >
                                                {studentTransportDetails?.vehicleName || "N/A"}
                                            </Typography>
                                        </Stack>
                                        <Stack direction={"column"}>
                                            <Typography level="body-sm">Driver</Typography>
                                            <Typography level="title-lg" >{studentTransportDetails?.driverName || "N/A"} </Typography>
                                        </Stack>
                                        <Stack direction={"column"}>
                                            <Typography level="body-sm">Transport Fee</Typography>
                                            <Typography level="title-lg" >₹{studentTransportDetails?.monthlyCharge || "N/A"}</Typography>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Box>
                            <Box>
                                <FeeHeadersTable
                                    heads={feeHeaders}
                                    dueAmount={currentDue}
                                    consessionAmount={concessionTotal}
                                    onChangeHeads={(updatedHeads) => {
                                        setFinalHeaders(updatedHeads);
                                    }}
                                />
                            </Box>

                        </Stack>
                        <Box sx={{ width: "550px" }}  >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "0px" }}>
                                <Typography level="title-lg" startDecorator={<InfoOutlined />} color="primary">Installement/Fee Months Selection</Typography>
                                {session}
                                <Box
                                    sx={{
                                        borderTop: "1px solid var(--bs-gray-300)",
                                        borderLeft: "1px solid var(--bs-gray-300)",
                                        borderRight: "1px solid var(--bs-gray-300)",
                                        borderRadius: "10px 10px 0px 0px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                    padding="8px"
                                >
                                    <Button
                                        variant="soft"
                                        color="danger"
                                        startDecorator={<Restore />}
                                        onClick={() =>
                                            resetFeeHeaders()
                                        }
                                    >
                                        Reset Selection
                                    </Button>

                                </Box>
                            </Box>
                            <Box sx={{
                                border: "1px solid oklch(.900 .013 255.508)", borderRadius: '10px',
                                borderTopRightRadius: 0,
                                borderTopRight: 'none', padding: "6px", display: "flex", flexWrap: "wrap", gap: 0.5
                            }}>
                                {installments.map((installment, index) => (
                                    <MonthCard
                                        key={index}
                                        label={installment.month}
                                        status={installment.status}
                                        onClick={() => handleInstallmentSelection(installment)}
                                    />
                                ))}
                            </Box>
                            <br />
                            <Typography level="title-lg" startDecorator={<InfoOutlined />} color="primary">Payable Amount</Typography>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: 1, flex: 1, mt: 1 }}>

                                    <Stack direction={"row"} spacing={2} >
                                        <FormControl>
                                            <FormLabel>Pre. Dues</FormLabel>
                                            <Typography level="title-sm" color="danger" sx={{ fontSize: "21px", fontWeight: "bold" }}>₹{preDuesTotal}</Typography>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Installment Total</FormLabel>
                                            <Typography level="title-sm" color="danger" sx={{ fontSize: "21px", fontWeight: "bold" }}>₹{installmentTotal}</Typography>

                                        </FormControl>
                                        <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "12px", display: "flex", gap: 1 }}>
                                            <FormControl>
                                                <FormLabel>Late Fine</FormLabel>
                                                <Typography level="title-sm" color="danger" sx={{ fontSize: "21px", fontWeight: "bold" }}>₹{lateFine}</Typography>
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel>Consession</FormLabel>
                                                <Input sx={{
                                                    width: "100px",
                                                }}
                                                    value={0}
                                                    startDecorator={<CurrencyRupeeIcon fontSize="small" />}

                                                />
                                            </FormControl>
                                        </Box>
                                    </Stack>

                                    <Stack direction={"row"} spacing={2} >
                                        <FormControl>
                                            <FormLabel>POS Charge</FormLabel>
                                            <Input sx={{
                                                width: "100px",
                                            }}
                                                value={0}
                                                disabled
                                                startDecorator={<CurrencyRupeeIcon fontSize="small" />}
                                                error={errors.posCharge ? true : false}
                                                {...register("posCharge")}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Misc.</FormLabel>
                                            <Input sx={{
                                                width: "120px",

                                            }}
                                                disabled
                                                startDecorator={<CurrencyRupeeIcon fontSize="small" />}
                                                error={errors.miscTotal ? true : false}
                                                {...register("miscTotal")}
                                            />
                                        </FormControl>
                                        <Stack direction={"column"}>
                                            <Typography level="title-sm">Total Amount</Typography>
                                            <Typography level="title-lg" color="primary" sx={{ fontSize: "24px" }}>₹{amountTotal}/-</Typography>
                                        </Stack>
                                    </Stack>
                                    <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "12px", display: "flex", gap: 1, justifyContent: "space-between" }} mt={1}>
                                        <FormControl>
                                            <FormLabel>Consession</FormLabel>
                                            <Input sx={{
                                                width: "100px",
                                                fontWeight: "bold"
                                            }}
                                                color="success"
                                                startDecorator={<CurrencyRupeeIcon fontSize="small" />}
                                                error={errors.concessionTotal ? true : false}
                                                {...register("concessionTotal", {
                                                    onChange: (e) => {
                                                        const val = e.target.value;
                                                        console.log("Concession Value:", val);
                                                        setValue("concessionTotal", val === "" ? 0 : Number(val) || 0, {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                        });
                                                    },
                                                })}
                                            />
                                            <FormHelperText sx={{ color: "red" }} >{errors.concessionTotal && errors.concessionTotal.message}</FormHelperText>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Payable Amount</FormLabel>
                                            <Input sx={{
                                                width: "150px",
                                                fontWeight: "bold",
                                            }}
                                                disabled

                                                color="success"
                                                startDecorator={<CurrencyRupeeIcon fontSize="small" />}
                                                error={errors.payableAmount ? true : false}
                                                {...register("payableAmount")}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Paid Amount</FormLabel>
                                            <Input sx={{
                                                width: "150px",
                                                fontWeight: "bold",
                                            }}
                                                color="success"
                                                startDecorator={<CurrencyRupeeIcon fontSize="small" />}
                                                error={errors.paidAmount ? true : false}
                                                {...register("paidAmount", {
                                                    onChange: (e) => {
                                                        const val = e.target.value;
                                                        setValue("paidAmount", val === "" ? 0 : Number(val) || 0, {
                                                            shouldValidate: true,
                                                            shouldDirty: true,
                                                        });
                                                    },
                                                })}
                                            />
                                            <FormHelperText sx={{ color: "red" }} >{errors.paidAmount && errors.paidAmount.message}</FormHelperText>
                                        </FormControl>
                                    </Box>
                                    <Stack direction={"row"} spacing={2}>

                                        <FormControl sx={{ flex: 1 }}>
                                            <FormLabel>Conession Reason</FormLabel>
                                            <Input

                                            />
                                        </FormControl>
                                    </Stack>
                                    <Divider />

                                    <Chip size="lg" sx={{ flex: 1, p: 1, width: "100%" }} variant="soft" color="success" >In Words : {numberToWords(paidAmount)}</Chip>

                                    <Stack direction={"row"} spacing={2} justifyContent={"space-between"} alignItems={"end"} mt={2}>
                                        <Stack direction={"column"}>
                                            <Typography level="title-sm">Current Due</Typography>
                                            <Typography level="title-lg" color="danger" sx={{ fontSize: "24px" }}>₹{currentDue}/-</Typography>
                                        </Stack>
                                        <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} spacing={2}>
                                            <Checkbox label="Print PDF" />
                                            <Button type="submit" >Collect/Save Fee</Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </form>
                            <br />
                            <Typography level="title-lg" startDecorator={<InfoOutlined />} color="primary">Extras</Typography>
                            <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: 1, flex: 1, mt: 1 }}>
                                <Stack sx={{ flex: 1 }} spacing={2} >
                                    <FormControl>
                                        <FormLabel>Payment Methods</FormLabel>
                                        <Select defaultValue="cash">
                                            <Option value="cash">Cash</Option>
                                            <Option value="upi-bank">UPI/BANK Transfer</Option>
                                            <Option value="cheque">Cheque</Option>
                                        </Select>
                                    </FormControl>
                                </Stack>
                            </Box>
                        </Box>
                    </Stack>
                </LSPage>
            </PageContainer >

        </>
    )
}

export default NewFeeCollection