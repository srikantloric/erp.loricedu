import { InfoOutlined, Pageview, Restore } from "@mui/icons-material"
import { Box, Button, Checkbox, Chip, Divider, FormControl, FormLabel, Input, Stack, Typography } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import MonthCard from "components/Card/MonthCard"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { useEffect, useState } from "react"
import { InstallmentChallanType } from "types/payments/payments"
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useParams } from "react-router-dom"
import { StudentDetailsType } from "types/student"
import { enqueueSnackbar } from "notistack"
import { doc, getDoc } from "firebase/firestore"
import { useFirebase } from "context/firebaseContext"
import StudentDetailsFeeHeader from "components/Headers/StudentDetailsFeeHeader"
import TransportIcon from "assets/bus-stop-icon.png"
function NewFeeCollection() {

    const [studentDetails, setStudentDetails] = useState<StudentDetailsType | null>(null)

    const [installments, setInstallments] = useState<InstallmentChallanType[]>([
        { id: "1", month: "January", status: "Paid" },
        { id: "2", month: "February", status: "Pending" },
        { id: "2", month: "February", status: "Pending" },
        { id: "2", month: "February", status: "Pending" },
        { id: "2", month: "February", status: "Pending" },
        { id: "2", month: "February", status: "Pending" },
    ]);

    const { db } = useFirebase()

    const { studentId } = useParams();
    console.log("Student ID:", studentId);

    const fetchStudentDetails = async (studentId: string) => {
        // Fetch student details from the Firestore
        const docPath = doc(db, "STUDENTS", studentId);
        const studentData = await getDoc(docPath);
        console.log("Student Data:", studentData.data());
        setStudentDetails(studentData.data() as StudentDetailsType);
    }


    useEffect(() => {
        if (studentId) {
            fetchStudentDetails(studentId);
        } else {
            enqueueSnackbar("Student ID not found", { variant: "error" })
        }
    }, [])

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
                                        onClick={() => {
                                            const newInstallments = [...installments];
                                            if (newInstallments[index].status === "Pending") {
                                                newInstallments[index].status = "Added"; // Change "Pending" to "Added"
                                            } else if (newInstallments[index].status === "Added") {
                                                newInstallments[index].status = "Pending"; // Change "Added" back to "Pending"
                                            }
                                            setInstallments(newInstallments);
                                        }}
                                    />
                                ))}
                            </Box>
                            <br />
                            <Typography level="title-lg" startDecorator={<InfoOutlined />} color="primary">Payable Amount</Typography>
                            <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", gap: 1, flex: 1, mt: 1 }}>

                                <Stack direction={"row"} spacing={2} >
                                    <FormControl>
                                        <FormLabel>Pre. Dues</FormLabel>
                                        <Input sx={{
                                            width: "150px",
                                        }}
                                            disabled
                                            value={0}
                                            startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Installment Total</FormLabel>
                                        <Input disabled sx={{
                                            width: "120px",
                                        }}
                                            value={0}
                                            startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
                                    </FormControl>
                                    <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "12px", display: "flex", gap: 1 }}>
                                        <FormControl>
                                            <FormLabel>Late Fine</FormLabel>
                                            <Input disabled sx={{
                                                width: "100px",
                                            }}
                                                value={0}
                                                startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Consession</FormLabel>
                                            <Input sx={{
                                                width: "100px",
                                            }}
                                                value={0}
                                                startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
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
                                            startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Misc.</FormLabel>
                                        <Input sx={{
                                            width: "120px",

                                        }}
                                            value={0}
                                            startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
                                    </FormControl>
                                    <Stack direction={"column"}>
                                        <Typography level="title-sm">Total Amount</Typography>
                                        <Typography level="title-lg" color="primary" sx={{ fontSize: "24px" }}>₹250/-</Typography>
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
                                            value={0}
                                            startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Payable Amount</FormLabel>
                                        <Input sx={{
                                            width: "150px",
                                            fontWeight: "bold",
                                        }}
                                            value={0}
                                            color="success"
                                            startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Paid Amount</FormLabel>
                                        <Input sx={{
                                            width: "150px",
                                            fontWeight: "bold",
                                        }}
                                            value={0}
                                            color="success"
                                            startDecorator={<CurrencyRupeeIcon fontSize="small" />} />
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

                                <Chip size="lg" sx={{ flex: 1, p: 1, width: "100%" }} variant="soft" color="success" >In Words : Two Thoushand Three Hundred Only</Chip>

                                <Stack direction={"row"} spacing={2} justifyContent={"space-between"} alignItems={"end"} mt={2}>
                                    <Stack direction={"column"}>
                                        <Typography level="title-sm">Current Due</Typography>
                                        <Typography level="title-lg" color="danger" sx={{ fontSize: "24px" }}>₹250/-</Typography>
                                    </Stack>
                                    <Stack direction={"row"} justifyContent={"center"} alignItems={"center"} spacing={2}>
                                        <Checkbox label="Print PDF" />
                                        <Button>Collect/Save Fee</Button>
                                    </Stack>
                                </Stack>
                            </Box>
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