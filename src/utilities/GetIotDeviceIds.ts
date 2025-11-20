import { getFirestoreInstance } from "context/firebaseUtility";
import { doc, getDoc } from "firebase/firestore";

export const getIotDeviceIds = async (): Promise<string[]> => {
    const db = await getFirestoreInstance();
    try {
        const ref = doc(db, "CONFIG", "IOT_CONFIG");
        const snap = await getDoc(ref);

        if (!snap.exists()) return [];

        const data = snap.data();
        return data.attenzyDeviceIds || [];
    } catch (err) {
        console.error("Error fetching IoT device IDs:", err);
        return [];
    }
};
