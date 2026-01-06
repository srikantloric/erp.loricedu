import { getFirestoreInstance } from "context/firebaseUtility";
import { addDoc, arrayUnion, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { StudentDetailsType } from "types/student";
import { TransportLocationType, TransportVehicleType } from "types/transport";



export const fetchStudentTransportDetails = async (trasportLocationId: string, transportVehicleId: string): Promise<TransportLocationType & TransportVehicleType> => {
    const db = await getFirestoreInstance();
    const transportLocationDoc = await getDoc(doc(db, "TRANSPORT", "transportLocations"));
    if (transportLocationDoc.exists()) {
        const { locations, vehicles } = transportLocationDoc.data() || {};
        const location = locations?.find((loc: TransportLocationType) => loc.locationId === trasportLocationId);
        const vehicle = vehicles?.find((veh: TransportVehicleType) => veh.vehicleId === transportVehicleId);
        return { ...location, ...vehicle };
    } else {
        throw new Error("Transport details not found");
    }
};

export const fetchStudentDetails = async (studentId: string): Promise<StudentDetailsType> => {
    // Fetch student details from the Firestore
    const db = await getFirestoreInstance();
    const docPath = doc(db, "STUDENTS", studentId);
    const studentData = await getDoc(docPath);
    return studentData.data() as StudentDetailsType;
}

export async function saveFeeCollection(studentId: string, payload: any) {
    const db = await getFirestoreInstance();
    const col = collection(db, "STUDENTS", studentId, "FEE_COLLECTIONS");
    await addDoc(col, payload);
}

export async function updatePaidInstallments(studentId: string, ids: string[]) {
    const db = await getFirestoreInstance();
    const ref = doc(db, "STUDENTS", studentId);
    await updateDoc(ref, {
        paidInstallments: arrayUnion(...ids)
    });
}