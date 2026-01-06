import { getFirestoreInstance } from "context/firebaseUtility";
import { collection, query, where, getDocs, writeBatch, Timestamp, doc } from "firebase/firestore";
import { FeeHead, } from "../types/FeeHeads";
import { MiscDue } from "../types/MiscDue";
import { Challan, ChallanFeeHead } from "../types/Challan";


// 1️⃣ Fetch previous dues for a student
export async function fetchPreviousDues(studentId: string): Promise<FeeHead[]> {
    const db = await getFirestoreInstance();

    const q = query(
        collection(db, "FEE_DUES"),
        where("studentId", "==", studentId),
        where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    const dues: FeeHead[] = snapshot.docs.map((doc) => {
        const d = doc.data();

        return {
            id: "",
            headId: d.id,
            headName: d.headName,
            amount: d.amount,
            month: d.month ?? null,
            concessionAmount: 0,
            dueAmount: d.amount,
            paidAmount: d.paidAmount,
            updatedAt: d.updatedAt,
            headType: "previous_due",
        };
    });

    return dues;
}



// 2️⃣ Fetch miscellaneous dues for a student
export async function fetchMiscDues(studentId: string): Promise<MiscDue[]> {
    const db = await getFirestoreInstance();

    const q = query(
        collection(db, "MISC_DUES"),
        where("studentId", "==", studentId),
        where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data() as MiscDue);
}



// 3️⃣ Convert MiscDue → FeeHead (so that table can read it)
export function convertMiscToFeeHeads(misc: MiscDue[]): FeeHead[] {
    return misc.map((m) => ({
        id: "",
        headId: m.id,
        headName: m.headName,
        amount: m.amount,
        month: m.month,          // can be null or "YYYY-MM"
        headType: "misc",
        concessionAmount: 0,
        dueAmount: m.amount,
        updatedAt: m.createdAt,
        paidAmount: m.paidAmount
    }));
}


interface SaveFeePayload {
    studentId: string;
    session: string;
    month: string | null;                 // null for misc challans
    lateFine: number;
    concessionTotal: number;
    paidAmount: number;
    finalHeads: FeeHead[];
    createdBy: string;
    paymentMethod: string;
}

export async function saveFeeCollection(payload: SaveFeePayload) {
    const db = await getFirestoreInstance()
    const batch = writeBatch(db);

    const {
        studentId,
        session,
        month,
        finalHeads,
        concessionTotal,
        lateFine,
        createdBy,
    } = payload;

    const now = Timestamp.now();

    // Group heads
    const regularHeads = finalHeads.filter((h) => h.headType === "regular");
    // const prevDueHeads = finalHeads.filter((h) => h.headType === "previous_due");
    // const miscHeads = finalHeads.filter((h) => h.headType === "misc");

    // -----------------------------------------
    // 🔥 1. Create or Update REGULAR CHALLAN
    // -----------------------------------------

    let regularChallan: Challan | null = null;

    if (regularHeads.length > 0) {
        if (!month) throw new Error("Regular challan must have a month.");

        // Ensure uniqueness:
        const challanQuery = query(
            collection(db, "challans"),
            where("studentId", "==", studentId),
            where("session", "==", session),
            where("month", "==", month),
            where("type", "==", "regular")
        );

        const challanSnap = await getDocs(challanQuery);

        const challanId =
            challanSnap.docs.length > 0
                ? challanSnap.docs[0].id
                : `REG-${studentId}-${session}-${month}`;

        const challanRef = doc(db, "CHALLANS", challanId);

        // Convert heads → ChallanFeeHead[]
        const heads: ChallanFeeHead[] = regularHeads.map((h) => ({
            headId: h.headId,
            headName: h.headName,
            amount: h.amount,
            paid: h.paidAmount,
            concession: h.concessionAmount,
        }));

        const totalAmount = heads.reduce((s, h) => s + h.amount, 0);
        const paidTotal = heads.reduce((s, h) => s + h.paid, 0) + lateFine;
        const dueAmount = totalAmount - (paidTotal + concessionTotal);

        const status =
            dueAmount <= 0 ? "paid" : paidTotal > 0 ? "partial" : "pending";

        regularChallan = {
            challanId,
            studentId,
            classId: 5,
            session,
            month,
            type: "regular",

            totalAmount,
            paidAmount: paidTotal,
            heads,

            concessionTotal,
            lateFine,
            status,

            createdAt: challanSnap.docs.length > 0 ? challanSnap.docs[0].data().createdAt : now,
            updatedAt: now,
            createdBy,
        };

        batch.set(challanRef, regularChallan, { merge: true });
    }

    console.log(regularChallan)

    // -----------------------------------------
    // 🔥 2. Update FEE DUES (previous_due)
    // -----------------------------------------
    // for (const h of prevDueHeads) {
    //     const remaining =
    //         h.dueAmount - h.paidAmount - h.concessionAmount;

    //     const feeDueRef = doc(db, "fee_dues", h.feeDueId);

    //     const updatedFeeDue: Partial<FeeDue> = {
    //         paidAmount: h.paidAmount,
    //         remainingAmount: remaining,
    //         status: remaining <= 0 ? "paid" : "pending",
    //         updatedAt: now,
    //     };

    //     batch.update(feeDueRef, updatedFeeDue);
    // }

    // // -----------------------------------------
    // // 🔥 3. Update EXISTING MISC DUES
    // // -----------------------------------------
    // for (const h of miscHeads) {
    //     const remaining =
    //         h.amount - h.paidAmount - h.concessionAmount;

    //     const miscRef = doc(db, "misc_dues", h.miscDueId);

    //     const updatedMiscDue: Partial<MiscDue> = {
    //         paidAmount: h.paidAmount,
    //         remainingAmount: remaining,
    //         status: remaining <= 0 ? "paid" : "pending",
    //         updatedAt: now,
    //     };

    //     batch.update(miscRef, updatedMiscDue);
    // }

    // // -----------------------------------------
    // // 🔥 4. Create PAYMENT RECORD
    // // -----------------------------------------
    // const paymentId = crypto.randomUUID();
    // const paymentRef = doc(db, "payments", paymentId);

    // batch.set(paymentRef, {
    //     id: paymentId,
    //     studentId,
    //     sessionId: session,
    //     amount: paidAmount,
    //     method: paymentMethod,
    //     date: now,
    //     createdAt: now,
    //     createdBy,
    // });

    // // -----------------------------------------
    // // 🔥 5. Create PAYMENT ALLOCATIONS
    // // -----------------------------------------

    // // previous dues
    // for (const h of prevDueHeads) {
    //     if (h.paidAmount <= 0) continue;

    //     const allocRef = doc(collection(db, "payment_allocations"));

    //     batch.set(allocRef, {
    //         id: allocRef.id,
    //         paymentId,
    //         type: "fee_due",
    //         feeDueId: h.feeDueId,
    //         headId: h.headId,
    //         allocatedAmount: h.paidAmount,
    //         createdAt: now,
    //     });
    // }

    // // misc dues
    // for (const h of miscHeads) {
    //     if (h.paidAmount <= 0) continue;

    //     const allocRef = doc(collection(db, "payment_allocations"));

    //     batch.set(allocRef, {
    //         id: allocRef.id,
    //         paymentId,
    //         type: "misc_due",
    //         miscDueId: h.miscDueId,
    //         headId: h.headId,
    //         allocatedAmount: h.paidAmount,
    //         createdAt: now,
    //     });
    // }

    // // regular challan heads
    // if (regularChallan) {
    //     for (const h of regularChallan.heads) {
    //         if (h.paid <= 0) continue;

    //         const allocRef = doc(collection(db, "payment_allocations"));

    //         batch.set(allocRef, {
    //             id: allocRef.id,
    //             paymentId,
    //             type: "challan_head",
    //             challanId: regularChallan.challanId,
    //             headId: h.headId,
    //             allocatedAmount: h.paid,
    //             createdAt: now,
    //         });
    //     }
    // }

    // // Commit all changes
    // await batch.commit();

    return {
        success: true,
        paymentId: "5222",
        challanId: regularChallan?.challanId ?? null,
    };
}
