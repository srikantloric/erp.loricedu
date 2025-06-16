import { InfoOutlined, Pageview, Restore } from "@mui/icons-material"
import { Box, Button, Checkbox, Chip, Divider, FormControl, FormLabel, Input, Stack, Typography } from "@mui/joy"
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
import { doc, getDoc } from "firebase/firestore"
import { useFirebase } from "context/firebaseContext"
import StudentDetailsFeeHeader from "components/Headers/StudentDetailsFeeHeader"
import TransportIcon from "assets/bus-stop-icon.png"
import FeeHeadersTable from "components/FeeManager/FeeHeadersTable"
import { z as Z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormHelperText } from "@mui/material"
import { numberToWords } from "utilities/UtilitiesFunctions"

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

    // const [amountTotal, setAmountTotal] = useState<number>(0);
    const [installmentTotal, setInstallmentTotal] = useState<number>(0);
    const [preDuesTotal, _setPreDuesTotal] = useState<number>(0);
    const [currentDue, setCurrentDue] = useState<number>(0);

    const [installments, setInstallments] = useState<InstallmentChallanType[]>([
        { id: "APRIL_2025_2026", month: "April", year: "2025", session: "2025-26", status: "Paid" },
        { id: "MAY_2025_2026", month: "May", year: "2025", session: "2025-26", status: "Pending" },
        { id: "JUNE_2025_2026", month: "June", year: "20205", session: "2025-26", status: "Pending" },
        { id: "JULY_2025_2026", month: "July", year: "2025", session: "2025-26", status: "Pending" },
        { id: "AUGUST_2025_2026", month: "August", year: "2025", session: "2025-26", status: "Pending" },
        { id: "SEPTEMPBER_2025_2026", month: "Setp", year: "2025", session: "2025-26", status: "Pending" },
        { id: "OCTOBER_2025_2026", month: "October", year: "2025", session: "2025-26", status: "Pending" },
        { id: "NOVEMBER_2025_2026", month: "November", year: "2025", session: "2025-26", status: "Pending" },
        { id: "DECEMBER_2025_2026", month: "December", year: "2025", session: "2025-26", status: "Pending" },
        { id: "JANUARY_2025_2026", month: "January", year: "2026", session: "2025-26", status: "Pending" },
        { id: "FEBURARY_2025_2026", month: "Feburary", year: "2026", session: "2025-26", status: "Pending" },
        { id: "MARCH_2025_2026", month: "March", year: "2026", session: "2025-26", status: "Pending" },
    ]);


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

    const { db } = useFirebase()
    const { studentId } = useParams();

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
    }

    useEffect(() => {
        if (studentId) {
            fetchStudentDetails(studentId);
        } else {
            enqueueSnackbar("Student ID not found", { variant: "error" })
        }
    }, [])


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

    const onSubmit = (data: PayableFormFields) => {
        console.log("Form Data:", data);
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
                                                Siyatand
                                            </Typography>
                                        </Stack>
                                        <Stack direction={"column"}>
                                            <Typography level="body-sm">Distance From School</Typography>
                                            <Typography level="title-lg" >5KM</Typography>
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
                                                Van 1
                                            </Typography>
                                        </Stack>
                                        <Stack direction={"column"}>
                                            <Typography level="body-sm">Driver</Typography>
                                            <Typography level="title-lg" >Rohit </Typography>
                                        </Stack>
                                        <Stack direction={"column"}>
                                            <Typography level="body-sm">Transport Fee</Typography>
                                            <Typography level="title-lg" >₹400</Typography>
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
                                        console.log("Updated Heads:", updatedHeads);
                                    }}
                                />
                            </Box>

                        </Stack>
                        <Box sx={{ width: "550px" }}  >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "0px" }}>
                                <Typography level="title-lg" startDecorator={<InfoOutlined />} color="primary">Installement/Fee Months Selection</Typography>
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
                                        onClick={() => {
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
                                            setFeeHeaders([]);
                                        }}
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
                                            <Button type="submit">Collect/Save Fee</Button>
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
                                        <Input sx={{
                                            width: "150px",
                                            fontWeight: "bold",
                                        }}
                                            value={0}
                                            color="success"
                                            startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
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