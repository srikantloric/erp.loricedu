import { Box, Divider, Modal, ModalClose, Sheet, Table, Typography } from "@mui/joy";
import { IconEye } from "@tabler/icons-react";
import { useFirebase } from "context/firebaseContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { IPaymentNL } from "types/payment";


type ViewChallanDetailsProps = {
    open: boolean,
    setOpen: (value: boolean) => void
    challanId: string
    studentId: string
}


const ViewChallanDetails: React.FC<ViewChallanDetailsProps> = ({ open, setOpen, challanId, studentId }) => {

    const { db } = useFirebase()
    const [paymentHistory, setPaymentHistory] = useState<IPaymentNL[]>([])

    useEffect(() => {
        const fetchChallanDetails = async () => {
            if (!studentId || !challanId) {
                enqueueSnackbar("No student or challan found!")
                return
            }

            const paymentsRef = collection(db, "STUDENTS", studentId, "PAYMENTS");

            const q = query(paymentsRef, where("challanId", "==", challanId));

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                enqueueSnackbar("No fee reciept found, please pay fee and try again", { variant: "info" });
                return;
            }
            const paymentsData: IPaymentNL[] = snapshot.docs.map(doc => ({ ...(doc.data() as IPaymentNL) }));
            setPaymentHistory(paymentsData)
        }

        fetchChallanDetails()

    }, [challanId])
    return (
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={open}
            onClose={() => setOpen(false)}
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
            <Sheet
                variant="outlined"
                sx={{
                    width: 800,
                    borderRadius: "md",
                    p: 3,
                    boxShadow: "sm",
                }}
            >
                <ModalClose variant="plain" sx={{ m: 1 }} />
                <Typography
                    component="h2"
                    id="modal-title"
                    level="h4"
                    textColor="inherit"
                    fontWeight="lg"
                    mb={1}
                    sx={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                    <IconEye size="20" />
                    Challan Additional Details
                </Typography>
                <Divider />
                <br />
                <Box>
                    <Table>
                        <thead>
                            <th>Sl.</th>
                            <th style={{ width: "300px" }}>Header</th>
                            <th>Recieved On</th>
                            <th>Recieved By</th>
                        </thead>
                        <tbody>
                            {paymentHistory.map((payments, index) => {
                                return (
                                    <tr>
                                        <td>
                                            {index + 1}.
                                        </td>
                                        <td>
                                            {payments.breakdown.map((header) => {
                                                return (
                                                    <>
                                                        Head : {header.headerTitle}
                                                        <br />
                                                        Paid : Rs.{header.amountPaid}
                                                        <br />
                                                    </>
                                                )
                                            })}
                                        </td>
                                        <td>
                                            {payments.recievedOn.toDate().toDateString()}
                                        </td>
                                        <td>
                                            {payments.recievedBy}

                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </Box>


            </Sheet>
        </Modal>
    )
}

export default ViewChallanDetails