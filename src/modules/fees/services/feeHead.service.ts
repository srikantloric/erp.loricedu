// services/feeHead.service.ts
import { getFirestoreInstance } from "context/firebaseUtility";
import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";


// --------------------------------------
// Hash Function (FNV-1a)
// --------------------------------------
const createHash = (str: string): number => {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash *= 16777619;
    }
    return Math.abs(hash % 100000);
};

// --------------------------------------
// Create ID like TUT_9345
// --------------------------------------
const createHashedHeadId = (title: string): string => {
    const clean = title.trim().toUpperCase().replace(/[^A-Z0-9 ]+/g, "");
    const prefix = clean.replace(/\s+/g, "").slice(0, 3);
    const hash = createHash(clean);
    return `${prefix}_${hash}`;
};

// --------------------------------------
// SAVE SERVICE WITH HASHED ID
// --------------------------------------
export const saveFeeHead = async (data: any) => {
    const db = await getFirestoreInstance();

    try {
        const headId = createHashedHeadId(data.name);

        await setDoc(doc(db, "FEE_HEADS", headId), {
            ...data,
            headId, // store inside doc too if needed
            amount: Number(data.amount),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { id: headId, headId, success: true };
    } catch (error) {
        return { success: false, error };
    }
};


export const getFeeHeads = async () => {
    const db = await getFirestoreInstance();

    try {
        const feeHeadRef = collection(db, "FEE_HEADS");
        const q = query(feeHeadRef, orderBy("createdAt", "desc")); // sort by title

        const snapshot = await getDocs(q);

        const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return { success: true, data: list };
    } catch (error) {
        return { success: false, error };
    }
};