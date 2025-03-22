import { useEffect, useState } from "react";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import PrintIcon from "@mui/icons-material/Print";
import CheckIcon from "@mui/icons-material/Check";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  Option,
  Select,
  Sheet,
  Divider,
  Typography,
} from "@mui/joy";
import { db } from "../../../firebase";

import { GenerateFeeReciept } from "utilities/GenerateFeeReciept";

function QuickPaymentModal({
  selectedRowData,
  userPaymentData,
  modelOpen,
  setModelOpen,
  paymentRemarks,
  setPaymentRemarks,
}) {
  function getCurrentDate(dateObj) {
    const currDate =
      dateObj.getFullYear() +
      "-" +
      (dateObj.getMonth() + 1) +
      "-" +
      dateObj.getDate();
    return currDate;
  }

  //   const [modelOpen, setModelOpen] = useState(false);
  const [remarkError, setRemarkError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [totalFeeAmount, setTotalFeeAmount] = useState();
  // const [sendSms, setSendSMS] = useState(true);
  const [paidAmountError, setPaidAmountError] = useState(false);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paidAmount, setPaidAmount] = useState();
  const [isPrintPreviewLoading, setIsPrintPreviewLoading] = useState(false);
  const [discountHelperText, setDiscountHelperText] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentStatus, setPaymentStatus] = useState();
  // const [paymentRemarks, setPaymentRemarks] = useState("");
  const [dueAmount, setDueAmount] = useState();
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (selectedRowData) {
      console.log(selectedRowData);

      setTotalFeeAmount(selectedRowData.fee_total);
      const due =
        parseInt(selectedRowData.fee_total) +
        parseInt(selectedRowData.computer_fee) +
        parseInt(selectedRowData.transportation_fee) -
        parseInt(selectedRowData.paid_amount) +
        parseInt(selectedRowData.late_fee);

      if (selectedRowData.payment_date != null) {
        setPaymentDate(
          selectedRowData.payment_date.toDate().toISOString().split("T")[0]
        );
      }

      setDueAmount(due);
      setPaymentMode(selectedRowData.payment_mode);

      if (due === 0) {
        setPaymentStatus(true);
      } else {
        setPaymentStatus(false);
      }
    }
  }, [selectedRowData]);

  const handlePayBtn = async () => {
    setPaymentLoading(true);
    setPaidAmountError(false);
    if (paidAmount) {
      const paymentData = {
        payment_date: new Date(paymentDate),
        payment_remarks: paymentRemarks,
        payment_mode: paymentMode,
        credit_by: "Umakant",
        is_payment_done: true,
        paid_amount:
          parseInt(selectedRowData.paid_amount) + parseInt(paidAmount),
      };
      if (userPaymentData.id && selectedRowData.doc_id) {
        const batch = db.batch();

        const studentPaymentRef = db
          .collection("STUDENTS")
          .doc(userPaymentData.id)
          .collection("PAYMENTS")
          .doc(selectedRowData.doc_id);

        const mainPaymentRef = db
          .collection("MY_PAYMENTS")
          .doc(selectedRowData.doc_id);

        batch.update(studentPaymentRef, paymentData);
        batch.update(mainPaymentRef, paymentData);

        await batch.commit();
        setPaymentLoading(false);
        setPaymentStatus(true);
      }
    } else {
      setPaidAmountError(true);
      setPaymentLoading(false);
    }
  };

  const [items, setItems] = useState([{ name: "", quantity: 0, price: 0 }]);
  const [feeAmount, setFeeAmount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [feeTypeDetails, setFeeTypeDetails] = useState([
    { name: "Admission Fee", value: "" },
    { name: "Tution Fee", value: "" },
    { name: "Late Fee", value: "" },
    { name: "Other Fee", value: "" },
    { name: "Transport Fee", value: "" },
  ]);

  const handlePrintBtn = async () => {
    if(selectedRowData){
      const totalAmountToPay =
      parseInt(selectedRowData.fee_total) +
      parseInt(selectedRowData.computer_fee) +
      parseInt(selectedRowData.transportation_fee)+
      parseInt(selectedRowData.late_fee);
      
     console.log(selectedRowData) 
    setFeeTypeDetails([
      { name: "Admission Fee", value: selectedRowData.admission_fee },
      { name: "Tution Fee", value: selectedRowData.fee_total },
      { name: "Computer Fee", value: selectedRowData.computer_fee },
      { name: "Transport Fee", value: selectedRowData.transportation_fee },
      { name: "Late Fee", value: selectedRowData.late_fee },
      { name: "Other Fee", value: selectedRowData.other_fee },
    ]);
    console.log("Data passed for fee reciept",feeTypeDetails)
    setIsPrintPreviewLoading(true);
    const url = await GenerateFeeReciept({
      fee_type_detail: feeTypeDetails,
      student_data: userPaymentData,
      total_fee:totalAmountToPay
    });
    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setIsPrintPreviewLoading(false);
      iframe.contentWindow.print();
    };
  }else{
    alert("cannot be generated.")
  }
  };
  
  const handleDiscount = () => {
    const dueCurrent =
      parseInt(selectedRowData.fee_total) +
      parseInt(selectedRowData.computer_fee) +
      parseInt(selectedRowData.late_fee) +
      parseInt(selectedRowData.transportation_fee) +
      parseInt(selectedRowData.paid_amount);
    const discountedPrice = dueCurrent - discountAmount;

    setDueAmount(discountedPrice);
    setDiscountHelperText("Discount applied successfully.");
  };

  return (
    <div>
      {selectedRowData ? (
        <Modal
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
          open={modelOpen}
          onClose={() => setModelOpen(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Sheet
            variant="outlined"
            sx={{
              width: 550,
              minHeight: 600,
              borderRadius: "md",
              p: 3,
              boxShadow: "lg",
            }}
          >
            <ModalClose variant="plain" sx={{ m: 1 }} />
            <div style={{ display: "flex" }}>
              <ElectricBoltIcon />
              <Typography level="title-lg" mb={1}>
                Quick Payment
              </Typography>
            </div>
            <Divider />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                height: 550,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex" }}>
                  <div>
                    <Typography level="body-md" sx={{ mt: 1 }}>
                      Slip Id :
                    </Typography>
                    <Typography level="body-md">Payment Title :</Typography>
                    <Typography level="body-md">Tution Fee :</Typography>
                    <Typography level="body-md">Computer Fee :</Typography>
                    <Typography level="body-md">Tranportation Fee :</Typography>
                    <Typography level="body-md">Late Fee:</Typography>
                  </div>
                  <div style={{ marginLeft: "20px" }}>
                    <Typography level="body-md" sx={{ mt: 1, fontWeight: 700 }}>
                      {selectedRowData.id}
                    </Typography>
                    <Typography level="body-md">
                      Payment for {selectedRowData.fee_title}
                    </Typography>
                    <Typography level="body-md">
                      Rs. {selectedRowData.fee_total}
                    </Typography>
                    <Typography level="body-md">
                      Rs. {selectedRowData.computer_fee}
                    </Typography>
                    <Typography level="body-md">
                      Rs. {selectedRowData.transportation_fee}
                    </Typography>
                    <Typography level="body-md">
                      Rs. {selectedRowData.late_fee}
                    </Typography>
                  </div>
                </div>
                <div style={{ marginTop: "30px" }}>
                  <FormControl>
                    <FormLabel>Discount</FormLabel>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <Input
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        disabled={paymentStatus}
                        sx={{ flex: 1 }}
                        placeholder="Please enter discount for total fee"
                      />
                      <Button
                        onClick={handleDiscount}
                        disabled={paymentStatus}
                        startDecorator={<CheckIcon />}
                      />
                    </div>
                    <FormHelperText sx={{ color: "green" }}>
                      {discountHelperText}
                    </FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Remarks</FormLabel>
                    <Input
                      value={paymentRemarks}
                      onChange={(e) => {
                        setPaymentRemarks(e.currentTarget.value);
                      }}
                      disabled={paymentStatus}
                      placeholder="Please enter remark for payment"
                    />
                    <FormHelperText>{remarkError}</FormHelperText>
                  </FormControl>

                  <FormControl sx={{ mt: 1 }}>
                    <FormLabel required>Payment Date</FormLabel>
                    <Input
                      disabled={paymentStatus}
                      type="date"
                      value={paymentDate}
                      required
                      onChange={(e) => setPaymentDate(e.currentTarget.value)}
                    />
                  </FormControl>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <FormControl sx={{ mt: 1, flex: 1 }}>
                      <FormLabel required>Send SMS</FormLabel>
                      <Select defaultValue="yes">
                        <Option value="no" disabled={paymentStatus}>
                          No
                        </Option>
                        <Option value="yes" disabled={paymentStatus}>
                          Yes
                        </Option>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ mt: 1, flex: 1 }}>
                      <FormLabel required>Mode Of Payment</FormLabel>
                      <Select
                        value={paymentMode}
                        onChange={(e, newVal) => {
                          setPaymentMode(newVal);
                        }}
                        required
                      >
                        <Option value="cash" disabled={paymentStatus}>
                          Cash
                        </Option>
                        <Option value="online" disabled={paymentStatus}>
                          Online
                        </Option>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography level="h3" sx={{ color: "var(--bs-danger2)" }}>
                  Rs. {dueAmount}
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 400,
                      marginLeft: "4px",
                    }}
                  >
                    Due
                  </span>
                </Typography>

                <div style={{ display: "flex", alignItems: "center" }}>
                  {paymentStatus ? (
                    <Button
                      onClick={handlePrintBtn}
                      startDecorator={<PrintIcon />}
                      loading={isPrintPreviewLoading}
                    >
                      Print Recipt
                    </Button>
                  ) : (
                    <>
                      <Typography>Pay -</Typography>
                      <Input
                        disabled={paymentStatus}
                        placeholder="enter amount"
                        value={paidAmount}
                        error={paidAmountError}
                        onChange={(e) => {
                          setPaidAmount(e.currentTarget.value);
                        }}
                        sx={{ ml: 1 }}
                      />

                      <Button
                        variant="solid"
                        disableElevation
                        sx={{ ml: 2 }}
                        color="success"
                        loading={paymentLoading}
                        onClick={handlePayBtn}
                        disabled={paymentStatus}
                      >
                        Pay Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {paymentStatus ? (
              <img
                style={{ position: "absolute", top: 70, right: 50 }}
                height={100}
                src="https://firebasestorage.googleapis.com/v0/b/orient-public-school.appspot.com/o/Dummy%20Images%2Fpaid2.png?alt=media&token=208e9ef0-2ad8-4016-beec-507b21af2221"
              ></img>
            ) : null}
          </Sheet>
        </Modal>
      ) : (
        ""
      )}
      <iframe
        src={previewUrl}
        title="PDF viewwer"
        style={{ height: "100vh", width: "100%", display: "none" }}
      ></iframe>
    </div>
  );
}

export default QuickPaymentModal;
