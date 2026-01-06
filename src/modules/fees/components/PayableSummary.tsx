import {
    Box,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Typography,
    Chip,
    Button,
} from "@mui/joy";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { numberToWords } from "utilities/UtilitiesFunctions";
import { useFeeCollection } from "../context/FeeCollectionContext";
import { FeeHead } from "../types/FeeHeads";
import { Challan, ChallanFeeHead } from "../types/Challan";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";

const schema = z.object({
    lateFine: z.number().default(0),
    concessionTotal: z.number().min(0),
    paidAmount: z.number().min(0),
    paymentMethod: z.string().optional(),
    consessionReason: z.string().optional(),
});

type PayableFormFields = z.infer<typeof schema>;

export default function PayableSummary() {

    const {
        preDuesTotal,
        feeTotal,
        student,
        setConcessionTotal,
        setCurrentDueAmount,
        finalHeads,

    } = useFeeCollection();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<PayableFormFields>({
        resolver: zodResolver(schema),
        defaultValues: {
            paidAmount: 0,
            concessionTotal: 0,
            lateFine: 0,
        },
    });

    // Watch fields
    const concession = watch("concessionTotal");
    const paidAmount = watch("paidAmount");
    const lateFine = watch("lateFine");

    const amountTotal = feeTotal + preDuesTotal + lateFine;
    const payableAmount = amountTotal - concession;

    // Update CURRENT DUE when values change
    const calculatedDue = payableAmount - paidAmount;



    const onSubmit: SubmitHandler<PayableFormFields> = async (data) => {
        if (!student?.id) return;
        const studentId = student.id
        const db = await getFirestoreInstance()
        const regularHeads = finalHeads.filter(h => h.headType === "regular");

        // Group by month
        const headsByMonth = regularHeads.reduce((acc, h) => {
            if (!h.month) return acc;
            acc[h.month] = acc[h.month] || [];
            acc[h.month].push(h);
            return acc;
        }, {} as Record<string, FeeHead[]>);

        const regularChallans: Challan[] = [];

        for (const monthKey of Object.keys(headsByMonth)) {

            const monthHeads = headsByMonth[monthKey];

            // Check if challan exists
            const challanQuery = query(
                collection(db, "challans"),
                where("studentId", "==", student.id),
                where("month", "==", monthKey),
                where("type", "==", "regular")
            );

            const existing = await getDocs(challanQuery);

            const challanId =
                existing.size > 0
                    ? existing.docs[0].id
                    : `FEE-2025-26-${monthKey}`;

            // const challanRef = doc(db, "challans", challanId);

            // Convert FeeHead → ChallanFeeHead
            const heads: ChallanFeeHead[] = monthHeads.map(h => ({
                headId: h.headId,
                headName: h.headName,
                amount: h.amount,
                paid: (h.amount - (h.concessionAmount + h.dueAmount)),
                concession: h.concessionAmount
            }));

            const totalAmount = heads.reduce((s, h) => s + h.amount, 0);
            const paidTotal = heads.reduce((s, h) => s + h.paid, 0);
            const concessionTotal = heads.reduce((s, h) => s + h.concession, 0)
            const dueAmount = totalAmount - (paidTotal + concessionTotal);

            console.log(totalAmount, paidTotal, concessionTotal, dueAmount)

            const status =
                dueAmount <= 0 ? "paid" : paidTotal > 0 ? "partial" : "pending";

            const challan: Challan = {
                challanId,
                studentId,
                classId: student.class!,
                session: "2025-26",
                month: monthKey,
                type: "regular",
                totalAmount,
                paidAmount: paidTotal,
                heads,
                concessionTotal: concession,
                lateFine,
                status,

                createdAt:
                    existing.size > 0 ? existing.docs[0].data().createdAt : Timestamp.now(),
                updatedAt: Timestamp.now(),
                createdBy: "Loric",
            };
            // Store for payment allocations
            regularChallans.push(challan);
        }

        console.log("Challans Genearated for Saving:", regularChallans)

        enqueueSnackbar("Fee saved successfully!", { variant: "success" });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box
                sx={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "12px",
                    mt: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {/* ------------------------------- */}
                {/* TOP TOTALS ROW */}
                {/* ------------------------------- */}
                <Stack direction="row" spacing={4}>
                    <FormControl>
                        <FormLabel>Previous Dues</FormLabel>
                        <Typography level="title-lg" color="danger">
                            ₹{preDuesTotal}
                        </Typography>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Installment Total</FormLabel>
                        <Typography level="title-lg" color="primary">
                            ₹{feeTotal}
                        </Typography>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Late Fine</FormLabel>
                        <Input
                            sx={{ width: "120px" }}
                            type="number"
                            startDecorator={<CurrencyRupeeIcon />}
                            {...register("lateFine", {
                                valueAsNumber: true,
                                onChange: (e) => {
                                    const value = Number(e.target.value) || 0;
                                    setValue("lateFine", value);
                                },
                            })}
                        />
                    </FormControl>
                </Stack>

                {/* ------------------------------- */}
                {/* MAIN AMOUNTS ROW */}
                {/* ------------------------------- */}
                <Stack direction="row" spacing={4}>
                    <FormControl>
                        <FormLabel>Total Amount</FormLabel>
                        <Typography level="h4" color="primary">₹{amountTotal}</Typography>
                    </FormControl>

                    {/* Concession Input */}
                    <FormControl>
                        <FormLabel>Concession</FormLabel>
                        <Input
                            sx={{ width: "120px" }}
                            type="number"
                            error={!!errors.concessionTotal}
                            startDecorator={<CurrencyRupeeIcon />}
                            {...register("concessionTotal", {
                                valueAsNumber: true,
                                onChange: (e) => {
                                    const value = Number(e.target.value) || 0;
                                    setValue("concessionTotal", value);
                                    setConcessionTotal(value); // ⭐ UPDATES CONTEXT
                                },
                            })}
                        />
                    </FormControl>

                    {/* Payable Amount Auto */}
                    <FormControl>
                        <FormLabel>Payable Amount</FormLabel>
                        <Input
                            sx={{ width: "120px" }}
                            disabled
                            value={payableAmount}
                            startDecorator={<CurrencyRupeeIcon />}
                        />
                    </FormControl>

                    {/* Paid Amount Input */}
                    <FormControl>
                        <FormLabel>Paid Amount</FormLabel>
                        <Input
                            sx={{ width: "120px" }}
                            type="number"
                            startDecorator={<CurrencyRupeeIcon />}
                            {...register("paidAmount", {
                                valueAsNumber: true,
                                onChange: (e) => {
                                    const paid = Number(e.target.value) || 0;
                                    setValue("paidAmount", paid);
                                    setCurrentDueAmount(payableAmount - paid);
                                },
                            })}
                        />
                    </FormControl>
                </Stack>
                <Chip variant="soft" color="success">
                    In Words: {numberToWords(paidAmount)}
                </Chip>
                <Typography level="title-lg" color="danger">
                    Current Due: ₹{calculatedDue}
                </Typography>
                <Button type="submit" className="btn btn-primary">
                    Collect / Save Fee
                </Button>
            </Box>
        </form>
    );
}
