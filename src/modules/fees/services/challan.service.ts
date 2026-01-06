import { doc, writeBatch } from "firebase/firestore";
import { Challan, ChallanFeeHead } from "../types/Challan";
import { getFirestoreInstance } from "context/firebaseUtility";
import { FeeHead } from "../types/FeeHeads";

export async function saveChallan(challan: Challan) {

    const db = await getFirestoreInstance()

    const batch = writeBatch(db);

    batch.set(doc(db, "CHALLANS", challan.challanId), challan);


    await batch.commit();
}

export const generateChallanId = () => {
    const now = new Date();
    const y = now.getFullYear();
    const uid = Math.floor(Math.random() * 900000 + 100000); // 6-digit

    return `MISC-${y}-${uid}`;
};

export const convertToChallanFeeHead = (head: FeeHead): ChallanFeeHead => ({
    headId: head.headId,
    headName: head.headName,
    amount: head.amount,
    paid: head.paidAmount ?? 0,
    concession: head.concessionAmount ?? 0,
});