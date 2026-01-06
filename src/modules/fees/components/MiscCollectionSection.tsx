import { Add, Check, Info, InfoOutlined, Restore } from "@mui/icons-material"
import { Box, Button, Chip, Divider, FormControl, FormLabel, IconButton, Input, Option, Radio, RadioGroup, Select, Stack, Textarea, Typography } from "@mui/joy"
import { SCHOOL_FEE_MONTHS, SCHOOL_SESSIONS } from "config/schoolConfig"
import { useEffect, useState } from "react"
import { makeDoubleDigit, numberToWords } from "utilities/UtilitiesFunctions"
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AddFeeHeadsModal from "./modals/AddFeeHeadsModal"
import { getFeeHeads } from "../services/feeHead.service"
import { useNavbar } from "context/NavbarContext"
import { useFeeCollection } from "../context/FeeCollectionContext"
import { doc, Timestamp, writeBatch } from "firebase/firestore"
import { FeeHead } from "../types/FeeHeads"
import { enqueueSnackbar } from "notistack"
import { Challan } from "../types/Challan"
import { useAuth } from "context/AuthContext"
import { useConfirm } from "context/ConfirmDialogContext"
import { convertToChallanFeeHead, generateChallanId } from "../services/challan.service"
import { FeeDue } from "../types/FeeDue"
import { useFirebase } from "context/firebaseContext"
import { FeePayment } from "../types/FeePayment"

