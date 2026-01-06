import { getFirestoreInstance } from "context/firebaseUtility";
import { doc, getDoc } from "firebase/firestore";
import { StudentDetailsType } from "types/student";
import { TransportLocationType, TransportVehicleType } from "types/transport";

export const fetchStudentDetails = async (studentId: string): Promise<StudentDetailsType> => {
    const db = await getFirestoreInstance();
    const docPath = doc(db, "STUDENTS", studentId);
    const studentData = await getDoc(docPath);
    return studentData.data() as StudentDetailsType;
}

export const fetchTransportDetails = async (trasportLocationId: string, transportVehicleId: string): Promise<TransportLocationType & TransportVehicleType> => {
    const db = await getFirestoreInstance();
    const transportLocationDoc = await getDoc(doc(db, "TRANSPORT", "transportLocations"));

    const { locations, vehicles } = transportLocationDoc.data() || {};
    const location = locations?.find((loc: TransportLocationType) => loc.locationId === trasportLocationId);
    const vehicle = vehicles?.find((veh: TransportVehicleType) => veh.vehicleId === transportVehicleId);
    return { ...location, ...vehicle };

};