function MiscCollectionSection() {

  const [heads, setHeads] = useState<any[]>([]);
  const [showAddFeeModal, setShowAddFeeModal] = useState<boolean>(false)
  const [paymentStatus, setPaymentStatus] = useState("paid")
  const [selectedHead, setSelectedHead] = useState<string | null>(null);
  const [headAmount, setHeadAmount] = useState<number>(0);
  const [selectedSession, setSelectedSession] = useState<string>("2025-2026")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [concessionDescription, setConcessionDescription] = useState<string>("")


  const { session } = useNavbar()
  const { currentUser } = useAuth()
  const { confirm } = useConfirm();
  const { feeTotal, setFeeHeads, concessionTotal, setConcessionTotal, finalHeads, student, setCurrentDueAmount, currentDueAmount } = useFeeCollection()

  const { db } = useFirebase()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentStatus(event.target.value);
  };

  useEffect(() => {
    if (!showAddFeeModal) {
      setSelectedHead(null);
    }

    const load = async () => {
      const result = await getFeeHeads();
      if (result.success && result.data) {
        setHeads(result.data);
      }
    };

    load();
  }, [showAddFeeModal]);

  useEffect(() => {
    if (selectedHead) {
      const head = heads.find((h) => h.headId === selectedHead);
      if (head) {
        setHeadAmount(head.amount);
      }
    }
  }, [selectedHead, heads]);



  const addMiscFeeHeads = () => {
    if (!selectedHead) return;

    const head = heads.find((h) => h.headId === selectedHead);
    if (!head) return;

    let constructedMonth = null;
    if (selectedMonth) {
      constructedMonth = "2025-" + makeDoubleDigit(selectedMonth)
    }

    const newHead: FeeHead = {
      headId: head.headId,
      headName: head.name,
      amount: headAmount,
      month: constructedMonth,
      concessionAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      headType: "misc",
      id: crypto.randomUUID(),
    };

    setFeeHeads((prev) => [...prev, newHead]);
    setSelectedHead(null)
  };

  useEffect(() => {

    if (paymentStatus === "pending") {
      setCurrentDueAmount(feeTotal)
    } else {
      setCurrentDueAmount(0)
    }

  }, [paymentStatus, feeTotal])

  const resetFeeHeads = () => {
    setFeeHeads([])
    setConcessionTotal(0)

  }


  const handleCollectFee = async () => {

    if (finalHeads.length === 0) {
      enqueueSnackbar("No heads to save", { variant: "warning" });
      return;
    }

    if (!student) {
      enqueueSnackbar("Failed to get the student details!", { variant: "error" })
      return
    }

    // --------------------------
    // 1️⃣ Create ONE challan for ALL heads
    // --------------------------
    const challanId = generateChallanId();

    const challanHeads = finalHeads.map((h) => convertToChallanFeeHead(h));

    const totalAmount = finalHeads.reduce((sum, h) => sum + h.amount, 0);
    const totalPaid = finalHeads.reduce((sum, h) => sum + (h.paidAmount ?? 0), 0);
    const totalConcession = finalHeads.reduce(
      (sum, h) => sum + (h.concessionAmount ?? 0),
      0
    );

    const challanStatus =
      totalPaid === 0
        ? "pending"
        : totalPaid < totalAmount
          ? "partial"
          : "paid";

    const consolidatedChallan: Challan = {
      challanId,
      studentId: student.id,
      month: selectedMonth ? "2025-" + makeDoubleDigit(selectedMonth) : null,
      session: selectedSession,
      classId: student.class!,
      type: "misc",

      totalAmount,
      paidAmount: totalPaid,
      heads: challanHeads,

      concessionTotal: totalConcession,
      lateFine: 0,
      status: challanStatus,

      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: currentUser?.email ?? "system",
    };

    // --------------------------
    // 2️⃣ Create FEE_DUE entries for each head
    // --------------------------
    const feeDues: FeeDue[] = finalHeads
      .filter((h) => {
        const net = h.amount - (h.concessionAmount ?? 0);
        return net > (h.paidAmount ?? 0);
      })
      .map((h) => {
        const original = h.amount;
        const concession = h.concessionAmount ?? 0;
        const paid = h.paidAmount ?? 0;
        const net = original - concession;
        const remaining = net - paid;

        return {
          dueId: crypto.randomUUID(),
          studentId: student.id,
          sessionId: selectedSession,
          headId: h.headId,
          headName: h.headName,
          month: h.month,

          originalAmount: original,
          concessionAmount: concession,
          netAmount: net,
          paidAmount: paid,
          dueAmount: remaining,

          sourceType: "challan",
          sourceChallanId: challanId,
          status: remaining <= 0 ? "paid" : paid > 0 ? "partial" : "pending",

          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: currentUser?.email ?? "system",
        };
      });


    /// Payment
    const paymentId = crypto.randomUUID();
    const feePayment: FeePayment = {
      paymentId: paymentId,
      challanId: challanId,
      studentId: student.id,
      sessionId: selectedSession,

      totalPayable: (consolidatedChallan.totalAmount - consolidatedChallan.concessionTotal),
      totalPaidNow: consolidatedChallan.paidAmount,
      totalPaidTillNow: consolidatedChallan.paidAmount,
      paymentMode: "cash",

      heads: challanHeads,
      note: concessionDescription || null,

      createdAt: Timestamp.now(),
      createdBy: currentUser?.email ?? "system"
    }


    // FeeReceipt (stored doc)
    const receiptId = crypto.randomUUID();
    const receiptNumber = `RCPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000 + 100000))}`;
    const feeReceipt = {
      receiptId,
      receiptNumber,
      paymentId,
      challanId,
      studentId: student.id,
      session: selectedSession,
      amountPaid: consolidatedChallan.paidAmount,
      mode: "cash", // TODO: from UI
      heads: feePayment.heads, // per-head split
      status: "active",
      createdAt: Timestamp.now(),
      createdBy: currentUser?.email ?? "system",
      cancelledAt: null,
      cancelledBy: null,
      cancelReason: null,
      ledgerEntryId: null, // will set after ledgerEntry created
      notes: concessionDescription || null,
      metadata: {},
    };

    ///Ledger
    const ledgerEntryId = crypto.randomUUID();
    const ledgerEntry = {
      entryId: ledgerEntryId,
      type: "credit",
      studentId: student.id,
      challanId,
      paymentId,
      linkedLedgerId: null,
      amount: totalAmount,
      currency: "INR",
      account: "fee_collection", // optional accounting code
      reason: `Fee Payment via Misc Collection (${receiptNumber})`,
      metadata: {},
      createdAt: Timestamp.now(),
      createdBy: currentUser?.email ?? "system",
      reversed: false,
      reversedAt: null,
      reversedBy: null,
    };

    console.log("Fee Payment:", feePayment);
    console.log("Fee Reciept:", feeReceipt);
    console.log("Ledger:", ledgerEntry);

    const ok = await confirm({
      title: "Confirm Payment",
      message: "Do you want to proceed with fee collection?",
      confirmText: "Yes, Collect Fee",
      cancelText: "No, Cancel",
    });

    if (!ok) {
      enqueueSnackbar("Payment cancelled", { variant: "warning" });
      return;
    }

    // ---------------------------------------
    // 3️⃣ Firestore batch writing
    // ---------------------------------------
    const batch = writeBatch(db);

    // Save challan
    batch.set(doc(db, "FEE_CHALLANS", challanId), consolidatedChallan);

    // Save each FeeDue
    feeDues.forEach((due) => {
      batch.set(doc(db, "FEE_DUES", due.dueId), due);
    });

    // Commit all writes atomically
    await batch.commit();

    enqueueSnackbar("Challan & Fee Dues saved successfully!", {
      variant: "success",
    });

    // Optionally clear UI
    resetFeeHeads();

  }

  return (
    <Box>
      <Typography
        level="title-lg"
        startDecorator={<InfoOutlined />}
        color="primary"
      >
        Miscellaneous Headers Selection {session}
      </Typography>

      <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: 2, mt: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Box flex={0.7}>
            <FormControl >
              <FormLabel>Select Fee Head</FormLabel>
              <Select
                value={selectedHead}
                onChange={(_, val) => setSelectedHead(val)}
              >
                {heads.length === 0 && <Typography sx={{ p: 1 }} textAlign={"center"}>- No Heads Available -</Typography>}
                {heads.map((head) => (
                  <Option key={head.headId} value={head.headId} sx={{ display: "flex", justifyContent: "space-between" }}>
                    {head.name?.toUpperCase()} - Rs.{head.amount}

                  </Option>
                ))}

                <Divider />

                {/* Button inside dropdown */}

                <Stack sx={{ mt: 1, p: 1 }} direction={"row"} spacing={1}>
                  <Button
                    fullWidth
                    variant="soft"
                    color="primary"
                    startDecorator={<Add />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddFeeModal(true);
                    }}
                  >
                    Create New Fee Head
                  </Button>
                  <IconButton variant="soft" color="primary">
                    <Info color="primary" />
                  </IconButton>
                </Stack>
              </Select>
            </FormControl>
          </Box>

          <Box flex={0.3}>
            <FormControl >
              <FormLabel>Amount</FormLabel>
              <Input variant="outlined" startDecorator="₹" value={headAmount} onChange={(e) => setHeadAmount(Number(e.target.value) || 0)} />
            </FormControl>
          </Box>
        </Stack>

        <Stack spacing={2} direction={"row"} mt={1} mb={1}>
          <Button startDecorator={<Add />} color="primary" onClick={addMiscFeeHeads}>Add To Fee Head List</Button>
          <Button startDecorator={<Restore />} color="danger" variant="outlined" onClick={resetFeeHeads}>Reset</Button>
        </Stack>

        <Divider>For</Divider>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Box flex={0.7}>
            <FormControl >
              <FormLabel>Month</FormLabel>
              <Select defaultValue={null} value={selectedMonth} onChange={(e, val) => setSelectedMonth(val)}>
                <Option value={null}>None</Option>
                {SCHOOL_FEE_MONTHS.map((month) => (
                  <Option key={month.value} value={month.value}>{month.title}</Option>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box flex={0.3}>
            <FormControl >
              <FormLabel>Session</FormLabel>
              <Select value={selectedSession} onChange={(e, val) => setSelectedSession(val!)}>
                {SCHOOL_SESSIONS.map((session) => (
                  <Option key={session.id} value={session.value}>{session.title}</Option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Stack>

      </Box >
      <br />
      <Typography
        level="title-lg"
        startDecorator={<InfoOutlined />}
        color="primary"
      >
        Misc Payable Summary
      </Typography>
      <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: 2, mt: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: "100%" }}
        >
          <FormControl>
            <FormLabel>Total Amount</FormLabel>
            <Typography level="h4" color="primary">₹{feeTotal}</Typography>
          </FormControl>
          <FormControl >
            <FormLabel>Concession</FormLabel>
            <Input variant="outlined" startDecorator={<CurrencyRupeeIcon />}
              value={concessionTotal}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setConcessionTotal(Math.min(val, feeTotal));
              }}
            />
          </FormControl>
          <FormControl >
            <FormLabel>Payable Amount</FormLabel>
            <Typography level="h4" color="primary">₹{feeTotal - concessionTotal}</Typography>
          </FormControl>
        </Stack>

        <FormControl sx={{ mt: 1 }}>
          <FormLabel>Misc. Description/Concession Reason</FormLabel>
          <Textarea value={concessionDescription} onChange={(e) => setConcessionDescription(e.target.value)} variant="outlined" minRows={2} />
        </FormControl>
        <Chip variant="soft" color="success" sx={{ mt: 2 }}>
          In Words: {numberToWords(250)}
        </Chip>
        {
          currentDueAmount > 0 &&
          <Typography level="title-lg" color="danger">
            Current Due: ₹{currentDueAmount}
          </Typography>
        }
        <Stack direction={"row"} spacing={2} mt={2} alignItems={"center"}>
          <RadioGroup
            defaultValue="paid"
            value={paymentStatus}
            onChange={handleChange}
            orientation="horizontal"

          >
            <Radio value="pending" label="In Due" />
            <Radio value="paid" label="Pay Now" />
          </RadioGroup>
          <Button color={currentDueAmount > 0 ? "danger" : "primary"} startDecorator={<Check />} onClick={handleCollectFee}>Collect Fee/Save Fee</Button>
        </Stack>

        {/* ADD FEE HEADS MODALS     */}
        <AddFeeHeadsModal open={showAddFeeModal} setOpen={setShowAddFeeModal} />
      </Box>
      <br />
      <br />
      <br />
    </Box >
  )
}

export default MiscCollectionSection